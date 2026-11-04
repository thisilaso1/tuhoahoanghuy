import { STAR_ID_BY_NAME, type ElementLabel } from './starElements';
import { NAM_PHAI_BRIGHTNESS_DEFINITIONS } from './starBrightness';

export type NamPhaiStarCategory = 'MAIN' | 'AUSPICIOUS' | 'MALEFIC' | 'NEUTRAL' | 'CYCLE' | 'ANNUAL';
export type RuleVerification = 'VERIFIED' | 'UNVERIFIED';

export interface NamPhaiStarDefinition {
  id: string;
  displayName: string;
  aliases: string[];
  category: NamPhaiStarCategory;
  placementRuleId: string;
  placementDependencies: string[];
  element?: ElementLabel;
  brightnessProfileId?: string;
  schoolProfileId: string;
  verificationStatus: RuleVerification;
}

export const NAM_PHAI_PROFILE_ID = 'NAM_PHAI_HOAI_NGUYET_V1';
export const NAM_PHAI_STAR_SOURCE = 'https://www.huyenhocvietnam.vn/upload/attach/hhvn2021728112853ko16Iu.pdf';

const verifiedRules: Record<string, { rule: string; depends: string[]; element?: ElementLabel }> = {
  'Tử Vi': { rule: 'MAIN_TU_VI_BY_CUC_DAY_V1', depends: ['lunarDay', 'cuc'], element: 'Thổ' },
  'Thiên Cơ': { rule: 'MAIN_TU_VI_SYSTEM_V1', depends: ['Tử Vi'], element: 'Mộc' },
  'Thái Dương': { rule: 'MAIN_TU_VI_SYSTEM_V1', depends: ['Tử Vi'], element: 'Hỏa' },
  'Vũ Khúc': { rule: 'MAIN_TU_VI_SYSTEM_V1', depends: ['Tử Vi'], element: 'Kim' },
  'Thiên Đồng': { rule: 'MAIN_TU_VI_SYSTEM_V1', depends: ['Tử Vi'], element: 'Thủy' },
  'Liêm Trinh': { rule: 'MAIN_TU_VI_SYSTEM_V1', depends: ['Tử Vi'], element: 'Hỏa' },
  'Thiên Phủ': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Tử Vi'], element: 'Thổ' },
  'Thái Âm': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Thủy' },
  'Tham Lang': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Thủy' },
  'Cự Môn': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Thủy' },
  'Thiên Tướng': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Thủy' },
  'Thiên Lương': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Mộc' },
  'Thất Sát': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Kim' },
  'Phá Quân': { rule: 'MAIN_THIEN_PHU_SYSTEM_V1', depends: ['Thiên Phủ'], element: 'Thủy' },
  'Tả Phù': { rule: 'MONTH_TA_PHU_V1', depends: ['lunarMonth'], element: 'Thổ' },
  'Hữu Bật': { rule: 'MONTH_HUU_BAT_V1', depends: ['lunarMonth'], element: 'Thủy' },
  'Văn Xương': { rule: 'HOUR_VAN_XUONG_V1', depends: ['birthHour'], element: 'Kim' },
  'Văn Khúc': { rule: 'HOUR_VAN_KHUC_V1', depends: ['birthHour'], element: 'Thủy' },
  'Thiên Khôi': { rule: 'YEAR_STEM_KHOI_V1', depends: ['birthYearStem'], element: 'Hỏa' },
  'Thiên Việt': { rule: 'YEAR_STEM_VIET_V1', depends: ['birthYearStem'], element: 'Hỏa' },
  'Kình Dương': { rule: 'YEAR_STEM_LOC_TON_OFFSET_PLUS_ONE_V1', depends: ['birthYearStem'], element: 'Kim' },
  'Đà La': { rule: 'YEAR_STEM_LOC_TON_OFFSET_MINUS_ONE_V1', depends: ['birthYearStem'], element: 'Kim' },
  'Hỏa Tinh': { rule: 'YEAR_GROUP_AND_HOUR_FIRE_V1', depends: ['birthYearBranch', 'birthHour', 'gender', 'birthYearPolarity'], element: 'Hỏa' },
  'Linh Tinh': { rule: 'YEAR_GROUP_AND_HOUR_BELL_V1', depends: ['birthYearBranch', 'birthHour', 'gender', 'birthYearPolarity'], element: 'Hỏa' },
  'Địa Không': { rule: 'HOUR_DI_KHONG_V1', depends: ['birthHour'], element: 'Hỏa' },
  'Địa Kiếp': { rule: 'HOUR_DI_KIEP_V1', depends: ['birthHour'], element: 'Hỏa' },
  'Lộc Tồn': { rule: 'YEAR_STEM_LOC_TON_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Thiên Mã': { rule: 'YEAR_BRANCH_THIEN_MA_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Đào Hoa': { rule: 'YEAR_BRANCH_GROUP_DAO_HOA_V1', depends: ['birthYearBranch'], element: 'Mộc' },
  'Hoa Cái': { rule: 'YEAR_BRANCH_GROUP_HOA_CAI_V1', depends: ['birthYearBranch'], element: 'Kim' },
  'Thái Tuế': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Thiếu Dương': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Tang Môn': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Mộc' },
  'Thiếu Âm': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Quan Phù': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Tử Phù': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Tuế Phá': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Long Đức': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Bạch Hổ': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Kim' },
  'Phúc Đức': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Thổ' },
  'Điếu Khách': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Trực Phù': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Bác Sĩ': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Thủy' },
  'Lực Sĩ': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Thanh Long': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Thủy' },
  'Tiểu Hao': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Tướng Quân': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Mộc' },
  'Tấu Thư': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Kim' },
  'Phi Liêm': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Hỷ Thần': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Bệnh Phù': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Thổ' },
  'Đại Hao': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Phục Binh': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Quan Phủ': { rule: 'LOC_TON_BAC_SI_RING_V1', depends: ['birthYearStem', 'gender'], element: 'Hỏa' },
  'Tràng Sinh': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Mộc Dục': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Quan Đới': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Lâm Quan': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Đế Vượng': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Suy': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Bệnh': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Tử': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Mộ': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Tuyệt': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Thai': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Dưỡng': { rule: 'CUC_TRANG_SINH_RING_V1', depends: ['cuc', 'birthYearStem', 'gender'] },
  'Hồng Loan': { rule: 'YEAR_BRANCH_HONG_LOAN_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Thiên Hỷ': { rule: 'YEAR_BRANCH_THIEN_HY_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Cô Thần': { rule: 'YEAR_BRANCH_CO_THAN_QUA_TU_V1', depends: ['birthYearBranch'], element: 'Thổ' },
  'Quả Tú': { rule: 'YEAR_BRANCH_CO_THAN_QUA_TU_V1', depends: ['birthYearBranch'], element: 'Thổ' },
  'Thiên Đức': { rule: 'YEAR_BRANCH_THIEN_NGUYET_DUC_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Nguyệt Đức': { rule: 'YEAR_BRANCH_THIEN_NGUYET_DUC_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Kiếp Sát': { rule: 'YEAR_BRANCH_KIEP_SAT_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Phá Toái': { rule: 'YEAR_BRANCH_PHA_TOAI_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Long Trì': { rule: 'YEAR_BRANCH_LONG_TRI_PHUONG_CAC_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Phượng Các': { rule: 'YEAR_BRANCH_LONG_TRI_PHUONG_CAC_V1', depends: ['birthYearBranch'], element: 'Mộc' },
  'Quốc Ấn': { rule: 'YEAR_STEM_LOC_TON_OFFSET_PLUS_EIGHT_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Đường Phù': { rule: 'YEAR_STEM_LOC_TON_OFFSET_MINUS_SEVEN_V1', depends: ['birthYearStem'], element: 'Mộc' },
  'Tam Thai': { rule: 'LUNAR_DAY_FROM_TA_PHU_V1', depends: ['Tả Phù', 'lunarDay'], element: 'Thủy' },
  'Bát Tọa': { rule: 'LUNAR_DAY_FROM_HUU_BAT_V1', depends: ['Hữu Bật', 'lunarDay'], element: 'Mộc' },
  'Ân Quang': { rule: 'LUNAR_DAY_FROM_VAN_XUONG_V1', depends: ['Văn Xương', 'lunarDay'], element: 'Mộc' },
  'Thiên Quý': { rule: 'LUNAR_DAY_FROM_VAN_KHUC_V1', depends: ['Văn Khúc', 'lunarDay'], element: 'Thổ' },
  'Thai Phụ': { rule: 'VAN_KHUC_ADJACENT_V1', depends: ['Văn Khúc'], element: 'Kim' },
  'Phong Cáo': { rule: 'VAN_KHUC_ADJACENT_V1', depends: ['Văn Khúc'], element: 'Thổ' },
  'Thiên Hình': { rule: 'LUNAR_MONTH_THIEN_HINH_V1', depends: ['lunarMonth'], element: 'Hỏa' },
  'Thiên Riêu': { rule: 'LUNAR_MONTH_THIEN_RIEU_V1', depends: ['lunarMonth'], element: 'Thủy' },
  'Thiên Y': { rule: 'LUNAR_MONTH_THIEN_RIEU_V1', depends: ['lunarMonth'], element: 'Thủy' },
  'Thiên Tài': { rule: 'MENH_AND_BIRTH_BRANCH_THIEN_TAI_V1', depends: ['Mệnh', 'birthYearBranch'] },
  'Thiên Thọ': { rule: 'THAN_AND_BIRTH_BRANCH_THIEN_THO_V1', depends: ['Thân', 'birthYearBranch'] },
  'Thiên Thương': { rule: 'FIXED_NATAL_PALACE_NOBoc_V1', depends: ['palaceNames'] },
  'Thiên Sứ': { rule: 'FIXED_NATAL_PALACE_TAT_ACH_V1', depends: ['palaceNames'] },
  'Thiên La': { rule: 'FIXED_BRANCH_THIN_V1', depends: ['branch'] },
  'Địa Võng': { rule: 'FIXED_BRANCH_TUAT_V1', depends: ['branch'] },
  'Đẩu Quân': { rule: 'YEAR_BRANCH_MONTH_HOUR_DAU_QUAN_V1', depends: ['birthYearBranch', 'lunarMonth', 'birthHour'] },
  'Thiên Khốc': { rule: 'YEAR_BRANCH_KHOC_HU_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Thiên Hư': { rule: 'YEAR_BRANCH_KHOC_HU_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Văn Tinh': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['schoolDefinition'], element: 'Kim' },
  'Thiên Quan': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['birthYearStem'], element: 'Hỏa' },
  'Thiên Phúc': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Thiên Trù': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Thiên Giải': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['lunarMonth'], element: 'Hỏa' },
  'Địa Giải': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['lunarMonth'], element: 'Thổ' },
  'Giải Thần': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['yearBranch'], element: 'Mộc' },
  'Thiên Không': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['yearBranch'] },
  'Lưu Hà': { rule: 'UNRESOLVED_PROFILE_VARIANT_V1', depends: ['birthYearStem'], element: 'Thủy' },
};

const groups: Array<[NamPhaiStarCategory, string[]]> = [
  ['MAIN', ['Tử Vi','Thiên Cơ','Thái Dương','Vũ Khúc','Thiên Đồng','Liêm Trinh','Thiên Phủ','Thái Âm','Tham Lang','Cự Môn','Thiên Tướng','Thiên Lương','Thất Sát','Phá Quân']],
  ['AUSPICIOUS', ['Tả Phù','Hữu Bật','Văn Xương','Văn Khúc','Thiên Khôi','Thiên Việt','Lộc Tồn','Thiên Mã','Quốc Ấn','Đường Phù','Thiên Quan','Thiên Phúc','Thiên Trù','Văn Tinh','Tam Thai','Bát Tọa','Ân Quang','Thiên Quý','Thai Phụ','Phong Cáo','Thiên Đức','Nguyệt Đức','Thiên Giải','Địa Giải','Giải Thần','Long Trì','Phượng Các','Thiên Tài','Thiên Thọ','Hoa Cái']],
  ['MALEFIC', ['Kình Dương','Đà La','Hỏa Tinh','Linh Tinh','Địa Không','Địa Kiếp','Thiên Hình','Thiên Khốc','Thiên Hư','Cô Thần','Quả Tú','Kiếp Sát','Phá Toái','Thiên Không','Lưu Hà','Thiên Riêu','Bạch Hổ']],
  ['NEUTRAL', ['Đào Hoa','Hồng Loan','Thiên Hỷ','Thiên Y','Thiên La','Địa Võng','Thiên Thương','Thiên Sứ','Đẩu Quân']],
  ['CYCLE', ['Thái Tuế','Thiếu Dương','Tang Môn','Thiếu Âm','Quan Phù','Tử Phù','Tuế Phá','Long Đức','Phúc Đức','Điếu Khách','Trực Phù','Bác Sĩ','Lực Sĩ','Thanh Long','Tiểu Hao','Tướng Quân','Tấu Thư','Phi Liêm','Hỷ Thần','Bệnh Phù','Đại Hao','Phục Binh','Quan Phủ','Tràng Sinh','Mộc Dục','Quan Đới','Lâm Quan','Đế Vượng','Suy','Bệnh','Tử','Mộ','Tuyệt','Thai','Dưỡng']],
];

const normalizeId = (name: string) => name.replace(/[Đđ]/g, (value) => value === 'Đ' ? 'D' : 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const STABLE_ID_OVERRIDES: Record<string, string> = { 'Quan Phù': 'QUAN_PHU_THAI_TUE', 'Quan Phủ': 'QUAN_PHU_BAC_SI' };
export const getNamPhaiStarIdForName = (name: string) => `NATAL:${STABLE_ID_OVERRIDES[name] ?? normalizeId(name)}`;

export const NAM_PHAI_STAR_REGISTRY: NamPhaiStarDefinition[] = groups.flatMap(([category, names]) => names.map((displayName) => {
  const rule = verifiedRules[displayName];
  const verified = !!rule && !rule.rule.startsWith('UNRESOLVED_');
  return {
    id: getNamPhaiStarIdForName(displayName),
    displayName,
    aliases: [],
    category,
    placementRuleId: rule?.rule ?? `UNVERIFIED:${normalizeId(displayName)}`,
    placementDependencies: rule?.depends ?? [],
    element: rule?.element,
    brightnessProfileId: category === 'MAIN' ? 'NAM_PHAI_FULL_V1' : undefined,
    schoolProfileId: NAM_PHAI_PROFILE_ID,
    verificationStatus: verified ? 'VERIFIED' : 'UNVERIFIED',
  };
}));

export interface StarAuditReport {
  profileId: string;
  expectedStarIds: string[];
  generatedStarIds: string[];
  missingStarIds: string[];
  duplicatedStarIds: string[];
  unverifiedRuleIds: string[];
  missingBrightnessIds: string[];
  expectedAnnualStarIds: string[];
  generatedAnnualStarIds: string[];
  missingAnnualStarIds: string[];
}

export function buildNamPhaiStarAuditReport(generatedNames: string[], annualNames: string[] = []): StarAuditReport {
  const generatedCounts = new Map<string, number>();
  generatedNames.forEach((name) => generatedCounts.set(getNamPhaiStarIdForName(name), (generatedCounts.get(getNamPhaiStarIdForName(name)) ?? 0) + 1));
  const expected = NAM_PHAI_STAR_REGISTRY;
  const expectedIds = expected.map(({ id }) => id);
  const generatedIds = [...generatedCounts.keys()];
  const expectedAnnual = ['THAI_TUE','THIEU_DUONG','TANG_MON','THIEU_AM','QUAN_PHU','TU_PHU','TUE_PHA','LONG_DUC','BACH_HO','PHUC_DUC','DIEU_KHACH','TRUC_PHU','LOC_TON','KINH_DUONG','DA_LA','THIEN_MA','THIEN_KHOC','THIEN_HU','THIEN_KHOI','THIEN_VIET','VAN_XUONG','VAN_KHUC','DAO_HOA','HONG_LOAN','THIEN_HY'].map((id) => `ANNUAL:${id}`);
  const annualIds = annualNames.map((name) => `ANNUAL:${normalizeId(name.replace(/^Lưu /, ''))}`);
  return {
    profileId: NAM_PHAI_PROFILE_ID,
    expectedStarIds: expectedIds,
    generatedStarIds: generatedIds,
    missingStarIds: expectedIds.filter((id) => !generatedCounts.has(id)),
    duplicatedStarIds: [...generatedCounts].filter(([, count]) => count > 1).map(([id]) => id),
    unverifiedRuleIds: [...new Set(expected.filter(({ verificationStatus }) => verificationStatus === 'UNVERIFIED').map(({ placementRuleId }) => placementRuleId))],
    missingBrightnessIds: expected.filter(({ category, displayName, id }) => category === 'MAIN' && !NAM_PHAI_BRIGHTNESS_IDS.has(STAR_ID_BY_NAME[displayName] ?? id.replace('NATAL:', ''))).map(({ id }) => id),
    expectedAnnualStarIds: expectedAnnual,
    generatedAnnualStarIds: annualIds,
    missingAnnualStarIds: expectedAnnual.filter((id) => !annualIds.includes(id)),
  };
}

const NAM_PHAI_BRIGHTNESS_IDS = new Set(NAM_PHAI_BRIGHTNESS_DEFINITIONS.map(({ starId }) => starId));
