import { STAR_ID_BY_NAME, type ElementLabel } from './starElements';
import { NAM_PHAI_BRIGHTNESS_DEFINITIONS, NAM_PHAI_BRIGHTNESS_PROFILE_ID } from './starBrightness';

export type NamPhaiStarCategory = 'MAIN' | 'AUSPICIOUS' | 'MALEFIC' | 'NEUTRAL' | 'CYCLE' | 'ANNUAL';
export type RuleVerification = 'VERIFIED' | 'UNVERIFIED';
export type NamPhaiDependencyType = 'LUNAR_DAY_CUC' | 'YEAR_STEM' | 'YEAR_BRANCH' | 'LUNAR_MONTH' | 'LUNAR_DAY' | 'BIRTH_HOUR' | 'COMBINED' | 'CYCLE' | 'FIXED' | 'ANNUAL_STEM' | 'ANNUAL_BRANCH';
export type NamPhaiRequirement = 'REQUIRED' | 'OPTIONAL_PROFILE' | 'NOT_APPLICABLE';

export interface NamPhaiStarDefinition {
  id: string;
  displayName: string;
  aliases: string[];
  category: NamPhaiStarCategory;
  placementRuleId: string;
  placementDependencies: string[];
  layer: 'NATAL';
  dependencyType: NamPhaiDependencyType;
  calculationRuleId: string;
  sourceReferences: string[];
  requirement: NamPhaiRequirement;
  element?: ElementLabel;
  brightnessProfileId?: string;
  schoolProfileId: string;
  verificationStatus: RuleVerification;
}

