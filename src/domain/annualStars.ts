import { Branch, BRANCHES, NatalChart } from './types';
import { getYearCanChi } from './lunarCalendar';
import { getLocTonBranchIndex, getThienMaBranchIndex } from './tuViEngine';
import { ANNUAL_BRIGHTNESS_POLICY, BrightnessValue, getStarBrightness, NAM_PHAI_BRIGHTNESS_PROFILE_ID } from './starBrightness';
import { NAM_PHAI_ANNUAL_STAR_REGISTRY } from './namPhaiStarRegistry';

const mod12 = (value: number) => ((value % 12) + 12) % 12;

export interface AnnualStar {
  id: string;
  baseStarId: string;
  name: string;
  annualYear: number;
  branch: Branch;
  branchIndex: number;
  palaceId: string;
  palaceName: string;
  brightness: BrightnessValue;
  placementRuleId: string;
  brightnessProfileId: string;
  verified: boolean;
  element?: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
}

const ANNUAL_CORE_STARS = [
  { name: 'Thái Tuế', element: 'Hỏa', rule: 'ANNUAL_YEAR_BRANCH_THAI_TUE_RING_V1' },
  { name: 'Tang Môn', element: 'Mộc', rule: 'ANNUAL_YEAR_BRANCH_THAI_TUE_RING_V1' },
  { name: 'Bạch Hổ', element: 'Kim', rule: 'ANNUAL_YEAR_BRANCH_THAI_TUE_RING_V1' },
  { name: 'Thiên Khốc', rule: 'ANNUAL_YEAR_BRANCH_THIEN_KHOC_V1' },
  { name: 'Thiên Hư', rule: 'ANNUAL_YEAR_BRANCH_THIEN_HU_V1' },
  { name: 'Lộc Tồn', element: 'Thổ', rule: 'ANNUAL_YEAR_STEM_LOC_TON_V1' },
  { name: 'Kình Dương', element: 'Kim', rule: 'ANNUAL_YEAR_STEM_KINH_DUONG_V1' },
  { name: 'Đà La', element: 'Kim', rule: 'ANNUAL_YEAR_STEM_DA_LA_V1' },
  { name: 'Thiên Mã', element: 'Hỏa', rule: 'ANNUAL_YEAR_BRANCH_THIEN_MA_V1' },
  // Restored annual auspicious/peach-blossom stars (removed in e3b77af), plus Lưu Kiếp Sát.
  { name: 'Thiên Khôi', element: 'Hỏa', rule: 'ANNUAL_YEAR_STEM_KHOI_VIET_V1' },
  { name: 'Thiên Việt', element: 'Hỏa', rule: 'ANNUAL_YEAR_STEM_KHOI_VIET_V1' },
  { name: 'Văn Xương', element: 'Kim', rule: 'ANNUAL_YEAR_STEM_VAN_XUONG_V1' },
  { name: 'Văn Khúc', element: 'Thủy', rule: 'ANNUAL_YEAR_STEM_VAN_KHUC_V1' },
  { name: 'Đào Hoa', element: 'Mộc', rule: 'ANNUAL_YEAR_BRANCH_DAO_HOA_V1' },
  { name: 'Hồng Loan', element: 'Thủy', rule: 'ANNUAL_YEAR_BRANCH_HONG_LOAN_V1' },
  { name: 'Thiên Hỷ', element: 'Thủy', rule: 'ANNUAL_YEAR_BRANCH_THIEN_HY_V1' },
  { name: 'Kiếp Sát', element: 'Hỏa', rule: 'ANNUAL_YEAR_BRANCH_KIEP_SAT_V1' },
] as const;

// Same tables as the natal stars, keyed by the viewing year's Can/Chi.
const KHOI_VIET_BY_STEM: Record<string, [number, number]> = {
  Giáp: [1, 7], Ất: [0, 8], Bính: [11, 9], Đinh: [11, 9], Mậu: [1, 7],
  Kỷ: [0, 8], Canh: [6, 2], Tân: [6, 2], Nhâm: [3, 5], Quý: [3, 5], // Canh Tân phùng Mã Hổ
};
const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

