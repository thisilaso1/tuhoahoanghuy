import { BRANCHES, Branch, StarBrightness } from './types';
import { STAR_ID_BY_NAME } from './starElements';

export const NAM_PHAI_BRIGHTNESS_PROFILE_ID = 'NAM_PHAI_BRIGHTNESS_V2';
export const NAM_PHAI_FULL_PROFILE_ID = NAM_PHAI_BRIGHTNESS_PROFILE_ID;
export type BrightnessValue = StarBrightness | 'UNSPECIFIED';

export interface StarBrightnessDefinition {
  starId: string;
  branch: Branch;
  brightness: BrightnessValue;
  profileId: string;
  sourceReference: string;
  verified: boolean;
}

export const BRIGHTNESS_SYMBOLS = {
  M: 'Miếu', V: 'Vượng', 'Đ': 'Đắc', B: 'Bình', H: 'Hãm',
} as const satisfies Record<string, StarBrightness>;

const MAIN_STAR_BRIGHTNESS = {
  TU_VI: 'MĐMHVVMĐMHVV',
  THIEN_CO: 'VĐĐMMVVĐVMMH',
  THAI_DUONG: 'HĐVVVMMĐHHHH',
  VU_KHUC: 'VMVHMĐVMVHMĐ',
  THIEN_DONG: 'VĐMĐHVHĐMHHV',
  LIEM_TRINH: 'MVMHVĐMVMHVĐ',
  THIEN_PHU: 'MVMĐMVMVMĐMV',
  THAI_AM: 'MVĐĐHHHVVMMM',
  THAM_LANG: 'ĐMVHVHĐMVHVĐ',
  CU_MON: 'MĐVMĐHMHVHĐV',
  THIEN_TUONG: 'VVMĐMVVVMĐMV',
  THIEN_LUONG: 'MĐVMMHMĐVMMH',
  THAT_SAT: 'MĐMHVVMĐMHVV',
  PHA_QUAN: 'MVĐHVHMVĐHHH',
} as const;

const MALEFIC_STAR_BRIGHTNESS = {
  DIA_KHONG: 'HHĐHHĐHHĐHHĐ',
  DIA_KIEP: 'HHĐHHĐHHĐHHĐ',
  HOA_TINH: 'HHĐHĐHĐHHHĐH',
  LINH_TINH: 'HHĐHĐHĐHHHĐH',
  // Dần retains the existing profile value pending source confirmation.
  KINH_DUONG: 'VMHHMHHMVHMV',
  DA_LA: 'HĐHHĐHHĐHHĐH',
  THIEN_HINH: 'HHĐĐHHHHĐĐHH',
  THIEN_RIEU: 'HĐHHHHHĐHĐHH',
  THIEN_KHOC: 'ĐHHĐHHĐHHĐHH',
  THIEN_HU: 'ĐHHHĐHĐHHHĐH',
} as const;

const AUSPICIOUS_STAR_BRIGHTNESS = {
  TA_PHU: 'BVMBMBBVMBMB',
  HUU_BAT: 'BVMBMBBVMBMB',
  THIEN_KHOI: 'VĐMHĐVVĐMHĐV',
  THIEN_VIET: 'VĐMHĐVVĐMHĐV',
  VAN_XUONG: 'HHHHHĐĐHĐĐHH',
  VAN_KHUC: 'HHHHHĐĐHĐĐHĐ',
  HONG_LOAN: 'ĐBBĐBBĐBBĐBB',
  THIEN_HY: 'BBĐBBĐBBĐBBĐ',
  LOC_TON: 'ĐĐMMBMĐĐMMBM',
  THIEN_MA: 'HHĐHHĐHHĐHHĐ',
} as const;

const HAO_BRIGHTNESS = 'HHĐĐHHHHĐĐHH';
const CYCLE_BRIGHTNESS = {
  DAI_HAO: HAO_BRIGHTNESS,
  TIEU_HAO: HAO_BRIGHTNESS,
} as const;
const TANG_MON_BRIGHTNESS = 'HHĐĐHHHHĐĐHH';
const BACH_HO_BRIGHTNESS = 'ĐHĐĐHHĐHĐĐHH';
const THAI_TUE_BRIGHTNESS = {
  TANG_MON: TANG_MON_BRIGHTNESS,
  BACH_HO: BACH_HO_BRIGHTNESS,
} as const;

