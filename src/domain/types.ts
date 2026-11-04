export type Gender = 'Nam' | 'Nữ';
export type CalendarType = 'solar' | 'lunar';
export type TransformationType = 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';

export const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
export type Stem = (typeof STEMS)[number];

export const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
export type Branch = (typeof BRANCHES)[number];

export const PALACE_NAMES = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
] as const;
export type PalaceName = (typeof PALACE_NAMES)[number];

export type StarBrightness = 'Miếu' | 'Vượng' | 'Đắc' | 'Hãm' | 'Bình';

export interface Star {
  name: string;
  category: 'major' | 'good' | 'bad' | 'flow' | 'other';
  brightness?: StarBrightness;
  element?: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
  description?: string;
  transformation?: TransformationType;
}

export interface Palace {
  index: number; // 0 to 11 corresponding to Earthly Branches Tý = 0 .. Hợi = 11
  branch: Branch;
  stem: Stem;
  name: PalaceName;
  isBodyPalace: boolean; // Thân Cư
  majorStars: Star[];
  minorStars: Star[];
  transformations: {
    birthYear?: TransformationType;
    selfTransformation?: {
      type: TransformationType;
      mode: 'ly_tam' | 'huong_tam';
      star: string;
    };
    flyingTo?: Array<{
      targetPalaceIndex: number;
      type: TransformationType;
      star: string;
    }>;
  };
  decade: { startAge: number; endAge: number }; // Đại hạn
  annualAge: number; // Tiểu hạn tuổi
  isAnnualLimit: boolean;
  lunarMonth: number; // Nguyệt hạn
  triet?: boolean;
  tuan?: boolean;
}

export interface NatalChart {
  id: string;
  name: string;
  gender: Gender;
  solarDate: string; // YYYY-MM-DD
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeap: boolean;
  };
  time: string; // HH:mm
  birthCanChi: {
    year: { stem: Stem; branch: Branch };
    month: { stem: Stem; branch: Branch };
    day: { stem: Stem; branch: Branch };
    hour: { stem: Stem; branch: Branch };
  };
  napAm: string;
  cuc: {
    name: string;
    number: number; // 2, 3, 4, 5, 6
    element: 'Thủy' | 'Mộc' | 'Kim' | 'Thổ' | 'Hỏa';
  };
  menhPalaceIndex: number; // Branch index 0..11
  thanPalaceIndex: number;
  palaces: Palace[];
  forecastYear: number;
  forecastCanChi: { stem: Stem; branch: Branch };
  notes?: string;
  createdAt: string;
}

export interface BirthInput {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  gender: Gender;
  calendar: CalendarType;
  isLeapMonth?: boolean;
  forecastYear: number;
  notes?: string;
}

export interface HexagramLine {
  lineIndex: number; // 1 to 6 (bottom to top)
  yinYang: 'yin' | 'yang';
  isMoving: boolean; // Lão Dương or Lão Âm
  value: number; // 6, 7, 8, 9
  element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
  kinship: 'Phụ Mẫu' | 'Huynh Đệ' | 'Tử Tôn' | 'Thê Tài' | 'Quan Quỷ'; // Lục Thân
  beast: 'Thanh Long' | 'Chu Tước' | 'Câu Trần' | 'Đằng Xà' | 'Bạch Hổ' | 'Huyền Vũ'; // Lục Thú
  stemBranch: string; // e.g. "Bính Tý"
  isThe: boolean;
  isUng: boolean;
}

export interface Hexagram {
  id: number;
  name: string;
  vietnameseName: string;
  chineseName: string;
  pinyin: string;
  upperTrigram: string;
  lowerTrigram: string;
  lines: HexagramLine[];
  palaceGroup: string; // Thuộc cung Càn/Khôn...
  judgment: string; // Thoán từ
  image: string; // Tượng từ
  scholarlyAdvice: string;
  transformedHexagram?: {
    id: number;
    name: string;
    vietnameseName: string;
    chineseName: string;
    lines: HexagramLine[];
    judgment: string;
  };
}
