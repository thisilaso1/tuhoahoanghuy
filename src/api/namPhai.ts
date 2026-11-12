import type { BirthInput, NatalChart } from '../domain/types';
import { getStarBrightness, NAM_PHAI_FULL_PROFILE_ID } from '../domain/starBrightness';
import { STAR_ID_BY_NAME } from '../domain/starElements';

export function palaceReadingPayload(chart: NatalChart, palaceIndex: number, refresh = false) {
  const palace = chart.palaces.find(value => value.index === palaceIndex);
  if (!palace) throw new Error('Cung không hợp lệ.');
  const codes: Record<string, string | null> = { Miếu: 'M', Vượng: 'V', Đắc: 'Đ', Bình: 'B', Hãm: 'H', UNSPECIFIED: null };
  const stars = (items: typeof palace.majorStars) => items.map(star => ({ ten: star.name,
    do_sang: codes[getStarBrightness(STAR_ID_BY_NAME[star.name] ?? star.id ?? star.name, palace.branch, NAM_PHAI_FULL_PROFILE_ID)] ?? null }));
  return { school: 'nam_phai', birthInput: birthInputFromChart(chart), palaceIndex, refresh,
    cung_vi: { index: palace.index, ten: palace.name, thien_can: palace.stem, dia_chi: palace.branch,
      gioi_tinh: chart.gender, can_chi: chart.birthCanChi, chinh_tinh: stars(palace.majorStars), phu_tinh: stars(palace.minorStars),
      tuan: Boolean(palace.tuan), triet: Boolean(palace.triet), dai_han: palace.decade, nam_xem: chart.forecastYear } };
}

export function birthInputFromChart(chart: NatalChart): BirthInput {
  return { name: chart.name, date: chart.solarDate, time: chart.time, gender: chart.gender,
    calendar: 'solar', forecastYear: chart.forecastYear };
}
export async function generateServerNamPhaiChart(input: BirthInput): Promise<NatalChart> {
  const response = await fetch('/api/charts/nam-phai', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ school: 'nam_phai', birthInput: input }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? 'Không kết nối được bộ an sao Nam Phái trên máy chủ.');
  return result.chart;
}
export interface PalaceReading {
  stage: 'cung_vi' | 'tam_hop' | 'xung_chieu' | 'giap_cung';
  palaceIndex: number; palaceName: string;
  luan_giai: { tong_quan: string; mat_thuan: string[]; diem_can_luu_y: string[]; thong_tin_con_thieu: string[] };
  // Readings of the separate phụ tinh, giáp cung and xung chiếu models.
  luan_phu_tinh?: RelationReading[]; luan_giap_cung?: RelationReading[]; luan_xung_chieu?: RelationReading[];
  sources: { title: string }[]; model: string; adapter: boolean;
}
export interface ReadingJob {
  id: string; status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  cursor: number; total: number; results: PalaceReading[]; error: string | null;
  current: { stage: PalaceReading['stage']; palaceName: string } | null;
  chart: { name: string; solarDate: string; time: string; forecastYear: number };
}
export async function readingRequest(path = '', body?: unknown): Promise<ReadingJob> {
  const response = await fetch('/api/auth/ai/readings' + path, {
    ...(body !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(response.status === 401 ? 'Vui lòng đăng nhập để luận lá số.'
    : data.error === 'reading_already_active' ? 'Bạn đang có một lá số khác được luận. Hãy chờ hoàn tất hoặc dừng bản đang chạy.'
    : data.message ?? 'Không thể xử lý yêu cầu luận giải. Vui lòng thử lại.');
  return data;
}
export interface RelationReading { loai: 'phu_tinh' | 'cach'; ten: string; quan_he?: string | null; luan_giai: string }
