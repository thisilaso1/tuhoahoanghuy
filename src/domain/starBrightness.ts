import { BRANCHES, Branch, StarBrightness } from './types';

export const NAM_PHAI_FULL_PROFILE_ID = 'NAM_PHAI_FULL_V1';
export type BrightnessValue = StarBrightness | 'UNSPECIFIED';

export interface StarBrightnessDefinition {
  starId: string;
  branch: Branch;
  brightness: BrightnessValue;
  profileId: string;
  sourceReference: string;
  verified: boolean;
}

const SOURCE = 'https://somenh.vn/mieu-vuong-dac-ham';
const CODE_TO_BRIGHTNESS: Record<string, StarBrightness> = {
  M: 'Miếu', V: 'Vượng', Đ: 'Đắc', B: 'Bình', H: 'Hãm',
};

// Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi.
// NAM_PHAI_FULL_V1 is an explicit profile; Khâm Thiên continues using its
// existing brightness table and is not affected by this registry.
const MAIN_STAR_BRIGHTNESS_CODES: Record<string, string> = {
  TU_VI: 'ĐĐMBVMMĐMBVĐ',
  THIEN_CO: 'ĐĐHMMVĐVVMMH',
  THAI_DUONG: 'HĐVVVMMĐHHHH',
  VU_KHUC: 'VMVĐMHVMVĐMH',
  THIEN_DONG: 'VHMĐHĐHHMHHĐ',
  LIEM_TRINH: 'VĐVHMHVĐVHMH',
  THIEN_PHU: 'MBMBVĐMĐMBVĐ',
  THAI_AM: 'VĐHHHHHĐVMMM',
  THAM_LANG: 'HMĐHVHHMĐHVH',
  CU_MON: 'VHVMHHVHĐMHĐ',
  THIEN_TUONG: 'VĐMHVĐVĐMHVĐ',
  THIEN_LUONG: 'VĐVVMHMĐVHMH',
  THAT_SAT: 'MĐMHHVMĐMHHV',
  PHA_QUAN: 'MVHHĐHMVHHĐH',
};

const brightnessFromCode = (code: string): StarBrightness => {
  const value = CODE_TO_BRIGHTNESS[code];
  if (!value) throw new Error(`Mã độ sáng Nam Phái không hợp lệ: ${code}`);
  return value;
};

export const NAM_PHAI_BRIGHTNESS_DEFINITIONS: StarBrightnessDefinition[] = Object.entries(MAIN_STAR_BRIGHTNESS_CODES)
  .flatMap(([starId, codes]) => {
    if (codes.length !== 12) throw new Error(`${starId}: cần 12 giá trị độ sáng, nhận ${codes.length}.`);
    return [...codes].map((code, branchIndex) => ({
      starId,
      branch: BRANCHES[branchIndex],
      brightness: brightnessFromCode(code),
      profileId: NAM_PHAI_FULL_PROFILE_ID,
      sourceReference: SOURCE,
      verified: true,
    }));
  });

if (NAM_PHAI_BRIGHTNESS_DEFINITIONS.length !== 168) {
  throw new Error(`Bảng Miếu–Vượng Nam Phái phải có 168 ô, nhận ${NAM_PHAI_BRIGHTNESS_DEFINITIONS.length}.`);
}

const BRIGHTNESS_BY_KEY = new Map(
  NAM_PHAI_BRIGHTNESS_DEFINITIONS.map((item) => [`${item.profileId}:${item.starId}:${item.branch}`, item.brightness]),
);

export function getStarBrightness(starId: string, branch: Branch, profileId: string): BrightnessValue {
  return BRIGHTNESS_BY_KEY.get(`${profileId}:${starId}:${branch}`) ?? 'UNSPECIFIED';
}
