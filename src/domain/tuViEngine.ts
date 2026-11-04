import {
  BirthInput,
  Branch,
  BRANCHES,
  Gender,
  NatalChart,
  Palace,
  PalaceName,
  PALACE_NAMES,
  Star,
  StarBrightness,
  Stem,
  STEMS,
} from './types';
import {
  getDayCanChi,
  getHourBranch,
  getHourCanChi,
  getMonthCanChi,
  getYearCanChi,
  NAP_AM_TABLE,
  lunarToSolar,
  solarToLunar,
} from './lunarCalendar';
import { getStarPrimaryElementLabel, STAR_ID_BY_NAME } from './starElements';

// 14 Chính Tinh
export const CHINH_TINH = [
  'Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh',
  'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân',
] as const;

// Độ sáng 14 chính tinh theo 12 cung Tý..Hợi (0..11)
// Tý=0, Sửu=1, Dần=2, Mão=3, Thìn=4, Tỵ=5, Ngọ=6, Mùi=7, Thân=8, Dậu=9, Tuất=10, Hợi=11
const BRIGHTNESS_TABLE: Record<string, StarBrightness[]> = {
  'Tử Vi':      ['Bình', 'Miếu', 'Miếu', 'Vượng', 'Đắc', 'Vượng', 'Miếu', 'Miếu', 'Đắc', 'Vượng', 'Bình', 'Vượng'],
  'Thiên Cơ':   ['Miếu', 'Hãm',  'Đắc',  'Vượng', 'Miếu', 'Bình', 'Miếu', 'Vượng', 'Đắc', 'Vượng', 'Miếu', 'Bình'],
  'Thái Dương': ['Hãm',  'Hãm',  'Vượng', 'Miếu', 'Miếu', 'Vượng', 'Miếu', 'Đắc',  'Bình', 'Hãm',  'Hãm',  'Hãm'],
  'Vũ Khúc':    ['Vượng', 'Miếu', 'Bình', 'Đắc',  'Miếu', 'Bình', 'Vượng', 'Miếu', 'Bình', 'Đắc',  'Miếu', 'Bình'],
  'Thiên Đồng': ['Vượng', 'Hãm',  'Miếu', 'Đắc',  'Bình', 'Hãm',  'Hãm',  'Hãm',  'Bình', 'Đắc',  'Bình', 'Miếu'],
  'Liêm Trinh': ['Bình', 'Đắc',  'Miếu', 'Bình', 'Vượng', 'Hãm',  'Miếu', 'Đắc',  'Bình', 'Bình', 'Vượng', 'Hãm'],
  'Thiên Phủ':  ['Miếu', 'Miếu', 'Miếu', 'Bình', 'Miếu', 'Vượng', 'Vượng', 'Đắc',  'Miếu', 'Bình', 'Miếu', 'Vượng'],
  'Thái Âm':    ['Miếu', 'Miếu', 'Hãm',  'Hãm',  'Hãm',  'Hãm',  'Hãm',  'Bình', 'Đắc',  'Vượng', 'Miếu', 'Miếu'],
  'Tham Lang':  ['Vượng', 'Miếu', 'Bình', 'Hãm',  'Miếu', 'Hãm',  'Vượng', 'Miếu', 'Bình', 'Hãm',  'Miếu', 'Hãm'],
  'Cự Môn':     ['Vượng', 'Hãm',  'Miếu', 'Miếu', 'Hãm',  'Bình', 'Miếu', 'Hãm',  'Vượng', 'Miếu', 'Hãm',  'Vượng'],
  'Thiên Tướng':['Miếu', 'Miếu', 'Miếu', 'Hãm',  'Vượng', 'Bình', 'Vượng', 'Đắc',  'Miếu', 'Hãm',  'Vượng', 'Bình'],
  'Thiên Lương':['Miếu', 'Vượng', 'Miếu', 'Miếu', 'Vượng', 'Hãm',  'Miếu', 'Vượng', 'Hãm',  'Đắc',  'Miếu', 'Hãm'],
  'Thất Sát':   ['Miếu', 'Miếu', 'Miếu', 'Hãm',  'Bình', 'Vượng', 'Miếu', 'Miếu', 'Miếu', 'Hãm',  'Bình', 'Vượng'],
  'Phá Quân':   ['Miếu', 'Vượng', 'Hãm',  'Hãm',  'Vượng', 'Bình', 'Miếu', 'Vượng', 'Hãm',  'Hãm',  'Vượng', 'Bình'],
};