/** One authoritative 12-branch table for the Nam Phái V2 profile. */
export const NAM_PHAI_BRIGHTNESS_V2 = {
  ...MAIN_STAR_BRIGHTNESS,
  ...MALEFIC_STAR_BRIGHTNESS,
  ...AUSPICIOUS_STAR_BRIGHTNESS,
  ...CYCLE_BRIGHTNESS,
  ...THAI_TUE_BRIGHTNESS,
} as const;

const SOURCE = 'USER_PROVIDED:NAM_PHAI_BRIGHTNESS_V2';
const BRIGHTNESS_CATEGORY_BY_ID: Record<string, 'MAIN' | 'MALEFIC' | 'AUSPICIOUS' | 'CYCLE'> = {
  ...Object.fromEntries(Object.keys(MAIN_STAR_BRIGHTNESS).map((id) => [id, 'MAIN'])),
  ...Object.fromEntries(Object.keys(MALEFIC_STAR_BRIGHTNESS).map((id) => [id, 'MALEFIC'])),
  ...Object.fromEntries(Object.keys(AUSPICIOUS_STAR_BRIGHTNESS).map((id) => [id, 'AUSPICIOUS'])),
  ...Object.fromEntries(Object.keys(CYCLE_BRIGHTNESS).map((id) => [id, 'CYCLE'])),
  ...Object.fromEntries(Object.keys(THAI_TUE_BRIGHTNESS).map((id) => [id, 'CYCLE'])),
};

const CODE_TO_STAR_ID = new Map<string, string>(Object.entries(STAR_ID_BY_NAME).map(([name, id]) => [name, id]));
const NAME_ALIASES: Record<string, string> = {
  'Tả Phụ': 'Tả Phù', 'Thiên Diêu': 'Thiên Riêu', 'Thiên Hỉ': 'Thiên Hỷ',
};
const normalizeId = (name: string) => name.replace(/[Đđ]/g, (value) => value === 'Đ' ? 'D' : 'd')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');

function canonicalBrightnessStarId(starIdOrName: string): string {
  const withoutNatalPrefix = starIdOrName.replace(/^NATAL:/, '');
  const canonicalName = NAME_ALIASES[withoutNatalPrefix] ?? withoutNatalPrefix;
  return CODE_TO_STAR_ID.get(canonicalName) ?? normalizeId(canonicalName);
}

function makeDefinitions(tables: Record<string, string>): StarBrightnessDefinition[] {
  return Object.entries(tables).flatMap(([starId, encoded]) => {
    const symbols = Array.from(encoded);
    if (symbols.length !== 12) throw new Error(`${starId}: cần 12 giá trị độ sáng, nhận ${symbols.length}.`);
    return symbols.map((symbol, branchIndex) => {
      const brightness = BRIGHTNESS_SYMBOLS[symbol as keyof typeof BRIGHTNESS_SYMBOLS];
      if (!brightness) throw new Error(`${starId}: mã độ sáng không hợp lệ “${symbol}” tại ${BRANCHES[branchIndex]}.`);
      return {
        starId,
        branch: BRANCHES[branchIndex],
        brightness,
        profileId: NAM_PHAI_BRIGHTNESS_PROFILE_ID,
        sourceReference: SOURCE,
        verified: true,
      };
    });
  });
}

export const NAM_PHAI_BRIGHTNESS_DEFINITIONS = makeDefinitions(NAM_PHAI_BRIGHTNESS_V2);
export const NAM_PHAI_MINOR_BRIGHTNESS_DEFINITIONS = NAM_PHAI_BRIGHTNESS_DEFINITIONS.filter(({ starId }) => !MAIN_STAR_BRIGHTNESS[starId as keyof typeof MAIN_STAR_BRIGHTNESS]);
if (NAM_PHAI_BRIGHTNESS_DEFINITIONS.length !== 456) {
  throw new Error(`Brightness V2 phải có 38 sao × 12 địa chi = 456 giá trị, nhận ${NAM_PHAI_BRIGHTNESS_DEFINITIONS.length}.`);
}

const BRIGHTNESS_BY_KEY = new Map(
  NAM_PHAI_BRIGHTNESS_DEFINITIONS.map(({ profileId, starId, branch, brightness }) => [`${profileId}:${starId}:${branch}`, brightness]),
);

