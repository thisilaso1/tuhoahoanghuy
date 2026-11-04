import { Branch, BRANCHES, Stem, STEMS } from './types';

/**
 * Thuật toán Âm Lịch Việt Nam (Tác giả: TS. Hồ Ngọc Đức - Đại học Leipzig).
 * Tính toán thiên văn chính xác dựa trên tọa độ hoàng đạo Mặt Trời và các kỳ Sóc (New Moon).
 * Múi giờ chuẩn: UTC+7 (Việt Nam).
 * Hỗ trợ phạm vi: 1800 - 2199.
 * Đã kiểm nghiệm chuẩn xác:
 * - Tết Giáp Thìn: 10/02/2024 -> Mùng 1 Tháng 1 Năm 2024
 * - Tháng Nhuận Quý Mão: 22/03/2023 -> Mùng 1 Tháng 2 Nhuận Năm 2023
 */

function jdFromDate(d: number, m: number, y: number): number {
  const a = Math.floor((14 - m) / 12);
  const y1 = y + 4800 - a;
  const m1 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m1 + 2) / 5) +
    365 * y1 +
    Math.floor(y1 / 4) -
    Math.floor(y1 / 100) +
    Math.floor(y1 / 400) -
    32045
  );
}

function jdToDate(jd: number): [number, number, number] {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 = C1 - 0.0004 * Math.sin(3 * dr * Mpr);
  C1 = C1 + 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 = C1 - 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 = C1 + 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  const deltat =
    T < -4
      ? 0.0
      : T < -2
      ? 102.3 + 123.5 * T + 32.5 * T2
      : T < 0
      ? 5.3 + 3.8 * T - 3.2 * T2
      : -20 + 29.9 * T + 6.3 * T2;
  const JdNew = Jd1 + C1 - deltat / 86400.0;
  return Math.floor(JdNew + 0.5 + timeZone / 24.0);
}

function sunLongitude(jdn: number): number {
  const PI = Math.PI;
  const T = (jdn - 2451545.0) / 36525.0;
  const T2 = T * T;
  const dr = PI / 180.0;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M);
  DL += 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - 2 * PI * Math.floor(L / (2 * PI));
  return L;
}

function getSunLongitude(dayNumber: number, timeZone = 7): number {
  return Math.floor((sunLongitude(dayNumber - 0.5 - timeZone / 24.0) / Math.PI) * 6);
}

function getLunarMonth11(yy: number, timeZone = 7): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone = 7): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

// Chuyển đổi Dương Lịch -> Âm Lịch Việt Nam chuẩn mực
export function solarToLunar(
  dd: number,
  mm: number,
  yy: number,
  timeZone = 7
): { lDay: number; lMonth: number; lYear: number; isLeap: boolean } {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lYear = yy;

  if (a11 >= monthStart) {
    lYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29.0);
  let lMonth = diff + 11;
  let isLeap = false;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeap = true;
      }
    }
  }

  if (lMonth > 12) {
    lMonth -= 12;
  }
  if (lMonth >= 11 && diff < 4) {
    lYear -= 1;
  }

  return { lDay, lMonth, lYear, isLeap };
}

/** Convert a Vietnamese lunar date to its Gregorian date using the same UTC+7 new-moon model. */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeapMonth = false,
  timeZone = 7,
): { day: number; month: number; year: number } {
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30 || !Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    throw new RangeError('Ngày hoặc tháng âm lịch không hợp lệ.');
  }
  const a11 = lunarMonth < 11 ? getLunarMonth11(lunarYear - 1, timeZone) : getLunarMonth11(lunarYear, timeZone);
  const b11 = lunarMonth < 11 ? getLunarMonth11(lunarYear, timeZone) : getLunarMonth11(lunarYear + 1, timeZone);
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let offset = lunarMonth - 11;
  if (offset < 0) offset += 12;

  if (b11 - a11 > 365) {
    const leapOffset = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOffset - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (isLeapMonth && lunarMonth !== leapMonth) throw new RangeError('Tháng âm lịch nhuận không khớp với năm đã chọn.');
    if (isLeapMonth || offset >= leapOffset) offset += 1;
  } else if (isLeapMonth) {
    throw new RangeError('Năm âm lịch đã chọn không có tháng nhuận.');
  }

  const monthStart = getNewMoonDay(k + offset, timeZone);
  const monthLength = getNewMoonDay(k + offset + 1, timeZone) - monthStart;
  if (lunarDay > monthLength) throw new RangeError(`Tháng âm lịch này chỉ có ${monthLength} ngày.`);
  const [day, month, year] = jdToDate(monthStart + lunarDay - 1);
  return { day, month, year };
}

