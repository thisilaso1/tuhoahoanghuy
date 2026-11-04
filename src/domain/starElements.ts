export type ElementId = 'KIM' | 'MOC' | 'THUY' | 'HOA' | 'THO';
export type ElementLabel = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
export interface StarElement { primary: ElementId; secondary?: ElementId }

export const STAR_ELEMENTS: Record<string, StarElement> = {
  TU_VI: { primary: 'THO' }, THIEN_CO: { primary: 'MOC' }, THAI_DUONG: { primary: 'HOA' },
  VU_KHUC: { primary: 'KIM' }, THIEN_DONG: { primary: 'THUY' }, LIEM_TRINH: { primary: 'HOA' },
  THIEN_PHU: { primary: 'THO' }, THAI_AM: { primary: 'THUY' }, THAM_LANG: { primary: 'THUY', secondary: 'MOC' },
  CU_MON: { primary: 'THUY' }, THIEN_TUONG: { primary: 'THUY' }, THIEN_LUONG: { primary: 'MOC' },
  THAT_SAT: { primary: 'KIM', secondary: 'HOA' }, PHA_QUAN: { primary: 'THUY' },
  VAN_XUONG: { primary: 'KIM' }, VAN_KHUC: { primary: 'THUY' }, TA_PHU: { primary: 'THO' }, HUU_BAT: { primary: 'THUY' },
};

export const STAR_ID_BY_NAME: Record<string, keyof typeof STAR_ELEMENTS> = {
  'Tử Vi': 'TU_VI', 'Thiên Cơ': 'THIEN_CO', 'Thái Dương': 'THAI_DUONG', 'Vũ Khúc': 'VU_KHUC',
  'Thiên Đồng': 'THIEN_DONG', 'Liêm Trinh': 'LIEM_TRINH', 'Thiên Phủ': 'THIEN_PHU', 'Thái Âm': 'THAI_AM',
  'Tham Lang': 'THAM_LANG', 'Cự Môn': 'CU_MON', 'Thiên Tướng': 'THIEN_TUONG', 'Thiên Lương': 'THIEN_LUONG',
  'Thất Sát': 'THAT_SAT', 'Phá Quân': 'PHA_QUAN', 'Văn Xương': 'VAN_XUONG', 'Văn Khúc': 'VAN_KHUC',
  'Tả Phù': 'TA_PHU', 'Hữu Bật': 'HUU_BAT',
};

export const ELEMENT_LABEL: Record<ElementId, ElementLabel> = { KIM: 'Kim', MOC: 'Mộc', THUY: 'Thủy', HOA: 'Hỏa', THO: 'Thổ' };
export const ELEMENT_LABEL_ID: Record<string, ElementId> = { Kim: 'KIM', Mộc: 'MOC', Thủy: 'THUY', Hỏa: 'HOA', Thổ: 'THO' };
export const ELEMENT_IDS: ElementId[] = ['KIM', 'MOC', 'THUY', 'HOA', 'THO'];
export const DARK_ELEMENT_COLORS: Record<ElementId, string> = {
  KIM: '#D7E0E8', MOC: '#4ADE80', THUY: '#7DD3FC', HOA: '#FB7185', THO: '#E8B86D',
};
export const LIGHT_ELEMENT_COLORS: Record<ElementId, string> = {
  KIM: '#71808D', MOC: '#166534', THUY: '#075985', HOA: '#B42318', THO: '#87520C',
};

export function getStarPrimaryElement(starId: string): ElementId | undefined { return STAR_ELEMENTS[starId]?.primary; }
export function getStarPrimaryElementLabel(starId: string): ElementLabel | undefined {
  const element = getStarPrimaryElement(starId);
  return element ? ELEMENT_LABEL[element] : undefined;
}
