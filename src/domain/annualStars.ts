import { Branch, BRANCHES, NatalChart } from './types';
import { getYearCanChi } from './lunarCalendar';
import { getLocTonBranchIndex, getThienMaBranchIndex } from './tuViEngine';
import { NAM_PHAI_FULL_PROFILE_ID } from './starBrightness';

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
  brightness: 'UNSPECIFIED';
  placementRuleId: string;
  brightnessProfileId: string;
  verified: boolean;
  element?: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
}

const ANNUAL_CORE_STARS = [
  { name: 'Thái Tuế', element: 'Hỏa', rule: 'ANNUAL_BRANCH_THAI_TUE_V1' },
  { name: 'Tang Môn', element: 'Mộc', rule: 'ANNUAL_BRANCH_TANG_MON_V1' },
  { name: 'Bạch Hổ', element: 'Kim', rule: 'ANNUAL_BRANCH_BACH_HO_V1' },
  { name: 'Thiên Khốc', rule: 'ANNUAL_BRANCH_THIEN_KHOC_V1' },
  { name: 'Thiên Hư', rule: 'ANNUAL_BRANCH_THIEN_HU_V1' },
  { name: 'Lộc Tồn', element: 'Thổ', rule: 'ANNUAL_STEM_LOC_TON_V1' },
  { name: 'Kình Dương', element: 'Kim', rule: 'ANNUAL_STEM_KINH_DUONG_V1' },
  { name: 'Đà La', element: 'Kim', rule: 'ANNUAL_STEM_DA_LA_V1' },
  { name: 'Thiên Mã', element: 'Hỏa', rule: 'ANNUAL_BRANCH_THIEN_MA_V1' },
] as const;

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
  };
  const palaceByBranch = new Map(chart.palaces.map((palace) => [palace.index, palace]));

  const stars = ANNUAL_CORE_STARS.map((definition) => {
    const branchIndex = positions[definition.name];
    const palace = palaceByBranch.get(branchIndex);
    if (!palace) throw new Error(`Không tìm thấy cung cho Lưu ${definition.name} tại index ${branchIndex}.`);
    const baseStarId = definition.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    return {
      id: `ANNUAL:${targetLunarYear}:${baseStarId}`,
      baseStarId,
      name: `Lưu ${definition.name}`,
      annualYear: targetLunarYear,
      branch: palace.branch,
      branchIndex,
      palaceId: `palace-${branchIndex}`,
      palaceName: palace.name,
      brightness: 'UNSPECIFIED' as const,
      placementRuleId: definition.rule,
      brightnessProfileId: `${NAM_PHAI_FULL_PROFILE_ID}:ANNUAL_UNSPECIFIED_V1`,
      verified: true,
      element: 'element' in definition ? definition.element : undefined,
    };
  });

  if (stars.length !== 9 || new Set(stars.map(({ id }) => id)).size !== 9) {
    throw new Error('Bộ Lưu Niên cốt lõi phải có đủ 9 định danh riêng biệt.');
  }
  return stars;
}
