import { describe, expect, it } from 'vitest';
import { calculateAnnualLimitState, calculateTieuHanBranchIndex, getAnnualPalaceNames, getLeapLunarMonth } from './annualLimits';
import { BRANCHES, PALACE_NAMES } from './types';
import { generateNatalChart } from './tuViEngine';
import { getAnnualTransformations, getTransformationsForStem } from './tuHoaEngine';
import { getMonthCanChi } from './lunarCalendar';

describe('Tra hạn Khâm Thiên', () => {
  const chart = generateNatalChart({
    name: 'Canh Thìn', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026,
  });

  it('an Tiểu hạn thuận cho nam và nghịch cho nữ tại cả 12 địa chi', () => {
    const starts = [10, 7, 4, 1, 10, 7, 4, 1, 10, 7, 4, 1];
    for (const [index, branch] of BRANCHES.entries()) {
      for (const age of [1, 12, 13, 24, 25, 120]) {
        expect(calculateTieuHanBranchIndex(branch, 2000, 1999 + age, 'Nam')).toBe((starts[index] + age - 1) % 12);
        expect(calculateTieuHanBranchIndex(branch, 2000, 1999 + age, 'Nữ')).toBe((starts[index] - age + 121) % 12);
      }
    }
  });

  it('tra Tiểu hạn Canh Thìn theo năm và tách riêng Lưu niên Mệnh', () => {
    const branches = Array.from({ length: 8 }, (_, offset) => {
      const state = calculateAnnualLimitState(chart, 2024 + offset);
      expect(state.lunarAge).toBe(25 + offset);
      expect(state.tieuHan.palaceName).toBe(chart.palaces[state.tieuHan.branchIndex].name);
      return BRANCHES[state.tieuHan.branchIndex];
    });
    expect(branches).toEqual(['Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ']);
    const names = getAnnualPalaceNames(2026);
    expect(names[BRANCHES.indexOf('Ngọ')]).toBe('Mệnh');
    expect(names[BRANCHES.indexOf('Mùi')]).toBe(PALACE_NAMES[1]);
    expect(new Set(names).size).toBe(12);
  });

  it('an đủ 12 tháng theo từng phương pháp và giữ nguyên lá số gốc', () => {
    const original = structuredClone(chart.palaces);
    const a = calculateAnnualLimitState(chart, 2026, 2);
    const b = calculateAnnualLimitState(chart, 2026, 2, 'fixed_branch');
    expect(a.monthlyLimits.map(({ branchIndex }) => branchIndex)).toEqual([10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(b.monthlyLimits.map(({ branchIndex }) => branchIndex)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]);
    expect(a.tieuHan).toEqual(b.tieuHan);
    expect(chart.palaces).toEqual(original);
  });

  it('phân biệt tháng nhuận thực tế với 12 tháng thường', () => {
    expect(getLeapLunarMonth(2025)).toBe(6);
    expect(getLeapLunarMonth(2026)).toBeUndefined();
  });

  it('tra Tứ Hóa lưu niên và lưu nguyệt theo Can của từng lớp', () => {
    const annual = getAnnualTransformations(chart, 2026);
    const monthly = getTransformationsForStem(chart, getMonthCanChi('Bính', 1).stem, 'kham_thien');
    expect(annual.find(({ type }) => type === 'Lộc')?.star).toBe('Thiên Đồng');
    expect(monthly.find(({ type }) => type === 'Lộc')?.star).toBe('Thái Dương');
    for (const item of [...annual, ...monthly]) {
      expect(chart.palaces[item.palaceIndex].name).toBe(item.palaceName);
    }
  });
});