// Can Chi Năm
export function getYearCanChi(year: number): { stem: Stem; branch: Branch } {
  const stemIndex = (year + 6) % 10;
  const branchIndex = (year + 8) % 12;
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
  };
}

// Ngũ Hổ Độn: Tìm Can tháng
export function getMonthCanChi(yearStem: Stem, lunarMonth: number): { stem: Stem; branch: Branch } {
  const startStemMap: Record<Stem, number> = {
    Giáp: 2, Kỷ: 2,   // Bính Dần
    Ất: 4, Canh: 4,   // Mậu Dần
    Bính: 6, Tân: 6,  // Canh Dần
    Đinh: 8, Nhâm: 8, // Nhâm Dần
    Mậu: 0, Quý: 0,   // Giáp Dần
  };
  const startStem = startStemMap[yearStem];
  const monthStemIndex = (startStem + (lunarMonth - 1)) % 10;
  const monthBranchIndex = (2 + (lunarMonth - 1)) % 12; // Dần = 2

  return {
    stem: STEMS[monthStemIndex],
    branch: BRANCHES[monthBranchIndex],
  };
}

// Ranh giới giờ Tý (23:00 - 00:59)
export function getHourBranch(hour: number, minute = 0): Branch {
  const totalMinutes = hour * 60 + minute;
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return 'Tý';
  const branchIdx = Math.floor((totalMinutes - 60) / 120) + 1;
  return BRANCHES[branchIdx % 12];
}

export function getJulianDay(year: number, month: number, day: number): number {
  return jdFromDate(day, month, year);
}

// Can Chi Ngày từ Julian Day Number (với ranh giới giờ Tý từ 23h tính sang ngày mới)
export function getDayCanChi(year: number, month: number, day: number, hour = 0): { stem: Stem; branch: Branch } {
  let effectiveDay = day;
  let effectiveMonth = month;
  let effectiveYear = year;

  if (hour >= 23) {
    const nextJd = jdFromDate(day, month, year) + 1;
    const [d, m, y] = jdToDate(nextJd);
    effectiveDay = d;
    effectiveMonth = m;
    effectiveYear = y;
  }

  const jd = Math.floor(jdFromDate(effectiveDay, effectiveMonth, effectiveYear) + 0.5);
  const stemIndex = (jd + 9) % 10;
  const branchIndex = (jd + 1) % 12;
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
  };
}

// Ngũ Thử Độn: Can giờ dựa theo Can ngày
export function getHourCanChi(dayStem: Stem, hour: number, minute = 0): { stem: Stem; branch: Branch } {
  const branch = getHourBranch(hour, minute);
  const branchIndex = BRANCHES.indexOf(branch);

  const startHourStemMap: Record<Stem, number> = {
    Giáp: 0, Kỷ: 0,   // Giáp Tý
    Ất: 2, Canh: 2,   // Bính Tý
    Bính: 4, Tân: 4,  // Mậu Tý
    Đinh: 6, Nhâm: 6, // Canh Tý
    Mậu: 8, Quý: 8,   // Nhâm Tý
  };

  const startStem = startHourStemMap[dayStem] ?? 0;
  const stemIndex = (startStem + branchIndex) % 10;

  return {
    stem: STEMS[stemIndex],
    branch,
  };
}

export const NAP_AM_TABLE: Record<string, string> = {
  'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
  'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
  'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
  'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
  'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
  'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
  'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
  'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
  'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
  'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
  'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
  'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
  'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
  'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
  'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
  'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
  'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
  'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
  'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
  'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
  'Giáp Thìn': 'Phú Đăng Hỏa', 'Ất Tỵ': 'Phú Đăng Hỏa',
  'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
  'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ',
  'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
  'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
  'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
  'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
  'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
  'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
  'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy',
};
