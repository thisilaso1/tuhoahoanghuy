import type { BirthInput, NatalChart } from '../domain/types';

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