export const NAM_PHAI_PROFILE_ID = 'NAM_PHAI_FULL_V1';
export const NAM_PHAI_STAR_SOURCE = 'https://www.huyenhocvietnam.vn/upload/attach/hhvn2021728112853ko16Iu.pdf';
export const NAM_PHAI_PROFILE_CONFIG = {
  id: NAM_PHAI_PROFILE_ID,
  annualProfileId: 'NAM_PHAI_ANNUAL_V1',
  brightnessProfileId: NAM_PHAI_BRIGHTNESS_PROFILE_ID,
  laiNhanRuleId: 'LAI_NHAN_EXCLUDE_TY_SUU_V1',
  hỏaLinhRuleId: 'NAM_PHAI_TRINE_START_AND_FORWARD_HOUR_V1',
  luuHaVariantId: 'YEAR_STEM_LUU_HA_NAM_PHAI_VIET_V1',
  aliases: {
    'Tả Phụ': 'Tả Phù', 'Thiên Diêu': 'Thiên Riêu', 'Bác Sỹ': 'Bác Sĩ',
    'Phượng Cát': 'Phượng Các', 'Hỉ Thần': 'Hỷ Thần', 'Văn Tinh': 'Lưu Niên Văn Tinh',
  } as const,
  annualSelfTransformationsAreEdges: false,
  khamThienFlyingOverlayEnabled: false,
} as const;
const GENERAL_AN_SAO_SOURCE = 'https://hocvienlyso.org/chuong-4-an-sao-la-so-tu-vi-phan-2.html';
const MONTH_AN_SAO_SOURCE = 'https://hocvienlyso.org/tu-hoc-tu-vi-dau-cac-sao-theo-thang-sinh.html';

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
  'Hỏa Tinh': { rule: 'NAM_PHAI_TRINE_START_AND_FORWARD_HOUR_V1', depends: ['birthYearBranch', 'birthHour'], element: 'Hỏa' },
  'Linh Tinh': { rule: 'NAM_PHAI_TRINE_START_AND_FORWARD_HOUR_V1', depends: ['birthYearBranch', 'birthHour'], element: 'Hỏa' },
  'Địa Không': { rule: 'HOUR_DI_KHONG_V1', depends: ['birthHour'], element: 'Hỏa' },
  'Địa Kiếp': { rule: 'HOUR_DI_KIEP_V1', depends: ['birthHour'], element: 'Hỏa' },
  'Lộc Tồn': { rule: 'YEAR_STEM_LOC_TON_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Thiên Mã': { rule: 'YEAR_BRANCH_THIEN_MA_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Đào Hoa': { rule: 'YEAR_BRANCH_GROUP_DAO_HOA_V1', depends: ['birthYearBranch'], element: 'Mộc' },
  'Hoa Cái': { rule: 'YEAR_BRANCH_GROUP_HOA_CAI_V1', depends: ['birthYearBranch'], element: 'Kim' },
  'Thái Tuế': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Thiếu Dương': { rule: 'YEAR_BRANCH_THAI_TUE_RING_12_V1', depends: ['birthYearBranch'], element: 'Hỏa' },
  'Thiên Không': { rule: 'YEAR_BRANCH_THIEN_KHONG_V1', depends: ['birthYearBranch'] },
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
  'Thai Phụ': { rule: 'VAN_KHUC_OFFSET_PLUS_TWO_V1', depends: ['Văn Khúc'], element: 'Kim' },
  'Phong Cáo': { rule: 'VAN_KHUC_OFFSET_MINUS_TWO_V1', depends: ['Văn Khúc'], element: 'Thổ' },
  'Thiên Hình': { rule: 'LUNAR_MONTH_THIEN_HINH_V1', depends: ['lunarMonth'], element: 'Hỏa' },
  'Thiên Riêu': { rule: 'LUNAR_MONTH_THIEN_RIEU_V1', depends: ['lunarMonth'], element: 'Thủy' },
  'Thiên Y': { rule: 'LUNAR_MONTH_THIEN_RIEU_V1', depends: ['lunarMonth'], element: 'Thủy' },
  'Thiên Tài': { rule: 'MENH_AND_BIRTH_BRANCH_THIEN_TAI_V1', depends: ['Mệnh', 'birthYearBranch'] },
  'Thiên Thọ': { rule: 'THAN_AND_BIRTH_BRANCH_THIEN_THO_V1', depends: ['Thân', 'birthYearBranch'] },
  'Thiên Thương': { rule: 'NATAL_PALACE_NOBoc_V1', depends: ['palaceNames'] },
  'Thiên Sứ': { rule: 'NATAL_PALACE_TAT_ACH_V1', depends: ['palaceNames'] },
  'Thiên La': { rule: 'FIXED_BRANCH_THIN_V1', depends: ['branch'] },
  'Địa Võng': { rule: 'FIXED_BRANCH_TUAT_V1', depends: ['branch'] },
  'Đẩu Quân': { rule: 'YEAR_BRANCH_MONTH_HOUR_DAU_QUAN_V1', depends: ['birthYearBranch', 'lunarMonth', 'birthHour'] },
  'Thiên Khốc': { rule: 'YEAR_BRANCH_KHOC_HU_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Thiên Hư': { rule: 'YEAR_BRANCH_KHOC_HU_V1', depends: ['birthYearBranch'], element: 'Thủy' },
  'Thiên Quan': { rule: 'YEAR_STEM_THIEN_QUAN_TABLE_V1', depends: ['birthYearStem'], element: 'Hỏa' },
  'Thiên Phúc': { rule: 'YEAR_STEM_THIEN_PHUC_TABLE_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Thiên Trù': { rule: 'YEAR_STEM_THIEN_TRU_TABLE_V1', depends: ['birthYearStem'], element: 'Thổ' },
  'Thiên Giải': { rule: 'LUNAR_MONTH_THIEN_GIAI_FORWARD_V1', depends: ['lunarMonth'], element: 'Hỏa' },
  'Địa Giải': { rule: 'LUNAR_MONTH_DIA_GIAI_FORWARD_V1', depends: ['lunarMonth'], element: 'Thổ' },
  'Giải Thần': { rule: 'PHUONG_CAC_ALIAS_GIAI_THAN_V1', depends: ['Phượng Các'], element: 'Mộc' },
  'Lưu Hà': { rule: 'YEAR_STEM_LUU_HA_NAM_PHAI_VIET_V1', depends: ['birthYearStem'], element: 'Thủy' },
  'Lưu Niên Văn Tinh': { rule: 'LOC_TON_PLUS_THREE_LUU_NIEN_VAN_TINH_V1', depends: ['Lộc Tồn'], element: 'Kim' },
};

const groups: Array<[NamPhaiStarCategory, string[]]> = [
  ['MAIN', ['Tử Vi','Thiên Cơ','Thái Dương','Vũ Khúc','Thiên Đồng','Liêm Trinh','Thiên Phủ','Thái Âm','Tham Lang','Cự Môn','Thiên Tướng','Thiên Lương','Thất Sát','Phá Quân']],
  ['AUSPICIOUS', ['Tả Phù','Hữu Bật','Văn Xương','Văn Khúc','Thiên Khôi','Thiên Việt','Lộc Tồn','Thiên Mã','Quốc Ấn','Đường Phù','Thiên Quan','Thiên Phúc','Thiên Trù','Lưu Niên Văn Tinh','Tam Thai','Bát Tọa','Ân Quang','Thiên Quý','Thai Phụ','Phong Cáo','Thiên Đức','Nguyệt Đức','Thiên Giải','Địa Giải','Giải Thần','Long Trì','Phượng Các','Thiên Tài','Thiên Thọ','Hoa Cái']],
  ['MALEFIC', ['Kình Dương','Đà La','Hỏa Tinh','Linh Tinh','Địa Không','Địa Kiếp','Thiên Hình','Thiên Khốc','Thiên Hư','Cô Thần','Quả Tú','Kiếp Sát','Phá Toái','Lưu Hà','Thiên Riêu','Bạch Hổ']],
  ['NEUTRAL', ['Đào Hoa','Hồng Loan','Thiên Hỷ','Thiên Y','Thiên La','Địa Võng','Thiên Thương','Thiên Sứ','Đẩu Quân']],
  ['CYCLE', ['Thái Tuế','Thiếu Dương','Thiên Không','Tang Môn','Thiếu Âm','Quan Phù','Tử Phù','Tuế Phá','Long Đức','Phúc Đức','Điếu Khách','Trực Phù','Bác Sĩ','Lực Sĩ','Thanh Long','Tiểu Hao','Tướng Quân','Tấu Thư','Phi Liêm','Hỷ Thần','Bệnh Phù','Đại Hao','Phục Binh','Quan Phủ','Tràng Sinh','Mộc Dục','Quan Đới','Lâm Quan','Đế Vượng','Suy','Bệnh','Tử','Mộ','Tuyệt','Thai','Dưỡng']],
];

const normalizeId = (name: string) => name.replace(/[Đđ]/g, (value) => value === 'Đ' ? 'D' : 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const STABLE_ID_OVERRIDES: Record<string, string> = { 'Quan Phù': 'QUAN_PHU_THAI_TUE', 'Quan Phủ': 'QUAN_PHU_BAC_SI', 'Văn Tinh': 'LUU_NIEN_VAN_TINH' };
const STAR_NAME_ALIASES: Record<string, string> = {
  'Tả Phụ': 'Tả Phù', 'Thiên Diêu': 'Thiên Riêu', 'Bác Sỹ': 'Bác Sĩ',
  'Phượng Cát': 'Phượng Các', 'Hỉ Thần': 'Hỷ Thần',
};
export const getNamPhaiStarIdForName = (name: string) => {
  const canonicalName = STAR_NAME_ALIASES[name] ?? name;
  return `NATAL:${STABLE_ID_OVERRIDES[canonicalName] ?? normalizeId(canonicalName)}`;
};

const STAR_ALIASES: Record<string, string[]> = {
  'Tả Phù': ['Tả Phụ'], 'Thiên Riêu': ['Thiên Diêu'], 'Bác Sĩ': ['Bác Sỹ'],
  'Phượng Các': ['Phượng Cát'], 'Hỷ Thần': ['Hỉ Thần'], 'Lưu Niên Văn Tinh': ['Văn Tinh'],
};
export const NAM_PHAI_STAR_REGISTRY: NamPhaiStarDefinition[] = groups.flatMap(([category, names]) => names.map((displayName) => {
  const rule = verifiedRules[displayName];
  const verified = !!rule && !rule.rule.startsWith('UNRESOLVED_');
  const ruleId = rule?.rule ?? `UNVERIFIED:${normalizeId(displayName)}`;
  const dependencyType: NamPhaiDependencyType = ruleId.startsWith('MAIN_TU_VI_BY_CUC') ? 'LUNAR_DAY_CUC'
    : ruleId.includes('YEAR_STEM') || ruleId.includes('LOC_TON') ? 'YEAR_STEM'
      : ruleId.includes('YEAR_BRANCH') ? 'YEAR_BRANCH'
        : ruleId.includes('LUNAR_MONTH') ? 'LUNAR_MONTH'
          : ruleId.includes('LUNAR_DAY') ? 'LUNAR_DAY'
            : ruleId.includes('HOUR') ? 'BIRTH_HOUR'
              : ruleId.includes('FIXED') ? 'FIXED'
                : category === 'CYCLE' ? 'CYCLE' : 'COMBINED';
  return {
    id: getNamPhaiStarIdForName(displayName),
    displayName,
    aliases: STAR_ALIASES[displayName] ?? [],
    category,
    placementRuleId: ruleId,
    calculationRuleId: ruleId,
    placementDependencies: rule?.depends ?? [],
    layer: 'NATAL',
    dependencyType,
    sourceReferences: [ruleId.includes('LUNAR_MONTH') ? MONTH_AN_SAO_SOURCE : GENERAL_AN_SAO_SOURCE, NAM_PHAI_STAR_SOURCE],
    requirement: 'REQUIRED',
    element: rule?.element,
    brightnessProfileId: category === 'MAIN' ? NAM_PHAI_BRIGHTNESS_PROFILE_ID : undefined,
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

export interface StarCoverageReport {
  profileId: string;
  requiredNatalIds: string[];
  requiredAnnualIds: string[];
  missingDefinitions: string[];
  missingPlacementRules: string[];
  unverifiedRequiredRules: string[];
  missingNatalPlacements: string[];
  missingAnnualPlacements: string[];
  missingRenderedStars: string[];
  duplicatedPlacements: string[];
  invalidBranchPlacements: string[];
  missingBrightnessRules: string[];
  passed: boolean;
}

export interface CoverageStarInput { name: string; branchIndex: number; id?: string }
export interface StarCoverageInput {
  natalStars: CoverageStarInput[];
  annualStars: CoverageStarInput[];
  renderedStarIds: string[];
}

export function isStarCoverageComplete(report: Omit<StarCoverageReport, 'passed'>): boolean {
  return report.missingDefinitions.length === 0 && report.missingPlacementRules.length === 0
    && report.unverifiedRequiredRules.length === 0 && report.missingNatalPlacements.length === 0
    && report.missingAnnualPlacements.length === 0 && report.missingRenderedStars.length === 0
    && report.duplicatedPlacements.length === 0 && report.invalidBranchPlacements.length === 0;
}

export const NAM_PHAI_OPTIONAL_STAR_VARIANTS = [
  'Thiên Vu', 'Thiên Nguyệt', 'Âm Sát', 'Niên Giải', 'Tướng Tinh', 'Vong Thần', 'Hàm Trì',
  'Tai Sát', 'Thiên Sát', 'Nguyệt Sát', 'Tức Thần', 'Phan Án', 'Tuế Dịch', 'Chỉ Bối',
  'Quán Tác', 'Hối Khí', 'Tuế Kiện',
] as const;
export const NAM_PHAI_OPTIONAL_STAR_CLASSIFICATIONS = NAM_PHAI_OPTIONAL_STAR_VARIANTS.map((name) => ({
  displayName: name,
  requirement: 'OPTIONAL_PROFILE' as const,
  placementRuleId: null,
  note: 'Không bật trong NAM_PHAI_FULL_V1; cần chọn dị bản và xác minh riêng trước khi an.',
}));

const ANNUAL_STAR_RULE_IDS: Record<string, string> = {
  'Thái Tuế': 'ANNUAL_YEAR_BRANCH_THAI_TUE_RING_V1',
  'Tang Môn': 'ANNUAL_YEAR_BRANCH_THAI_TUE_RING_V1',
  'Bạch Hổ': 'ANNUAL_YEAR_BRANCH_THAI_TUE_RING_V1',
  'Lộc Tồn': 'ANNUAL_YEAR_STEM_LOC_TON_V1', 'Kình Dương': 'ANNUAL_YEAR_STEM_KINH_DUONG_V1',
  'Đà La': 'ANNUAL_YEAR_STEM_DA_LA_V1', 'Thiên Mã': 'ANNUAL_YEAR_BRANCH_THIEN_MA_V1',
  'Thiên Khốc': 'ANNUAL_YEAR_BRANCH_THIEN_KHOC_V1', 'Thiên Hư': 'ANNUAL_YEAR_BRANCH_THIEN_HU_V1',
  'Thiên Khôi': 'ANNUAL_YEAR_STEM_KHOI_VIET_V1', 'Thiên Việt': 'ANNUAL_YEAR_STEM_KHOI_VIET_V1',
  'Văn Xương': 'ANNUAL_YEAR_STEM_VAN_XUONG_V1', 'Văn Khúc': 'ANNUAL_YEAR_STEM_VAN_KHUC_V1',
  'Đào Hoa': 'ANNUAL_YEAR_BRANCH_DAO_HOA_V1', 'Hồng Loan': 'ANNUAL_YEAR_BRANCH_HONG_LOAN_V1',
  'Thiên Hỷ': 'ANNUAL_YEAR_BRANCH_THIEN_HY_V1', 'Kiếp Sát': 'ANNUAL_YEAR_BRANCH_KIEP_SAT_V1',
};
const ANNUAL_BRANCH_SOURCE = 'https://hocvienlyso.org/nguyen-tac-an-sau-luu.html';
const ANNUAL_STEM_SOURCE = 'https://hocvienlyso.org/tu-hoc-tu-vi-dau-bai-10-cac-sao-hang-can.html';

export const NAM_PHAI_ANNUAL_STAR_REGISTRY = [
  'Thái Tuế','Tang Môn','Bạch Hổ',
  'Lộc Tồn','Kình Dương','Đà La','Thiên Mã','Thiên Khốc','Thiên Hư',
  'Thiên Khôi','Thiên Việt','Văn Xương','Văn Khúc','Đào Hoa','Hồng Loan','Thiên Hỷ','Kiếp Sát',
].map((name) => ({
  id: `ANNUAL:${normalizeId(name)}`,
  displayName: `Lưu ${name}`,
  layer: 'ANNUAL' as const,
  dependencyType: (ANNUAL_STAR_RULE_IDS[name]?.includes('STEM') ? 'ANNUAL_STEM' : 'ANNUAL_BRANCH') as NamPhaiDependencyType,
  dependencies: ['forecastYear', 'forecastCanChi'],
  placementRuleId: ANNUAL_STAR_RULE_IDS[name] ?? `UNVERIFIED:ANNUAL:${normalizeId(name)}`,
  calculationRuleId: ANNUAL_STAR_RULE_IDS[name] ?? `UNVERIFIED:ANNUAL:${normalizeId(name)}`,
  sourceReferences: [ANNUAL_STAR_RULE_IDS[name]?.includes('STEM') ? ANNUAL_STEM_SOURCE : ANNUAL_BRANCH_SOURCE, GENERAL_AN_SAO_SOURCE, NAM_PHAI_STAR_SOURCE],
  requirement: 'REQUIRED' as const,
  status: 'VERIFIED' as const,
}));

const annualRulesWithoutCalculation = NAM_PHAI_ANNUAL_STAR_REGISTRY.filter(({ calculationRuleId }) => calculationRuleId.startsWith('UNVERIFIED:'));
if (annualRulesWithoutCalculation.length) {
  throw new Error(`Thiếu calculation rule cho sao Lưu Niên: ${annualRulesWithoutCalculation.map(({ displayName }) => displayName).join(', ')}`);
}

const REQUIRED_NATAL_NAMES = groups.flatMap(([, names]) => names);
const REQUIRED_ANNUAL_IDS = NAM_PHAI_ANNUAL_STAR_REGISTRY.map(({ id }) => id);

export function buildNamPhaiStarCoverageReport(input: StarCoverageInput): StarCoverageReport {
  const requiredDefinitions = REQUIRED_NATAL_NAMES.map((name) => NAM_PHAI_STAR_REGISTRY.find((item) => item.displayName === name)).filter((item): item is NamPhaiStarDefinition => !!item);
  const requiredNatalIds = requiredDefinitions.map(({ id }) => id);
  const natalCounts = new Map<string, number>();
  input.natalStars.forEach((star) => {
    const id = star.id ?? getNamPhaiStarIdForName(star.name);
    natalCounts.set(id, (natalCounts.get(id) ?? 0) + 1);
  });
  const annualIds = input.annualStars.map(({ name }) => `ANNUAL:${normalizeId(name.replace(/^Lưu /, ''))}`);
  const rendered = new Set(input.renderedStarIds);
  const missingDefinitions = REQUIRED_NATAL_NAMES.filter((name) => !NAM_PHAI_STAR_REGISTRY.some((item) => item.displayName === name));
  const missingPlacementRules = requiredDefinitions.filter(({ calculationRuleId, placementRuleId }) => !calculationRuleId || !placementRuleId || placementRuleId.startsWith('UNVERIFIED:') || placementRuleId.startsWith('UNRESOLVED:')).map(({ id }) => id);
  const unverifiedRequiredRules = requiredDefinitions.filter(({ verificationStatus }) => verificationStatus !== 'VERIFIED').map(({ id }) => id);
  const missingNatalPlacements = requiredNatalIds.filter((id) => !natalCounts.has(id));
  const missingAnnualPlacements = REQUIRED_ANNUAL_IDS.filter((id) => !annualIds.includes(id));
  const generatedNatalIds = new Set([
    ...input.natalStars.map(({ id, name }) => id ?? getNamPhaiStarIdForName(name)),
    ...annualIds,
  ]);
  const missingRenderedStars = [...generatedNatalIds].filter((id) => !rendered.has(id));
  const duplicatedPlacements = [...natalCounts].filter(([, count]) => count > 1).map(([id]) => id);
  const invalidBranchPlacements = [...input.natalStars, ...input.annualStars]
    .filter(({ branchIndex }) => !Number.isInteger(branchIndex) || branchIndex < 0 || branchIndex > 11)
    .map(({ name, branchIndex }) => `${name}@${branchIndex}`);
  const missingBrightnessRules = requiredDefinitions.filter(({ category, displayName, id }) => category === 'MAIN' && !NAM_PHAI_BRIGHTNESS_IDS.has(STAR_ID_BY_NAME[displayName] ?? id.replace('NATAL:', ''))).map(({ id }) => id);
  const report = { profileId: NAM_PHAI_PROFILE_ID, requiredNatalIds, requiredAnnualIds: REQUIRED_ANNUAL_IDS, missingDefinitions, missingPlacementRules, unverifiedRequiredRules, missingNatalPlacements, missingAnnualPlacements, missingRenderedStars, duplicatedPlacements, invalidBranchPlacements, missingBrightnessRules };
  const passed = isStarCoverageComplete(report);
  return { ...report, passed };
}

export function buildNamPhaiStarAuditReport(generatedNames: string[], annualNames: string[] = []): StarAuditReport {
  const generatedCounts = new Map<string, number>();
  generatedNames.forEach((name) => generatedCounts.set(getNamPhaiStarIdForName(name), (generatedCounts.get(getNamPhaiStarIdForName(name)) ?? 0) + 1));
  const expected = NAM_PHAI_STAR_REGISTRY;
  const expectedIds = expected.map(({ id }) => id);
  const generatedIds = [...generatedCounts.keys()];
  const expectedAnnual = NAM_PHAI_ANNUAL_STAR_REGISTRY.map(({ id }) => id);
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
