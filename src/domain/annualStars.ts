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
  { name: 'Thiếu Dương', element: 'Hỏa', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Thiếu Âm', element: 'Thủy', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Quan Phù', element: 'Hỏa', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Tử Phù', element: 'Hỏa', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Tuế Phá', element: 'Hỏa', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Long Đức', element: 'Thủy', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Phúc Đức', element: 'Thổ', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Điếu Khách', element: 'Hỏa', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Trực Phù', element: 'Hỏa', rule: 'ANNUAL_THAI_TUE_RING_V1' },
  { name: 'Thiên Khôi', element: 'Hỏa', rule: 'ANNUAL_STEM_KHOI_VIET_V1' },
  { name: 'Thiên Việt', element: 'Hỏa', rule: 'ANNUAL_STEM_KHOI_VIET_V1' },
  { name: 'Văn Xương', element: 'Kim', rule: 'ANNUAL_STEM_VAN_XUONG_V1' },
  { name: 'Văn Khúc', element: 'Thủy', rule: 'ANNUAL_STEM_VAN_KHUC_V1' },
  { name: 'Đào Hoa', element: 'Mộc', rule: 'ANNUAL_BRANCH_DAO_HOA_V1' },
  { name: 'Hồng Loan', element: 'Thủy', rule: 'ANNUAL_BRANCH_HONG_LOAN_V1' },
  { name: 'Thiên Hỷ', element: 'Thủy', rule: 'ANNUAL_BRANCH_THIEN_HY_V1' },
] as const;

export function calculateAnnualStars(chart: NatalChart, targetLunarYear: number): AnnualStar[] {
  if (!Number.isInteger(targetLunarYear) || targetLunarYear < 1800 || targetLunarYear > 2199) {
    throw new RangeError('Năm xem sao lưu phải nằm trong khoảng 1800–2199.');
  }
  const yearCanChi = getYearCanChi(targetLunarYear);
  const yearBranchIndex = BRANCHES.indexOf(yearCanChi.branch);
  const locTonIndex = getLocTonBranchIndex(yearCanChi.stem);
  const tangMonIndex = mod12(yearBranchIndex + 2);
  const thaiTueRing = ['Thái Tuế','Thiếu Dương','Tang Môn','Thiếu Âm','Quan Phù','Tử Phù','Tuế Phá','Long Đức','Bạch Hổ','Phúc Đức','Điếu Khách','Trực Phù'];
  const khoiViet: Record<string, [number, number]> = {
    Giáp: [1,7], Ất: [0,8], Bính: [11,9], Đinh: [11,9], Mậu: [1,7],
    Kỷ: [0,8], Canh: [1,7], Tân: [2,6], Nhâm: [3,5], Quý: [3,5],
  };
  const stemIndex = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'].indexOf(yearCanChi.stem);
  const daoHoaByGroup: Record<number, number> = { 0: 9, 1: 6, 2: 3, 3: 0 };
  const annualPositions: Record<string, number> = {};
  thaiTueRing.forEach((name, offset) => { annualPositions[name] = mod12(yearBranchIndex + offset); });
  annualPositions['Thiên Khôi'] = khoiViet[yearCanChi.stem][0];
  annualPositions['Thiên Việt'] = khoiViet[yearCanChi.stem][1];
  annualPositions['Văn Xương'] = mod12(10 - stemIndex);
  annualPositions['Văn Khúc'] = mod12(4 + stemIndex);
  annualPositions['Đào Hoa'] = daoHoaByGroup[yearBranchIndex % 4];
  annualPositions['Hồng Loan'] = mod12(3 - yearBranchIndex);
  annualPositions['Thiên Hỷ'] = mod12(annualPositions['Hồng Loan'] + 6);
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
    ...annualPositions,
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

  if (stars.length !== ANNUAL_CORE_STARS.length || new Set(stars.map(({ id }) => id)).size !== stars.length) {
    throw new Error('Bộ sao Lưu Niên phải có đủ định danh riêng biệt theo profile.');
  }
  return stars;
}