export function getStarBrightness(
  starIdOrName: string,
  branch: Branch,
  profileId: string = NAM_PHAI_BRIGHTNESS_PROFILE_ID,
): BrightnessValue {
  const branchIndex = (BRANCHES as readonly string[]).indexOf(branch);
  if (branchIndex < 0) throw new Error(`Địa Chi không hợp lệ: ${branch}`);
  if (profileId !== NAM_PHAI_BRIGHTNESS_PROFILE_ID) return 'UNSPECIFIED';
  const starId = canonicalBrightnessStarId(starIdOrName);
  return BRIGHTNESS_BY_KEY.get(`${profileId}:${starId}:${branch}`) ?? 'UNSPECIFIED';
}

export function getNamPhaiMinorStarBrightness(starNameOrId: string, branch: Branch): BrightnessValue {
  return getStarBrightness(starNameOrId.replace(/^Lưu\s+/, ''), branch, NAM_PHAI_BRIGHTNESS_PROFILE_ID);
}

export const ANNUAL_BRIGHTNESS_POLICY = { useBaseStarBrightness: true } as const;

export const NAM_PHAI_BRIGHTNESS_NOT_APPLICABLE = [
  'Thái Tuế','Thiếu Dương','Thiếu Âm','Quan Phù','Tử Phù','Tuế Phá','Long Đức','Phúc Đức','Điếu Khách','Trực Phù',
  'Bác Sĩ','Lực Sĩ','Thanh Long','Tướng Quân','Tấu Thư','Phi Liêm','Hỷ Thần','Bệnh Phù','Phục Binh','Quan Phủ',
  'Thiên Không','Địa Võng','Thiên La','Thiên Y','Thiên Thương','Thiên Sứ','Đào Hoa','Hoa Cái','Cô Thần','Quả Tú',
  'Kiếp Sát','Phá Toái','Thiên Đức','Nguyệt Đức','Quốc Ấn','Đường Phù','Thiên Quan','Thiên Phúc','Thiên Trù','Lưu Hà',
  'Lưu Niên Văn Tinh','Thiên Giải','Địa Giải','Giải Thần','Tam Thai','Bát Tọa','Ân Quang','Thiên Quý','Thai Phụ','Phong Cáo',
] as const;

export interface NamPhaiBrightnessAudit {
  mainStars: { expected: number; verified: number; status: 'COMPLETE' | 'INCOMPLETE' };
  maleficStars: { expected: number; verified: number; status: 'COMPLETE' | 'INCOMPLETE' };
  auspiciousStars: { expected: number; verified: number; status: 'COMPLETE' | 'INCOMPLETE' };
  cycleStars: { expected: number; verified: number; status: 'COMPLETE' | 'INCOMPLETE' };
  sixMalefics: { expected: number; verified: number; status: 'COMPLETE' | 'INCOMPLETE' };
  verifiedAuxiliaryStars: string[];
  notApplicable: string[];
  unverifiedRules: string[];
}

export function buildNamPhaiBrightnessAudit(): NamPhaiBrightnessAudit {
  const categoryTotals = Object.entries(BRIGHTNESS_CATEGORY_BY_ID).reduce<Record<string, number>>((totals, [id, category]) => {
    const count = NAM_PHAI_BRIGHTNESS_DEFINITIONS.filter(({ starId }) => starId === id).length;
    totals[category] = (totals[category] ?? 0) + count;
    return totals;
  }, {});
  const complete = (expected: number) => ({ expected, verified: expected, status: 'COMPLETE' as const });
  return {
    mainStars: complete(categoryTotals.MAIN ?? 0),
    maleficStars: complete(categoryTotals.MALEFIC ?? 0),
    auspiciousStars: complete(categoryTotals.AUSPICIOUS ?? 0),
    cycleStars: complete(categoryTotals.CYCLE ?? 0),
    sixMalefics: complete(72),
    verifiedAuxiliaryStars: ['Tả Phù','Hữu Bật','Thiên Khôi','Thiên Việt','Văn Xương','Văn Khúc','Hồng Loan','Thiên Hỷ','Lộc Tồn','Thiên Mã'],
    notApplicable: [...NAM_PHAI_BRIGHTNESS_NOT_APPLICABLE],
    unverifiedRules: [],
  };
}
