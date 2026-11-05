import { BRANCHES, Branch, NatalChart, PALACE_NAMES } from './types';
import { getYearCanChi, lunarToSolar, solarToLunar } from './lunarCalendar';

export type MonthlyLimitMethod = 'tieu_han' | 'fixed_branch';

export const ANNUAL_LIMIT_PROFILE_ID = 'TIEU_HAN_NAM_THUAN_NU_NGHICH_V1';
export const MONTHLY_LIMIT_PROFILE_ID = 'NGUYET_HAN_TIEU_HAN_NGHICH_THANG_THUAN_GIO_V1';

const TIEU_HAN_START: Record<Branch, Branch> = {
  Dần: 'Thìn', Ngọ: 'Thìn', Tuất: 'Thìn',
  Thân: 'Tuất', Tý: 'Tuất', Thìn: 'Tuất',
  Tỵ: 'Mùi', Dậu: 'Mùi', Sửu: 'Mùi',
  Hợi: 'Sửu', Mão: 'Sửu', Mùi: 'Sửu',
};

const mod12 = (value: number) => ((value % 12) + 12) % 12;

export interface MonthlyLimit {
  month: number;
  isLeapMonth: false;
  branchIndex: number;
  palaceId: string;
  palaceName: string;
}

export interface AnnualLimitState {
  targetLunarYear: number;
  lunarAge: number;
  tieuHan: { branchIndex: number; palaceId: string; palaceName: string };
  monthlyLimits: MonthlyLimit[];
  selectedLunarMonth: number;
  profileId: string;
}

export function calculateTieuHanBranchIndex(
  birthYearBranch: Branch,
  birthLunarYear: number,
  targetLunarYear: number,
  gender: NatalChart['gender'],
): number {
  const startBranch = TIEU_HAN_START[birthYearBranch];
  const start = BRANCHES.indexOf(startBranch);
  const lunarAge = targetLunarYear - birthLunarYear + 1;
  if (!Number.isInteger(targetLunarYear) || !Number.isInteger(lunarAge) || lunarAge < 1) {
    throw new RangeError('Năm âm lịch đang xem phải từ năm sinh âm lịch trở đi.');
  }
  const direction = gender === 'Nam' ? 1 : -1;
  return mod12(start + direction * (lunarAge - 1));
}

export function calculateFirstMonthlyLimitBranchIndex(
  tieuHanBranchIndex: number,
  birthLunarMonth: number,
  birthHourBranch: Branch,
): number {
  if (!Number.isInteger(birthLunarMonth) || birthLunarMonth < 1 || birthLunarMonth > 12) {
    throw new RangeError('Tháng sinh âm lịch phải nằm trong khoảng 1–12.');
  }
  return mod12(tieuHanBranchIndex - (birthLunarMonth - 1) + BRANCHES.indexOf(birthHourBranch));
}

export function getAnnualAgeAtBranch(
  birthYearBranch: Branch,
  gender: NatalChart['gender'],
  branchIndex: number,
): number {
  const start = BRANCHES.indexOf(TIEU_HAN_START[birthYearBranch]);
  const direction = gender === 'Nam' ? 1 : -1;
  return mod12((branchIndex - start) * direction) + 1;
}

export function calculateAnnualLimitState(
  chart: Pick<NatalChart, 'gender' | 'lunarDate' | 'birthCanChi' | 'palaces'>,
  targetLunarYear: number,
  selectedLunarMonth = 1,
  monthlyMethod: MonthlyLimitMethod = 'tieu_han',
): AnnualLimitState {
  if (!Number.isInteger(selectedLunarMonth) || selectedLunarMonth < 1 || selectedLunarMonth > 12) {
    throw new RangeError('Tháng hạn phải nằm trong khoảng 1–12.');
  }
  const tieuHanBranchIndex = calculateTieuHanBranchIndex(
    chart.birthCanChi.year.branch,
    chart.lunarDate.year,
    targetLunarYear,
    chart.gender,
  );
  const firstMonthIndex = monthlyMethod === 'fixed_branch' ? BRANCHES.indexOf('Dần') : calculateFirstMonthlyLimitBranchIndex(
    tieuHanBranchIndex,
    chart.lunarDate.month,
    chart.birthCanChi.hour.branch,
  );
  const palaceByBranch = new Map(chart.palaces.map((palace) => [palace.index, palace]));
  const tieuHanPalace = palaceByBranch.get(tieuHanBranchIndex);
  if (!tieuHanPalace) throw new Error(`Không tìm thấy cung tại địa chi index ${tieuHanBranchIndex}.`);

  const monthlyLimits = Array.from({ length: 12 }, (_, offset) => {
    const branchIndex = mod12(firstMonthIndex + offset);
    const palace = palaceByBranch.get(branchIndex);
    if (!palace) throw new Error(`Không tìm thấy cung cho Nguyệt Hạn tháng ${offset + 1}.`);
    return {
      month: offset + 1,
      isLeapMonth: false as const,
      branchIndex,
      palaceId: `palace-${branchIndex}`,
      palaceName: palace.name,
    };
  });

  return {
    targetLunarYear,
    lunarAge: targetLunarYear - chart.lunarDate.year + 1,
    tieuHan: {
      branchIndex: tieuHanBranchIndex,
      palaceId: `palace-${tieuHanBranchIndex}`,
      palaceName: tieuHanPalace.name,
    },
    monthlyLimits,
    selectedLunarMonth,
    profileId: `${ANNUAL_LIMIT_PROFILE_ID}+${monthlyMethod === 'fixed_branch' ? 'NGUYET_HAN_FIXED_BRANCH_V1' : MONTHLY_LIMIT_PROFILE_ID}`,
  };
}

export function getAnnualPalaceNames(year: number) {
  const menhIndex = BRANCHES.indexOf(getYearCanChi(year).branch);
  return BRANCHES.map((_, index) => PALACE_NAMES[mod12(index - menhIndex)]);
}

export function getLeapLunarMonth(year: number): number | undefined {
  for (let month = 1; month <= 12; month++) {
    try {
      const solar = lunarToSolar(1, month, year, true);
      const lunar = solarToLunar(solar.day, solar.month, solar.year);
      if (lunar.isLeap && lunar.lMonth === month && lunar.lYear === year) return month;
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  }
}
