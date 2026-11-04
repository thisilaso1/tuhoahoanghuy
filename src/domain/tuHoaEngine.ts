import { Branch, NatalChart, Palace, Stem, STEMS, TransformationType } from './types';

export type TuHoaSchool = 'kham_thien' | 'nam_phai';
export type TransformationProfileId = 'KHAM_THIEN_V1' | 'NAM_PHAI_CLASSIC_V1';

export function getTransformationProfileId(school: TuHoaSchool): TransformationProfileId {
  return school === 'kham_thien' ? 'KHAM_THIEN_V1' : 'NAM_PHAI_CLASSIC_V1';
}

export const TU_HOA_CARRIER_STARS = [
  'Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh',
  'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương',
  'Thất Sát', 'Phá Quân', 'Văn Xương', 'Văn Khúc', 'Tả Phù', 'Hữu Bật',
] as const;

// Bảng Tứ Hóa Khâm Thiên Môn (Bắc Phái)
export const TU_HOA_KHAM_THIEN: Record<Stem, Record<TransformationType, string>> = {
  Giáp: { Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' },
  Ất: { Lộc: 'Thiên Cơ', Quyền: 'Thiên Lương', Khoa: 'Tử Vi', Kỵ: 'Thái Âm' },
  Bính: { Lộc: 'Thiên Đồng', Quyền: 'Thiên Cơ', Khoa: 'Văn Xương', Kỵ: 'Liêm Trinh' },
  Đinh: { Lộc: 'Thái Âm', Quyền: 'Thiên Đồng', Khoa: 'Thiên Cơ', Kỵ: 'Cự Môn' },
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Hữu Bật', Kỵ: 'Thiên Cơ' },
  Kỷ: { Lộc: 'Vũ Khúc', Quyền: 'Tham Lang', Khoa: 'Thiên Lương', Kỵ: 'Văn Khúc' },
  Canh: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thái Âm', Kỵ: 'Thiên Đồng' },
  Tân: { Lộc: 'Cự Môn', Quyền: 'Thái Dương', Khoa: 'Văn Khúc', Kỵ: 'Văn Xương' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Tả Phù', Kỵ: 'Vũ Khúc' },
  Quý: { Lộc: 'Phá Quân', Quyền: 'Cự Môn', Khoa: 'Thái Âm', Kỵ: 'Tham Lang' },
};

// Bảng Tứ Hóa Nam Phái (Toàn Thư - Canh: Nhật Vũ Đồng Âm, Tân: Cự Dương Khúc Xương, Nhâm: Lương Tử Phủ Vũ)
export const TU_HOA_NAM_PHAI: Record<Stem, Record<TransformationType, string>> = {
  ...TU_HOA_KHAM_THIEN,
  Canh: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thiên Đồng', Kỵ: 'Thái Âm' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Thiên Phủ', Kỵ: 'Vũ Khúc' },
};

export function getTuHoaRules(school: TuHoaSchool = 'kham_thien'): Record<Stem, Record<TransformationType, string>> {
  return school === 'kham_thien' ? TU_HOA_KHAM_THIEN : TU_HOA_NAM_PHAI;
}

export interface FlyingTransformation {
  id: string;
  profileId: TransformationProfileId;
  layer: 'NATAL_PALACE';
  sourcePalaceId: string;
  sourcePalaceIndex: number;
  sourcePalaceName: string;
  sourceStem: Stem;
  targetPalaceId: string;
  targetPalaceIndex: number;
  targetPalaceName: string;
  type: TransformationType;
  star: string;
  isSelfTransformation: boolean; // Tự hóa
  mode: 'flying' | 'ly_tam' | 'huong_tam';
  direction: 'NORMAL' | 'LY_TAM' | 'HUONG_TAM';
  description: string;
}

export interface BirthYearTransformation {
  id: string;
  profileId: TransformationProfileId;
  layer: 'NATAL';
  type: TransformationType;
  yearStem: Stem;
  star: string;
  targetBranch: Branch;
  palaceIndex: number;
  palaceName: string;
  meaning: string;
}

function locateCarrierStar(chart: NatalChart, starName: string): Palace {
  const matches = chart.palaces.filter((palace) =>
    palace.majorStars.some((star) => star.name === starName)
    || palace.minorStars.some((star) => star.name === starName)
  );
  if (matches.length !== 1) {
    throw new Error(`Khâm Thiên Tứ Hóa cần đúng một sao mang hóa “${starName}”; tìm thấy ${matches.length}.`);
  }
  return matches[0];
}

function assertTransformationInputs(chart: NatalChart): void {
  if (chart.palaces.length !== 12) {
    throw new Error(`Khâm Thiên cần đúng 12 cung; hiện có ${chart.palaces.length}.`);
  }
  const invalidCarriers = validateTransformationCarriers(chart);
  if (invalidCarriers.length) {
    throw new Error(`Bộ 18 sao nhận Tứ Hóa thiếu hoặc trùng: ${invalidCarriers.join(', ')}.`);
  }
  const palaceIndexes = new Set(chart.palaces.map((palace) => palace.index));
  if (palaceIndexes.size !== 12 || chart.palaces.some((palace) => !Number.isInteger(palace.index) || palace.index < 0 || palace.index > 11)) {
    throw new Error('12 cung phải có chỉ số duy nhất từ 0 đến 11.');
  }
}

export function validateTransformationCarriers(chart: NatalChart): string[] {
  return TU_HOA_CARRIER_STARS.filter((starName) => {
    const matches = chart.palaces.reduce((count, palace) => count
      + palace.majorStars.filter((star) => star.name === starName).length
      + palace.minorStars.filter((star) => star.name === starName).length, 0);
    return matches !== 1;
  });
}

// Khảo sát Sinh Niên Tứ Hóa (Tứ Hóa gốc của năm sinh)
export function getBirthYearTransformations(
  chart: NatalChart,
  school: TuHoaSchool = 'kham_thien',
): BirthYearTransformation[] {
  assertTransformationInputs(chart);
  const rules = getTuHoaRules(school)[chart.birthCanChi.year.stem];
  const results: BirthYearTransformation[] = [];

  const typeMeanings: Record<TransformationType, string> = {
    Lộc: 'Duyên khởi, phúc báo, tiền tài dồi dào, tình cảm bao dung, khởi đầu thuận lợi.',
    Quyền: 'Chủ quyền, quyền lực, ý chí kiên định, hành động quyết liệt, danh vọng.',
    Khoa: 'Trí tuệ, danh tiếng, văn tinh hóa giải tai ách, học vấn, quý nhân tương trợ.',
    Kỵ: 'Chấp niệm, thu tàng, áp lực, duyên nợ sâu sắc, nơi hao tổn tâm lực nhưng cũng là điểm quy tụ.',
  };

  for (const [typeStr, star] of Object.entries(rules)) {
    const type = typeStr as TransformationType;
    // Tìm cung nào chứa star này
    const targetPalace = locateCarrierStar(chart, star);
    results.push({
      id: `${getTransformationProfileId(school)}:NATAL:${chart.birthCanChi.year.stem}:${type}:${star}`,
      profileId: getTransformationProfileId(school),
      layer: 'NATAL',
      type,
      yearStem: chart.birthCanChi.year.stem,
      star,
      targetBranch: targetPalace.branch,
      palaceIndex: targetPalace.index,
      palaceName: targetPalace.name,
      meaning: `${type} tọa ${targetPalace.name} (${star}): ${typeMeanings[type]}`,
    });
  }

  return results;
}

// Khảo sát Lưu Niên Tứ Hóa (Tứ Hóa theo năm xem)
export function getAnnualTransformations(
  chart: NatalChart,
  forecastYear: number,
  school: TuHoaSchool = 'kham_thien',
): Array<{
  type: TransformationType;
  star: string;
  palaceIndex: number;
  palaceName: string;
}> {
  assertTransformationInputs(chart);
  const stem = STEMS[(forecastYear + 6) % 10];
  const rules = getTuHoaRules(school)[stem];
  const results: Array<{ type: TransformationType; star: string; palaceIndex: number; palaceName: string }> = [];

  for (const [typeStr, star] of Object.entries(rules)) {
    const type = typeStr as TransformationType;
    const targetPalace = locateCarrierStar(chart, star);
    results.push({ type, star, palaceIndex: targetPalace.index, palaceName: targetPalace.name });
  }

  return results;
}

// Phân tích toàn bộ hệ thống Phi Tinh và Tự Hóa (Khâm Thiên Môn)
export function calculateAllFlyingTransformations(
  chart: NatalChart,
  school: TuHoaSchool = 'kham_thien',
): FlyingTransformation[] {
  const rulesTable = getTuHoaRules(school);
  const transformations: FlyingTransformation[] = [];
  assertTransformationInputs(chart);
  const profileId = getTransformationProfileId(school);

  chart.palaces.forEach((sourcePalace) => {
    const rules = rulesTable[sourcePalace.stem];

    (Object.entries(rules) as [TransformationType, string][]).forEach(([type, star]) => {
      // Tìm xem sao này đang ngự tại cung nào
      const targetPalace = locateCarrierStar(chart, star);

      const isSelf = targetPalace.index === sourcePalace.index;
      // Cung đối chiếu: cách 6 cung (Xung chiếu)
      const oppositeIndex = (sourcePalace.index + 6) % 12;
      const isOpposite = targetPalace.index === oppositeIndex;

      let mode: 'flying' | 'ly_tam' | 'huong_tam' = 'flying';
      let desc = `Cung ${sourcePalace.name} can ${sourcePalace.stem} hóa ${type} (${star}) nhập cung ${targetPalace.name}`;

      if (isSelf) {
        mode = 'ly_tam';
        desc = `[Tự Hóa Ly Tâm] Cung ${sourcePalace.name} can ${sourcePalace.stem} tự hóa ${type} (${star}) xuất ra ngoại cảnh`;
      } else if (isOpposite) {
        mode = 'huong_tam';
        desc = `[Tự Hóa Hướng Tâm] Can ${sourcePalace.stem} từ ${sourcePalace.name} phóng ${type} (${star}) chiếu thẳng đối cung ${targetPalace.name}`;
      }

      transformations.push({
        id: `${profileId}:NATAL_PALACE:${sourcePalace.index}:${type}`,
        profileId,
        layer: 'NATAL_PALACE',
        sourcePalaceId: `palace-${sourcePalace.index}`,
        sourcePalaceIndex: sourcePalace.index,
        sourcePalaceName: sourcePalace.name,
        sourceStem: sourcePalace.stem,
        targetPalaceId: `palace-${targetPalace.index}`,
        targetPalaceIndex: targetPalace.index,
        targetPalaceName: targetPalace.name,
        type,
        star,
        isSelfTransformation: isSelf,
        mode,
        direction: mode === 'ly_tam' ? 'LY_TAM' : mode === 'huong_tam' ? 'HUONG_TAM' : 'NORMAL',
        description: desc,
      });
    });
  });

  if (transformations.length !== 48) {
    throw new Error(`Khâm Thiên cần đúng 48 cạnh Phi Hóa; đã tính ${transformations.length}.`);
  }
  return transformations;
}

// Lấy thông tin Tứ Hóa trọng tâm của một cung cụ thể
export function getPalaceTransformationProfile(
  chart: NatalChart,
  palaceIndex: number,
  school: TuHoaSchool = 'kham_thien',
) {
  const all = calculateAllFlyingTransformations(chart, school);
  const outgoing = all.filter((t) => t.sourcePalaceIndex === palaceIndex);
  const incoming = all.filter((t) => t.targetPalaceIndex === palaceIndex && t.sourcePalaceIndex !== palaceIndex);
  const self = outgoing.filter((t) => t.isSelfTransformation);

  return {
    outgoing,
    incoming,
    self,
  };
}