// Fail at development/test time if the calculation definitions drift from the
// locked annual registry; the registry is the coverage contract.
if (ANNUAL_CORE_STARS.length !== NAM_PHAI_ANNUAL_STAR_REGISTRY.length
  || ANNUAL_CORE_STARS.some(({ name, rule }) => !NAM_PHAI_ANNUAL_STAR_REGISTRY.some((star) => star.displayName === `Lưu ${name}` && star.calculationRuleId === rule))) {
  throw new Error('Nam Phái annual calculation and registry definitions differ.');
}

export function calculateAnnualStars(chart: NatalChart, targetLunarYear: number): AnnualStar[] {
  if (!Number.isInteger(targetLunarYear) || targetLunarYear < 1800 || targetLunarYear > 2199) {
    throw new RangeError('Năm xem sao lưu phải nằm trong khoảng 1800–2199.');
  }
  const yearCanChi = getYearCanChi(targetLunarYear);
  const yearBranchIndex = BRANCHES.indexOf(yearCanChi.branch);
  const locTonIndex = getLocTonBranchIndex(yearCanChi.stem);
  const tangMonIndex = mod12(yearBranchIndex + 2);
  const positions: Record<string, number> = {
    'Thái Tuế': yearBranchIndex,
    'Tang Môn': tangMonIndex,
    'Bạch Hổ': mod12(tangMonIndex + 6),
    'Thiên Khốc': mod12(6 - yearBranchIndex),
    'Thiên Hư': mod12(6 + yearBranchIndex),
    'Lộc Tồn': locTonIndex,
    'Kình Dương': mod12(locTonIndex + 1),
    'Đà La': mod12(locTonIndex - 1),
    'Thiên Mã': getThienMaBranchIndex(yearCanChi.branch),
    'Thiên Khôi': KHOI_VIET_BY_STEM[yearCanChi.stem][0],
    'Thiên Việt': KHOI_VIET_BY_STEM[yearCanChi.stem][1],
    'Văn Xương': mod12(10 - STEMS.indexOf(yearCanChi.stem)),
    'Văn Khúc': mod12(4 + STEMS.indexOf(yearCanChi.stem)),
    'Đào Hoa': ({ 0: 9, 1: 6, 2: 3, 3: 0 } as Record<number, number>)[yearBranchIndex % 4],
    'Hồng Loan': mod12(3 - yearBranchIndex),
    'Thiên Hỷ': mod12(3 - yearBranchIndex + 6),
    'Kiếp Sát': ({ 0: 5, 1: 2, 2: 11, 3: 8 } as Record<number, number>)[yearBranchIndex % 4],
  };
  const palaceByBranch = new Map(chart.palaces.map((palace) => [palace.index, palace]));

  const stars = ANNUAL_CORE_STARS.map((definition) => {
    const branchIndex = positions[definition.name];
    const palace = palaceByBranch.get(branchIndex);
    if (!palace) throw new Error(`Không tìm thấy cung cho Lưu ${definition.name} tại index ${branchIndex}.`);
    const baseStarId = definition.name.replace(/[Đđ]/g, (value) => value === 'Đ' ? 'D' : 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    return {
      id: `ANNUAL:${targetLunarYear}:${baseStarId}`,
      baseStarId,
      name: `Lưu ${definition.name}`,
      annualYear: targetLunarYear,
      branch: palace.branch,
      branchIndex,
      palaceId: `palace-${branchIndex}`,
      palaceName: palace.name,
      brightness: ANNUAL_BRIGHTNESS_POLICY.useBaseStarBrightness
        ? getStarBrightness(baseStarId, palace.branch, NAM_PHAI_BRIGHTNESS_PROFILE_ID)
        : 'UNSPECIFIED' as const,
      placementRuleId: definition.rule,
      brightnessProfileId: NAM_PHAI_BRIGHTNESS_PROFILE_ID,
      verified: true,
      element: 'element' in definition ? definition.element : undefined,
    };
  });

  if (stars.length !== ANNUAL_CORE_STARS.length || new Set(stars.map(({ id }) => id)).size !== stars.length) {
    throw new Error('Bộ sao Lưu Niên phải có đủ định danh riêng biệt theo profile.');
  }
  return stars;
}
