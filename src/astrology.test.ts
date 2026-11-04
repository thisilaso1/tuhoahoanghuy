import { describe, expect, it } from 'vitest';
import { buildChart, canChiYear, TU_HOA } from './astrology';

describe('astrology rules', () => {
  it('calculates Can Chi years', () => {
    expect(canChiYear(2024)).toEqual({ stem: 'Giáp', branch: 'Thìn' });
    expect(canChiYear(2025)).toEqual({ stem: 'Ất', branch: 'Tỵ' });
  });

  it('uses the canonical Giáp transformation table', () => {
    expect(TU_HOA.Giáp).toEqual({ Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' });
  });

  it('always creates twelve palaces', () => {
    expect(buildChart({ name: 'Test', date: '1990-01-01', time: '12:30', gender: 'Nam', calendar: 'solar', forecastYear: 2026 })).toHaveLength(12);
  });
});
