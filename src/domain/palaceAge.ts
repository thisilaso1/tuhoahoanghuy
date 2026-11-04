import { BRANCHES, Branch, Palace, STEMS, Stem } from './types';

export type AgeMatchMode = 'FULL_CAN_CHI' | 'BRANCH_ONLY';

export interface PalaceAgeOptions {
  enabled: boolean;
  mode: AgeMatchMode;
  startYear: number;
  endYear: number;
  nearestToBirthYearOnly: boolean;
}

export interface PalaceAgeMapping {
  palaceId: string;
  palaceStem: Stem;
  palaceBranch: Branch;
  matchingYears: number[];
  mode: AgeMatchMode;
}

export function getSexagenaryYear(year: number): { stem: Stem; branch: Branch } {
  if (!Number.isInteger(year)) throw new Error(`Năm Can Chi phải là số nguyên: ${year}`);
  const cycle = ((year - 1984) % 60 + 60) % 60;
  return { stem: STEMS[cycle % 10], branch: BRANCHES[cycle % 12] };
}

export function getPalaceAgeMappings(
  palaces: Palace[],
  birthLunarYear: number,
  options: PalaceAgeOptions,
): PalaceAgeMapping[] {
  if (!options.enabled) return [];
  if (!Number.isInteger(options.startYear) || !Number.isInteger(options.endYear) || options.startYear > options.endYear) return [];

  return palaces.map((palace) => {
    const matchingYears: number[] = [];
    for (let year = options.startYear; year <= options.endYear; year += 1) {
      const canChi = getSexagenaryYear(year);
      const matches = options.mode === 'FULL_CAN_CHI'
        ? canChi.stem === palace.stem && canChi.branch === palace.branch
        : canChi.branch === palace.branch;
      if (matches) matchingYears.push(year);
    }

    if (options.nearestToBirthYearOnly && matchingYears.length > 1) {
      matchingYears.sort((a, b) => Math.abs(a - birthLunarYear) - Math.abs(b - birthLunarYear) || a - b);
      matchingYears.splice(1);
    }

    return {
      palaceId: `palace-${palace.index}`,
      palaceStem: palace.stem,
      palaceBranch: palace.branch,
      matchingYears,
      mode: options.mode,
    };
  });
}