const MINOR_STAR_ELEMENTS: Record<string, 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ'> = {
  'Văn Xương': 'Kim', 'Văn Khúc': 'Thủy', 'Tả Phù': 'Thổ', 'Hữu Bật': 'Thủy',
  'Lộc Tồn': 'Thổ', 'Kình Dương': 'Kim', 'Đà La': 'Kim', 'Thiên Khôi': 'Hỏa',
  'Thiên Việt': 'Hỏa', 'Địa Không': 'Hỏa', 'Địa Kiếp': 'Hỏa', 'Hỏa Tinh': 'Hỏa',
  'Linh Tinh': 'Hỏa', 'Đào Hoa': 'Mộc', 'Thiên Mã': 'Hỏa', 'Hoa Cái': 'Kim',
  'Thái Tuế': 'Hỏa', 'Thiếu Dương': 'Hỏa', 'Tang Môn': 'Mộc', 'Thiếu Âm': 'Thủy',
  'Quan Phù': 'Hỏa', 'Tử Phù': 'Hỏa', 'Tuế Phá': 'Hỏa', 'Long Đức': 'Thủy',
  'Bạch Hổ': 'Kim', 'Phúc Đức': 'Thổ', 'Điếu Khách': 'Hỏa', 'Trực Phù': 'Hỏa',
};
const AUSPICIOUS_MINOR_STARS = ['Tả Phù', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Thiên Khôi', 'Thiên Việt', 'Lộc Tồn', 'Thiên Mã', 'Hoa Cái', 'Long Đức', 'Phúc Đức', 'Thiếu Dương'];
const ADVERSE_MINOR_STARS = ['Kình Dương', 'Đà La', 'Địa Không', 'Địa Kiếp', 'Hỏa Tinh', 'Linh Tinh', 'Tang Môn', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Bạch Hổ', 'Điếu Khách'];

const mod = (value: number, size: number) => ((value % size) + size) % size;

// Tìm Cung Mệnh & Cung Thân:
// Khởi từ Dần (index 2), đếm thuận đến tháng sinh.
// Từ đó đếm nghịch đến giờ sinh -> Cung Mệnh.
// Từ đó đếm thuận đến giờ sinh -> Cung Thân.
export function findMenhAndThan(lunarMonth: number, hourBranch: Branch): { menhIndex: number; thanIndex: number } {
  const hourIndex = BRANCHES.indexOf(hourBranch);
  const monthPos = (2 + (lunarMonth - 1)) % 12;
  const menhIndex = ((monthPos - hourIndex) % 12 + 12) % 12;
  const thanIndex = (monthPos + hourIndex) % 12;
  return { menhIndex, thanIndex };
}

// Can của 12 Cung: Dùng Ngũ Hổ Độn tính Can tại cung Dần (index 2), sau đó đi thuận
export function getPalaceStems(yearStem: Stem): Stem[] {
  const startStemMap: Record<Stem, number> = {
    Giáp: 2, Kỷ: 2,   // Bính Dần
    Ất: 4, Canh: 4,   // Mậu Dần
    Bính: 6, Tân: 6,  // Canh Dần
    Đinh: 8, Nhâm: 8, // Nhâm Dần
    Mậu: 0, Quý: 0,   // Giáp Dần
  };
  const danStem = startStemMap[yearStem];
  const stems: Stem[] = new Array(12);
  for (let i = 0; i < 12; i++) {
    const offsetFromDan = (i - 2 + 12) % 12;
    stems[i] = STEMS[(danStem + offsetFromDan) % 10];
  }
  return stems;
}

// Xác định Cục số từ Can Chi Cung Mệnh (Lục Thập Hoa Giáp Nạp Âm)
export function calculateCuc(menhStem: Stem, menhBranch: Branch): {
  name: string;
  number: number;
  element: 'Thủy' | 'Mộc' | 'Kim' | 'Thổ' | 'Hỏa';
} {
  const napAm = NAP_AM_TABLE[`${menhStem} ${menhBranch}`] || '';
  if (napAm.includes('Thủy')) return { name: 'Thủy Nhị Cục', number: 2, element: 'Thủy' };
  if (napAm.includes('Mộc')) return { name: 'Mộc Tam Cục', number: 3, element: 'Mộc' };
  if (napAm.includes('Kim')) return { name: 'Kim Tứ Cục', number: 4, element: 'Kim' };
  if (napAm.includes('Thổ')) return { name: 'Thổ Ngũ Cục', number: 5, element: 'Thổ' };
  if (napAm.includes('Hỏa')) return { name: 'Hỏa Lục Cục', number: 6, element: 'Hỏa' };

  return { name: 'Thủy Nhị Cục', number: 2, element: 'Thủy' };
}

// Bảng tra an vị Tử Vi chuẩn mực cho 5 Cục và 30 ngày âm lịch (Tử Vi Đẩu Số Toàn Thư)
// Chỉ số tương ứng vị trí Chi (0: Tý .. 11: Hợi)
const TU_VI_TABLE: Record<number, number[]> = {
  // Thủy Nhị Cục (Cục 2)
  2: [
    1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4
  ],
  // Mộc Tam Cục (Cục 3)
  3: [
    4, 1, 2, 5, 2, 3, 6, 3, 4, 7, 4, 5, 8, 5, 6, 9, 6, 7, 10, 7, 8, 11, 8, 9, 0, 9, 10, 1, 10, 11
  ],
  // Kim Tứ Cục (Cục 4)
  4: [
    11, 4, 1, 2, 0, 5, 2, 3, 1, 6, 3, 4, 2, 7, 4, 5, 3, 8, 5, 6, 4, 9, 6, 7, 5, 10, 7, 8, 6, 11
  ],
  // Thổ Ngũ Cục (Cục 5)
  5: [
    6, 11, 4, 1, 2, 7, 0, 5, 2, 3, 8, 1, 6, 3, 4, 9, 2, 7, 4, 5, 10, 3, 8, 5, 6, 11, 4, 9, 6, 7
  ],
  // Hỏa Lục Cục (Cục 6)
  6: [
    9, 6, 11, 4, 1, 2, 10, 7, 0, 5, 2, 3, 11, 8, 1, 6, 3, 4, 0, 9, 2, 7, 4, 5, 1, 10, 3, 8, 5, 6
  ],
};

export function placeTuVi(cucNumber: number, lunarDay: number): number {
  const table = TU_VI_TABLE[cucNumber] || TU_VI_TABLE[2];
  const dayIndex = Math.max(1, Math.min(30, lunarDay)) - 1;
  return table[dayIndex];
}

// An Vị 14 Chính Tinh
export function placeMajorStars(tuViIndex: number): Record<string, number> {
  const positions: Record<string, number> = {};

  // Vòng Tử Vi (nghịch)
  positions['Tử Vi'] = tuViIndex;
  positions['Thiên Cơ'] = (tuViIndex - 1 + 12) % 12;
  positions['Thái Dương'] = (tuViIndex - 3 + 12) % 12;
  positions['Vũ Khúc'] = (tuViIndex - 4 + 12) % 12;
  positions['Thiên Đồng'] = (tuViIndex - 5 + 12) % 12;
  positions['Liêm Trinh'] = (tuViIndex - 8 + 12) % 12;

  // Vòng Thiên Phủ (đối xứng qua trục Dần - Thân: tổng vị trí = 4 hoặc 16)
  const thienPhuIndex = (4 - tuViIndex + 12) % 12;
  positions['Thiên Phủ'] = thienPhuIndex;
  positions['Thái Âm'] = (thienPhuIndex + 1) % 12;
  positions['Tham Lang'] = (thienPhuIndex + 2) % 12;
  positions['Cự Môn'] = (thienPhuIndex + 3) % 12;
  positions['Thiên Tướng'] = (thienPhuIndex + 4) % 12;
  positions['Thiên Lương'] = (thienPhuIndex + 5) % 12;
  positions['Thất Sát'] = (thienPhuIndex + 6) % 12;
  positions['Phá Quân'] = (thienPhuIndex + 10) % 12;

  return positions;
}

// An các phụ tinh quan trọng
export function placeMinorStars(
  yearStem: Stem,
  yearBranch: Branch,
  lunarMonth: number,
  hourBranch: Branch,
): Record<string, number> {
  const minor: Record<string, number> = {};
  const hourIdx = BRANCHES.indexOf(hourBranch);

  // Tả Phụ (Thìn = 4 thuận tháng sinh) & Hữu Bật (Tuất = 10 nghịch tháng sinh)
  minor['Tả Phù'] = (4 + (lunarMonth - 1)) % 12;
  minor['Hữu Bật'] = ((10 - (lunarMonth - 1)) % 12 + 12) % 12;

  // Văn Xương (Tuất = 10 nghịch giờ sinh) & Văn Khúc (Thìn = 4 thuận giờ sinh)
  minor['Văn Xương'] = ((10 - hourIdx) % 12 + 12) % 12;
  minor['Văn Khúc'] = (4 + hourIdx) % 12;

  // Lộc Tồn, Kình Dương, Đà La theo Can năm
  const locTonMap: Record<Stem, number> = {
    Giáp: 2, // Dần
    Ất: 3,   // Mão
    Bính: 5, // Tỵ
    Đinh: 7, // Ngọ
    Mậu: 5,  // Tỵ
    Kỷ: 7,   // Ngọ
    Canh: 8, // Thân
    Tân: 9,  // Dậu
    Nhâm: 11,// Hợi
    Quý: 0,  // Tý
  };
  const locTonPos = locTonMap[yearStem];
  minor['Lộc Tồn'] = locTonPos;
  minor['Kình Dương'] = (locTonPos + 1) % 12;
  minor['Đà La'] = (locTonPos - 1 + 12) % 12;

  // Thiên Khôi & Thiên Việt
  const khoiVietMap: Record<Stem, [number, number]> = {
    Giáp: [1, 7],   // Sửu, Mùi
    Ất: [0, 8],     // Tý, Thân
    Bính: [11, 9],  // Hợi, Dậu
    Đinh: [11, 9],  // Hợi, Dậu
    Mậu: [1, 7],    // Sửu, Mùi
    Kỷ: [0, 8],     // Tý, Thân
    Canh: [1, 7],   // Sửu, Mùi
    Tân: [2, 6],    // Dần, Ngọ
    Nhâm: [3, 5],   // Mão, Tỵ
    Quý: [3, 5],    // Mão, Tỵ
  };
  const [khoi, viet] = khoiVietMap[yearStem];
  minor['Thiên Khôi'] = khoi;
  minor['Thiên Việt'] = viet;

  // Địa Không, Địa Kiếp (khởi từ Hợi = 11)
  minor['Địa Không'] = ((11 - hourIdx) % 12 + 12) % 12;
  minor['Địa Kiếp'] = (11 + hourIdx) % 12;

  // Hỏa Tinh & Linh Tinh
  const branchIdx = BRANCHES.indexOf(yearBranch);
  const fireBase = (branchIdx % 4 === 2) ? 1 : (branchIdx % 4 === 0) ? 2 : 3;
  minor['Hỏa Tinh'] = (fireBase + hourIdx) % 12;
  minor['Linh Tinh'] = ((10 - hourIdx) % 12 + 12) % 12;

  // Đào Hoa
  const daoHoaMap: Record<number, number> = { 0: 9, 1: 6, 2: 3, 3: 0 };
  minor['Đào Hoa'] = daoHoaMap[branchIdx % 4];

  // Thiên Mã
  const maMap: Record<number, number> = { 0: 2, 1: 11, 2: 8, 3: 5 };
  minor['Thiên Mã'] = maMap[branchIdx % 4];

  // Hoa Cái theo tam hợp năm sinh: Thân Tý Thìn tại Thìn, Dần Ngọ Tuất tại Tuất,
  // Tỵ Dậu Sửu tại Sửu, Hợi Mão Mùi tại Mùi.
  const hoaCaiMap: Record<number, number> = { 0: 4, 1: 10, 2: 1, 3: 7 };
  minor['Hoa Cái'] = hoaCaiMap[branchIdx % 4];

  // Vòng Thái Tuế: 12 sao đi thuận, độc lập với chiều giới tính.
  const thaiTueRing = ['Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'];
  thaiTueRing.forEach((star, offset) => { minor[star] = (branchIdx + offset) % 12; });

  return minor;
}

export function getTuanTrietBranches(yearStem: Stem, yearBranch: Branch): { tuan: number[]; triet: number[] } {
  const trietByStem: Record<Stem, [number, number]> = {
    Giáp: [8, 9], Kỷ: [8, 9], Ất: [6, 7], Canh: [6, 7], Bính: [4, 5], Tân: [4, 5],
    Đinh: [2, 3], Nhâm: [2, 3], Mậu: [0, 1], Quý: [0, 1],
  };
  const cycleIndex = Array.from({ length: 60 }, (_, index) => index).find((index) =>
    index % 10 === STEMS.indexOf(yearStem) && index % 12 === BRANCHES.indexOf(yearBranch)
  ) ?? 0;
  const xun = Math.floor(cycleIndex / 10);
  const tuanPairs: Array<[number, number]> = [[10, 11], [8, 9], [6, 7], [4, 5], [2, 3], [0, 1]];
  return { tuan: tuanPairs[xun] ?? tuanPairs[0], triet: trietByStem[yearStem] };
}

// Sinh Mệnh Bàn Tử Vi Đẩu Số Toàn Diện
export function generateNatalChart(input: BirthInput): NatalChart {
  const [sYearStr, sMonthStr, sDayStr] = input.date.split('-');
  const sYear = Number(sYearStr);
  const sMonth = Number(sMonthStr);
  const sDay = Number(sDayStr);
  const [hour, minute] = input.time.split(':').map(Number);

  // 1. Chuyển đổi lịch thiên văn chính xác
  let lYear = sYear;
  let lMonth = sMonth;
  let lDay = sDay;
  let isLeap = input.isLeapMonth ?? false;
  let solarYear = sYear;
  let solarMonth = sMonth;
  let solarDay = sDay;

  if (input.calendar === 'solar') {
    const lunar = solarToLunar(sDay, sMonth, sYear);
    lYear = lunar.lYear;
    lMonth = lunar.lMonth;
    lDay = lunar.lDay;
    isLeap = lunar.isLeap;
  } else {
    const solar = lunarToSolar(lDay, lMonth, lYear, isLeap);
    solarYear = solar.year;
    solarMonth = solar.month;
    solarDay = solar.day;
  }

  // Can Chi Năm (theo năm âm lịch)
  const birthCanChiYear = getYearCanChi(lYear);
  // Can Chi Tháng
  const birthCanChiMonth = getMonthCanChi(birthCanChiYear.stem, lMonth);
  // Can Chi Ngày & Giờ (xử lý biên giờ Tý >= 23h)
  const birthCanChiDay = getDayCanChi(solarYear, solarMonth, solarDay, hour);
  const hourBranch = getHourBranch(hour, minute);
  const birthCanChiHour = getHourCanChi(birthCanChiDay.stem, hour, minute);

  // 2. Cung Mệnh & Thân
  const { menhIndex, thanIndex } = findMenhAndThan(lMonth, hourBranch);

  // 3. Can của 12 Cung
  const palaceStems = getPalaceStems(birthCanChiYear.stem);

  // 4. Tính Cục số
  const cuc = calculateCuc(palaceStems[menhIndex], BRANCHES[menhIndex]);

  // 5. An Vị Tử Vi và 14 Chính Tinh
  const tuViPos = placeTuVi(cuc.number, lDay);
  const majorStarPositions = placeMajorStars(tuViPos);

  // 6. Phụ Tinh
  const minorStarPositions = placeMinorStars(
    birthCanChiYear.stem,
    birthCanChiYear.branch,
    lMonth,
    hourBranch,
  );
  const tuanTrietBranches = getTuanTrietBranches(birthCanChiYear.stem, birthCanChiYear.branch);

  // 7. Chiều an Đại Hạn
  const isYangYear = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(birthCanChiYear.stem);
  const isMale = input.gender === 'Nam';
  const isClockwiseDecade = (isYangYear && isMale) || (!isYangYear && !isMale);

  // 8. Dựng 12 Cung
  const palaces: Palace[] = BRANCHES.map((branch, branchIndex) => {
    // Palace sequence advances with branch index: Mệnh, Phụ Mẫu, ... Huynh Đệ.
    // The previous subtraction reversed the twelve palace labels around the chart.
    const offsetFromMenh = (branchIndex - menhIndex + 12) % 12;
    const palaceName = PALACE_NAMES[offsetFromMenh];

    const majorStars: Star[] = [];
    for (const [starName, pos] of Object.entries(majorStarPositions)) {
      if (pos === branchIndex) {
        majorStars.push({
          name: starName,
          category: 'major',
          element: STAR_ID_BY_NAME[starName] ? getStarPrimaryElementLabel(STAR_ID_BY_NAME[starName]) : undefined,
          brightness: BRIGHTNESS_TABLE[starName]?.[branchIndex] || 'Đắc',
        });
      }
    }

    const minorStars: Star[] = [];
    for (const [starName, pos] of Object.entries(minorStarPositions)) {
      if (pos === branchIndex) {
        const category = AUSPICIOUS_MINOR_STARS.includes(starName)
          ? 'good'
          : ADVERSE_MINOR_STARS.includes(starName)
            ? 'bad'
            : 'other';
        minorStars.push({
          name: starName,
          category,
          element: MINOR_STAR_ELEMENTS[starName],
        });
      }
    }

    const decadeOffset = isClockwiseDecade
      ? (branchIndex - menhIndex + 12) % 12
      : (menhIndex - branchIndex + 12) % 12;
    const decadeStart = cuc.number + decadeOffset * 10;
    const decade = { startAge: decadeStart, endAge: decadeStart + 9 };

    const forecastYear = input.forecastYear || 2026;
    const ageNow = forecastYear - lYear + 1;
    const annualStartByYearGroup: Record<number, number> = { 0: 2, 1: 11, 2: 8, 3: 5 };
    const annualStart = annualStartByYearGroup[BRANCHES.indexOf(birthCanChiYear.branch) % 4];
    const annualDirection = isClockwiseDecade ? 1 : -1;
    // Tiểu Hạn starts at the natal year group's branch, then proceeds with the
    // Dương Nam/Âm Nữ or Âm Nam/Dương Nữ direction rule.
    const annualAge = mod((branchIndex - annualStart) * annualDirection, 12) + 1;

    return {
      index: branchIndex,
      branch,
      stem: palaceStems[branchIndex],
      name: palaceName,
      isBodyPalace: branchIndex === thanIndex,
      majorStars,
      minorStars,
      decade,
      annualAge,
      isAnnualLimit: annualAge === (ageNow % 12 || 12),
      lunarMonth: ((branchIndex - BRANCHES.indexOf(hourBranch) + 12) % 12) + 1,
      transformations: {},
      tuan: tuanTrietBranches.tuan.includes(branchIndex),
      triet: tuanTrietBranches.triet.includes(branchIndex),
    };
  });

  const napAm = NAP_AM_TABLE[`${birthCanChiYear.stem} ${birthCanChiYear.branch}`] || 'Bình Địa Mộc';
  const forecastCanChi = getYearCanChi(input.forecastYear || 2026);

  return {
    id: `chart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: input.name.trim() || 'Vô Danh Cư Sĩ',
    gender: input.gender,
    solarDate: `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`,
    lunarDate: {
      year: lYear,
      month: lMonth,
      day: lDay,
      isLeap,
    },
    time: input.time,
    birthCanChi: {
      year: birthCanChiYear,
      month: birthCanChiMonth,
      day: birthCanChiDay,
      hour: birthCanChiHour,
    },
    napAm,
    cuc,
    menhPalaceIndex: menhIndex,
    thanPalaceIndex: thanIndex,
    palaces,
    forecastYear: input.forecastYear || 2026,
    forecastCanChi,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
}
