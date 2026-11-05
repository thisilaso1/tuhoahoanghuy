import type { Branch, NatalChart, Palace, Stem } from './types';

const mod12 = (value: number) => ((value % 12) + 12) % 12;

export interface NamPhaiPalaceRelations {
  self: number;
  tamHop: [number, number];
  xungChieu: number;
  giapCung: [number, number];
}

export function getNamPhaiPalaceRelations(index: number): NamPhaiPalaceRelations {
  if (!Number.isInteger(index) || index < 0 || index > 11) throw new RangeError('Palace index must be 0..11.');
  return {
    self: index,
    tamHop: [mod12(index + 4), mod12(index + 8)],
    xungChieu: mod12(index + 6),
    giapCung: [mod12(index - 1), mod12(index + 1)],
  };
}

export type LaiNhanResult =
  | { status: 'FOUND'; palace: Palace; birthYearStem: Stem; branch: Branch; ruleId: 'LAI_NHAN_EXCLUDE_TY_SUU_V1' }
  | { status: 'NOT_UNIQUE'; candidates: Palace[]; birthYearStem: Stem; ruleId: 'LAI_NHAN_EXCLUDE_TY_SUU_V1' };

export function findNamPhaiLaiNhanPalace(chart: NatalChart): LaiNhanResult {
  const birthYearStem = chart.birthCanChi.year.stem;
  const matches = chart.palaces.filter((palace) => palace.stem === birthYearStem);
  const selected = matches.length > 1 ? matches.filter((palace) => palace.branch !== 'Tý' && palace.branch !== 'Sửu') : matches;
  if (selected.length !== 1) return { status: 'NOT_UNIQUE', candidates: selected, birthYearStem, ruleId: 'LAI_NHAN_EXCLUDE_TY_SUU_V1' };
  return { status: 'FOUND', palace: selected[0], birthYearStem, branch: selected[0].branch, ruleId: 'LAI_NHAN_EXCLUDE_TY_SUU_V1' };
}
