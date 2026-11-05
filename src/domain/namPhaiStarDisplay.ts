import { NAM_PHAI_ANNUAL_STAR_REGISTRY, NAM_PHAI_PROFILE_ID, NAM_PHAI_STAR_REGISTRY } from './namPhaiStarRegistry';

export type DisplayColumn = 'LEFT_CATS' | 'RIGHT_HUNG';
export type StarNature = 'AUSPICIOUS' | 'MALEFIC' | 'CONDITIONAL';
export type StarLayer = 'NATAL' | 'ANNUAL';

export interface StarDisplayRule {
  starId: string;
  nature: StarNature;
  displayColumn: DisplayColumn;
  order: number;
  profileId: string;
}

export interface RenderableNamPhaiStar<T = unknown> {
  id: string;
  name: string;
  layer: StarLayer;
  displayColumn: DisplayColumn;
  displayOrder: number;
  data: T;
}

const LEFT_AUSPICIOUS = [
  'Tả Phù','Hữu Bật','Văn Xương','Văn Khúc','Thiên Khôi','Thiên Việt','Lộc Tồn','Quốc Ấn','Đường Phù',
  'Thiên Quan','Thiên Phúc','Thiên Trù','Ân Quang','Thiên Quý','Tam Thai','Bát Tọa','Thai Phụ','Phong Cáo',
  'Thiên Đức','Nguyệt Đức','Long Đức','Phúc Đức','Long Trì','Phượng Các','Giải Thần','Thiên Giải','Địa Giải',
  'Thiếu Dương','Thiếu Âm','Hồng Loan','Thiên Hỷ','Hoa Cái','Thiên Tài','Thiên Thọ',
  'Bác Sĩ','Thanh Long','Tấu Thư','Hỷ Thần',
];
const LEFT_CONDITIONAL = ['Thiên Mã','Đào Hoa','Thiên Y','Đẩu Quân','Lực Sĩ','Tướng Quân','Phi Liêm','Bệnh Phù','Lưu Niên Văn Tinh','Thiên Riêu'];
const RIGHT_MALEFIC = [
  'Kình Dương','Đà La','Hỏa Tinh','Linh Tinh','Địa Không','Địa Kiếp','Thiên Hình','Thiên Khốc','Thiên Hư',
  'Tang Môn','Bạch Hổ','Đại Hao','Tiểu Hao','Phục Binh','Kiếp Sát','Phá Toái','Cô Thần','Quả Tú',
  'Tuế Phá','Tử Phù','Điếu Khách',
];
const RIGHT_CONDITIONAL = ['Thái Tuế','Thiên Không','Quan Phù','Trực Phù','Thiên La','Địa Võng','Thiên Thương','Thiên Sứ','Quan Phủ','Lưu Hà'];

const ruleRows: Array<{ names: string[]; nature: StarNature; displayColumn: DisplayColumn }> = [
  { names: LEFT_AUSPICIOUS, nature: 'AUSPICIOUS', displayColumn: 'LEFT_CATS' },
  { names: LEFT_CONDITIONAL, nature: 'CONDITIONAL', displayColumn: 'LEFT_CATS' },
  { names: RIGHT_MALEFIC, nature: 'MALEFIC', displayColumn: 'RIGHT_HUNG' },
  { names: RIGHT_CONDITIONAL, nature: 'CONDITIONAL', displayColumn: 'RIGHT_HUNG' },
];

const nameRules = new Map<string, Omit<StarDisplayRule, 'starId' | 'order' | 'profileId'>>();
for (const row of ruleRows) {
  for (const name of row.names) {
    if (nameRules.has(name)) throw new Error(`Sao Nam Phái bị phân cột trùng: ${name}`);
    nameRules.set(name, { nature: row.nature, displayColumn: row.displayColumn });
  }
}

const TRANG_SINH_STAGES = new Set(['Tràng Sinh','Mộc Dục','Quan Đới','Lâm Quan','Đế Vượng','Suy','Bệnh','Tử','Mộ','Tuyệt','Thai','Dưỡng']);
const NATAL_MINOR_DEFINITIONS = NAM_PHAI_STAR_REGISTRY.filter(({ category, displayName }) => category !== 'MAIN' && !TRANG_SINH_STAGES.has(displayName));
const missingNatalRules = NATAL_MINOR_DEFINITIONS.filter(({ displayName }) => !nameRules.has(displayName)).map(({ displayName }) => displayName);
if (missingNatalRules.length) throw new Error(`Thiếu quy tắc cột hiển thị Nam Phái: ${missingNatalRules.join(', ')}`);

export const NAM_PHAI_NATAL_DISPLAY_RULES: StarDisplayRule[] = NATAL_MINOR_DEFINITIONS.map((star, index) => ({
  starId: star.id,
  ...(nameRules.get(star.displayName)!),
  order: index,
  profileId: NAM_PHAI_PROFILE_ID,
}));

const annualRuleByName = new Map(NAM_PHAI_ANNUAL_STAR_REGISTRY.map((star) => [star.displayName.replace(/^Lưu /, ''), star]));
export const NAM_PHAI_ANNUAL_DISPLAY_RULES: StarDisplayRule[] = NAM_PHAI_ANNUAL_STAR_REGISTRY.map((annualStar, index) => {
  const baseName = annualStar.displayName.replace(/^Lưu /, '');
  const display = nameRules.get(baseName);
  if (!display) throw new Error(`Thiếu quy tắc cột cho sao lưu Nam Phái: ${baseName}`);
  return { starId: annualStar.id, ...display, order: index, profileId: NAM_PHAI_PROFILE_ID };
});

export const NAM_PHAI_STAR_DISPLAY_RULES = [...NAM_PHAI_NATAL_DISPLAY_RULES, ...NAM_PHAI_ANNUAL_DISPLAY_RULES];

export function groupStarsForNamPhai<T>(stars: readonly RenderableNamPhaiStar<T>[]) {
  const byOrder = (a: RenderableNamPhaiStar, b: RenderableNamPhaiStar) => a.displayOrder - b.displayOrder;
  const sorted = (layer: StarLayer, column: DisplayColumn) => stars
    .filter((star) => star.layer === layer && star.displayColumn === column)
    .slice()
    .sort(byOrder);
  return {
    leftNatal: sorted('NATAL', 'LEFT_CATS'),
    rightNatal: sorted('NATAL', 'RIGHT_HUNG'),
    leftAnnual: sorted('ANNUAL', 'LEFT_CATS'),
    rightAnnual: sorted('ANNUAL', 'RIGHT_HUNG'),
  };
}

export function getAnnualDisplayRule(starName: string): StarDisplayRule | undefined {
  const baseName = starName.replace(/^Lưu /, '');
  const registered = annualRuleByName.get(baseName);
  return registered ? NAM_PHAI_ANNUAL_DISPLAY_RULES.find((rule) => rule.starId === registered.id) : undefined;
}

export function getNatalDisplayRule(starName: string): StarDisplayRule | undefined {
  const star = NATAL_MINOR_DEFINITIONS.find((item) => item.displayName === starName);
  return star ? NAM_PHAI_NATAL_DISPLAY_RULES.find((rule) => rule.starId === star.id) : undefined;
}
