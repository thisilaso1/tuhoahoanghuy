import { describe, expect, it } from 'vitest';
import { combineStarReadings, isStarListOnly } from './combinePalaceReading';

const sources = [
  { title: 'Thiên Phủ · Quan Lộc · Thân', text: 'Thiên Phủ · Quan Lộc · Thân\nRất hợp làm tài chính, ngân hàng, quản trị doanh nghiệp, kiểm toán hoặc điều hành lớn.' },
  { title: 'Tử Vi · Quan Lộc · Thân', text: 'Tử Vi · Quan Lộc · Thân\nSự nghiệp vững vàng, hợp làm quản lý, chuyên gia hoặc chủ doanh nghiệp tự lập' },
];

describe('combineStarReadings', () => {
  it('merges each main star source into one answer in palace order', () => {
    expect(combineStarReadings(['Tử Vi', 'Thiên Phủ'], sources)).toBe(
      'Với Tử Vi, sự nghiệp vững vàng, hợp làm quản lý, chuyên gia hoặc chủ doanh nghiệp tự lập. '
      + 'Với Thiên Phủ, rất hợp làm tài chính, ngân hàng, quản trị doanh nghiệp, kiểm toán hoặc điều hành lớn.',
    );
  });

  it('returns null for one star or when a star has no source', () => {
    expect(combineStarReadings(['Tử Vi'], sources)).toBeNull();
    expect(combineStarReadings(['Tử Vi', 'Thất Sát'], sources)).toBeNull();
  });

  it('detects an overview that only lists stars and elements', () => {
    expect(isStarListOnly('Tử Vi: Thổ, Thiên Phủ: Thổ', ['Tử Vi', 'Thiên Phủ'])).toBe(true);
    expect(isStarListOnly('Tử Vi gặp Thiên Phủ giúp sự nghiệp ổn định.', ['Tử Vi', 'Thiên Phủ'])).toBe(false);
  });
});
