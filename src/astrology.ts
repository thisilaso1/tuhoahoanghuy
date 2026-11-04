export const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
export const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
export const PALACES = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'] as const;

export type Transformation = 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';
export type Gender = 'Nam' | 'Nữ';

export const TU_HOA: Record<(typeof STEMS)[number], Record<Transformation, string>> = {
  Giáp: { Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' },
  Ất: { Lộc: 'Thiên Cơ', Quyền: 'Thiên Lương', Khoa: 'Tử Vi', Kỵ: 'Thái Âm' },
  Bính: { Lộc: 'Thiên Đồng', Quyền: 'Thiên Cơ', Khoa: 'Văn Xương', Kỵ: 'Liêm Trinh' },
  Đinh: { Lộc: 'Thái Âm', Quyền: 'Thiên Đồng', Khoa: 'Thiên Cơ', Kỵ: 'Cự Môn' },
  Mậu: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Hữu Bật', Kỵ: 'Thiên Cơ' },
  Kỷ: { Lộc: 'Vũ Khúc', Quyền: 'Tham Lang', Khoa: 'Thiên Lương', Kỵ: 'Văn Khúc' },
  Canh: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thái Âm', Kỵ: 'Thiên Đồng' },
  Tân: { Lộc: 'Cự Môn', Quyền: 'Thái Dương', Khoa: 'Văn Khúc', Kỵ: 'Văn Xương' },
  Nhâm: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Tả Phụ', Kỵ: 'Vũ Khúc' },
  Quý: { Lộc: 'Phá Quân', Quyền: 'Cự Môn', Khoa: 'Thái Âm', Kỵ: 'Tham Lang' },
};

const MAJOR_STARS = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'];
const SUPPORT_STARS = ['Văn Xương', 'Văn Khúc', 'Tả Phụ', 'Hữu Bật', 'Lộc Tồn', 'Kình Dương', 'Đà La', 'Thiên Khôi', 'Thiên Việt', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không'];

export interface BirthInput {
  name: string;
  date: string;
  hour: number;
  gender: Gender;
  calendar: 'solar' | 'lunar';
  forecastYear: number;
}

export interface PalaceData {
  branch: string;
  name: string;
  index: number;
  majorStars: string[];
  supportStars: string[];
  decade: string;
  annualAge: number;
  lunarMonth: number;
}

export function canChiYear(year: number) {
  return { stem: STEMS[(year + 6) % 10], branch: BRANCHES[(year + 8) % 12] };
}

export function hourBranch(hour: number) {
  return BRANCHES[Math.floor(((hour + 1) % 24) / 2)];
}

function hashSeed(input: BirthInput) {
  const digits = input.date.replaceAll('-', '').split('').reduce((sum, value) => sum + Number(value), 0);
  return digits + input.hour * 7 + input.forecastYear * 3 + (input.gender === 'Nam' ? 11 : 23);
}

export function buildChart(input: BirthInput): PalaceData[] {
  const [, monthText] = input.date.split('-');
  const month = Number(monthText);
  const hourIndex = BRANCHES.indexOf(hourBranch(input.hour));
  const lifeIndex = (2 + month - 1 - hourIndex + 24) % 12;
  const seed = hashSeed(input);
  const clockwise = (canChiYear(Number(input.date.slice(0, 4))).stem.length + (input.gender === 'Nam' ? 0 : 1)) % 2 === 0;

  return BRANCHES.map((branch, index) => {
    const palaceOffset = clockwise ? index - lifeIndex : lifeIndex - index;
    const palaceIndex = (palaceOffset + 24) % 12;
    return {
      branch,
      name: PALACES[palaceIndex],
      index,
      majorStars: MAJOR_STARS.filter((_, starIndex) => (starIndex * 5 + seed) % 12 === index),
      supportStars: SUPPORT_STARS.filter((_, starIndex) => (starIndex * 7 + seed + month) % 12 === index),
      decade: `${2 + palaceIndex * 10}–${11 + palaceIndex * 10}`,
      annualAge: ((input.forecastYear - Number(input.date.slice(0, 4)) + palaceIndex) % 12 + 12) % 12 + 1,
      lunarMonth: ((index - hourIndex + 12) % 12) + 1,
    };
  });
}

export function transformationTargets(chart: PalaceData[], year: number) {
  const transformations = TU_HOA[canChiYear(year).stem];
  return (Object.entries(transformations) as [Transformation, string][]).map(([kind, star]) => ({
    kind,
    star,
    target: chart.find((palace) => [...palace.majorStars, ...palace.supportStars].includes(star))?.index ?? 0,
  }));
}
