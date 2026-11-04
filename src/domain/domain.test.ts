import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PalaceCell } from '../components/chart/PalaceCell';
import { NatalChart12 } from '../components/chart/NatalChart12';
import { getYearCanChi, getHourBranch, NAP_AM_TABLE, solarToLunar, lunarToSolar, getDayCanChi } from './lunarCalendar';
import { calculateCuc, findMenhAndThan, generateNatalChart, getTuanTrietBranches, placeMajorStars, placeMinorStars, placeTuVi } from './tuViEngine';
import { calculateAllFlyingTransformations, getBirthYearTransformations, getPalaceTransformationProfile, TU_HOA_CARRIER_STARS, TU_HOA_KHAM_THIEN, validateTransformationCarriers } from './tuHoaEngine';
import { findHexagramByBinary, generateHexagramFromTosses } from './kinhDichEngine';
import { DeterministicToolExecutor } from '../ai/tools';
import { getPalaceAgeMappings, getSexagenaryYear } from './palaceAge';
import { getDisplayedPalaceStars, KHAM_THIEN_VISIBLE_STARS } from './starVisibility';
import { calculateAnnualLimitState, calculateTieuHanBranchIndex } from './annualLimits';

describe('Domain Astrology & I Ching Engines', () => {
  it('calculates lunar calendar and Can Chi correctly', () => {
    const canChi2026 = getYearCanChi(2026);
    expect(canChi2026).toEqual({ stem: 'Bính', branch: 'Ngọ' });

    const canChi2024 = getYearCanChi(2024);
    expect(canChi2024).toEqual({ stem: 'Giáp', branch: 'Thìn' });

    expect(getHourBranch(9, 30)).toBe('Tỵ');
    expect(getHourBranch(23, 15)).toBe('Tý');
    expect(getHourBranch(0, 30)).toBe('Tý');

    expect(NAP_AM_TABLE['Bính Ngọ']).toBe('Thiên Hà Thủy');
    expect(NAP_AM_TABLE['Giáp Tý']).toBe('Hải Trung Kim');
  });

  it('correctly calculates canonical Vietnamese astronomical dates (Tết 2024 & Leap month 2023)', () => {
    // 1. Tết Giáp Thìn: 10/02/2024 dương lịch -> Ngày 1 tháng 1 năm Giáp Thìn
    const tet2024 = solarToLunar(10, 2, 2024);
    expect(tet2024.lDay).toBe(1);
    expect(tet2024.lMonth).toBe(1);
    expect(tet2024.lYear).toBe(2024);

    // 2. Ngày đầu tháng 2 nhuận năm Quý Mão: 22/03/2023 dương lịch -> Ngày 1 tháng 2 Nhuận
    const leap2023 = solarToLunar(22, 3, 2023);
    expect(leap2023.lDay).toBe(1);
    expect(leap2023.lMonth).toBe(2);
    expect(leap2023.isLeap).toBe(true);
    expect(lunarToSolar(1, 2, 2023, true)).toEqual({ day: 22, month: 3, year: 2023 });
    expect(lunarToSolar(28, 8, 2000)).toEqual({ day: 25, month: 9, year: 2000 });

    // 3. Biên giờ Tý (23h): Ngày hôm trước sang ngày hôm sau
    const dayCanChiBefore = getDayCanChi(2024, 2, 10, 22);
    const dayCanChiAfter = getDayCanChi(2024, 2, 10, 23);
    expect(dayCanChiBefore.branch).not.toEqual(dayCanChiAfter.branch);
  });

  it('determines Mệnh & Thân and Cục', () => {
    // Tháng 1 âm, Giờ Tý (0) -> Mệnh và Thân đồng cung tại Dần (index 2)
    const { menhIndex, thanIndex } = findMenhAndThan(1, 'Tý');
    expect(menhIndex).toBe(2);
    expect(thanIndex).toBe(2);

    // Cung Mệnh can Bính chi Ngọ -> Thiên Hà Thủy -> Thủy Nhị Cục
    const cuc = calculateCuc('Bính', 'Ngọ');
    expect(cuc.name).toBe('Thủy Nhị Cục');
    expect(cuc.number).toBe(2);
  });

  it('places Tử Vi and 14 major stars deterministically', () => {
    // Thủy Nhị Cục (2), ngày 18 -> Sửu=1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9...
    // Tra bảng chuẩn: Thủy Nhị Cục ngày 18 tại Dậu (index 9) hoặc Tuất (index 10)
    const tuViPos = placeTuVi(2, 18);
    expect(tuViPos).toBeGreaterThanOrEqual(0);
    expect(tuViPos).toBeLessThan(12);

    const stars = placeMajorStars(tuViPos);
    expect(Object.keys(stars)).toHaveLength(14);
    expect(stars['Tử Vi']).toBe(tuViPos);
  });

  it('places all four Khâm Thiên transformable auxiliary stars across every hour and lunar month', () => {
    const branches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
    const mod12 = (value: number) => ((value % 12) + 12) % 12;

    branches.forEach((hourBranch, hourIndex) => {
      const stars = placeMinorStars('Canh', 'Thìn', 1, hourBranch);
      expect(stars['Văn Xương']).toBe(mod12(10 - hourIndex));
      expect(stars['Văn Khúc']).toBe(mod12(4 + hourIndex));
    });
    branches.forEach((_, monthIndex) => {
      const lunarMonth = monthIndex + 1;
      const stars = placeMinorStars('Canh', 'Thìn', lunarMonth, 'Tý');
      expect(stars['Tả Phù']).toBe(mod12(4 + monthIndex));
      expect(stars['Hữu Bật']).toBe(mod12(10 - monthIndex));
    });

    // Changing gender is not an input to auxiliary-star placement.
    expect(placeMinorStars('Canh', 'Thìn', 8, 'Tỵ')).toMatchObject({
      'Văn Xương': 5, 'Văn Khúc': 9, 'Tả Phù': 11, 'Hữu Bật': 3,
    });
  });

  it('maps palace ages through the full 60-year Can Chi cycle and branch-only mode', () => {
    const expected60 = Array.from({ length: 60 }, (_, offset) => {
      const year = 1984 + offset;
      return { year, ...getSexagenaryYear(year) };
    });
    expect(new Set(expected60.map(({ stem, branch }) => `${stem} ${branch}`)).size).toBe(60);
    expect(getSexagenaryYear(1984)).toEqual({ stem: 'Giáp', branch: 'Tý' });
    expect(getSexagenaryYear(2044)).toEqual(getSexagenaryYear(1984));
    expect(getSexagenaryYear(1999).branch).toBe('Mão');
    expect(getSexagenaryYear(2011).branch).toBe('Mão');

    const chart = generateNatalChart({ name: 'Golden', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const starsBefore = chart.palaces.map((palace) => [...palace.majorStars, ...palace.minorStars].map((star) => star.name));
    const phiEdgesBefore = calculateAllFlyingTransformations(chart).map((edge) => edge.id);
    const full = getPalaceAgeMappings(chart.palaces, chart.lunarDate.year, {
      enabled: true, mode: 'FULL_CAN_CHI', startYear: 1920, endYear: 2030, nearestToBirthYearOnly: false,
    });
    const expected: Record<string, number[]> = {
      Mệnh: [1940, 2000], 'Phụ Mẫu': [1941, 2001], 'Phúc Đức': [1942, 2002], 'Điền Trạch': [1943, 2003],
      'Quan Lộc': [1944, 2004], 'Nô Bộc': [1945, 2005], 'Thiên Di': [1946, 2006], 'Tật Ách': [1947, 2007],
      'Tài Bạch': [1948, 2008], 'Tử Tức': [1949, 2009], 'Phu Thê': [1938, 1998], 'Huynh Đệ': [1939, 1999],
    };
    full.forEach((mapping, index) => expect(mapping.matchingYears).toEqual(expected[chart.palaces[index].name]));

    const siblings = chart.palaces.find((palace) => palace.name === 'Huynh Đệ')!;
    const branchOnly = getPalaceAgeMappings([siblings], chart.lunarDate.year, {
      enabled: true, mode: 'BRANCH_ONLY', startYear: 1975, endYear: 2023, nearestToBirthYearOnly: false,
    });
    expect(branchOnly[0].matchingYears).toEqual([1975, 1987, 1999, 2011, 2023]);
    expect(getPalaceAgeMappings([siblings], chart.lunarDate.year, {
      enabled: true, mode: 'FULL_CAN_CHI', startYear: 1920, endYear: 2030, nearestToBirthYearOnly: true,
    })[0].matchingYears).toEqual([1999]);
    expect(getPalaceAgeMappings(chart.palaces, chart.lunarDate.year, {
      enabled: false, mode: 'FULL_CAN_CHI', startYear: 1920, endYear: 2030, nearestToBirthYearOnly: false,
    })).toEqual([]);
    expect(chart.palaces.map((palace) => [...palace.majorStars, ...palace.minorStars].map((star) => star.name))).toEqual(starsBefore);
    expect(calculateAllFlyingTransformations(chart).map((edge) => edge.id)).toEqual(phiEdgesBefore);

    const beforeTet = generateNatalChart({ name: 'Before Tet', date: '2000-02-04', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    expect(beforeTet.birthCanChi.year).toEqual({ stem: 'Kỷ', branch: 'Mão' });
    expect(beforeTet.lunarDate.year).toBe(1999);
  });

  it('generates a complete 12-palace Natal Chart', () => {
    const chart = generateNatalChart({
      name: 'Nguyễn Minh An',
      date: '1992-08-18',
      time: '09:30',
      gender: 'Nam',
      calendar: 'solar',
      forecastYear: 2026,
    });

    expect(chart.palaces).toHaveLength(12);
    expect(chart.name).toBe('Nguyễn Minh An');
    expect(chart.forecastCanChi.stem).toBe('Bính');
    expect(chart.cuc.number).toBeGreaterThanOrEqual(2);
    expect(chart.cuc.number).toBeLessThanOrEqual(6);

    const menhPalace = chart.palaces[chart.menhPalaceIndex];
    expect(menhPalace.name).toBe('Mệnh');
  });

  it('matches the supplied 25/09/2000 10:20 birth chart reference', () => {
    expect(solarToLunar(25, 9, 2000)).toEqual({ lDay: 28, lMonth: 8, lYear: 2000, isLeap: false });

    const chart = generateNatalChart({
      name: 'Đương số đối chiếu',
      date: '2000-09-25',
      time: '10:20',
      gender: 'Nam',
      calendar: 'solar',
      forecastYear: 2026,
    });

    expect(chart.birthCanChi.year).toEqual({ stem: 'Canh', branch: 'Thìn' });
    expect(chart.birthCanChi.day).toEqual({ stem: 'Bính', branch: 'Tuất' });
    expect(chart.birthCanChi.hour).toEqual({ stem: 'Quý', branch: 'Tỵ' });
    expect(chart.palaces[chart.menhPalaceIndex].branch).toBe('Thìn');
    expect(chart.palaces[chart.thanPalaceIndex].branch).toBe('Dần');
    expect(chart.palaces[chart.menhPalaceIndex].name).toBe('Mệnh');
    expect(chart.palaces[chart.thanPalaceIndex].name).toBe('Phu Thê');
    expect(chart.cuc).toMatchObject({ name: 'Kim Tứ Cục', number: 4 });
    const annual2026 = calculateAnnualLimitState(chart, 2026, 9);
    expect(annual2026.lunarAge).toBe(27);
    expect(annual2026.tieuHan).toMatchObject({ branchIndex: 0, palaceName: 'Tài Bạch' });
    expect(annual2026.monthlyLimits.map(({ month, branchIndex, palaceName }) => [month, branchIndex, palaceName])).toEqual([
      [1, 10, 'Thiên Di'], [2, 11, 'Tật Ách'], [3, 0, 'Tài Bạch'], [4, 1, 'Tử Tức'],
      [5, 2, 'Phu Thê'], [6, 3, 'Huynh Đệ'], [7, 4, 'Mệnh'], [8, 5, 'Phụ Mẫu'],
      [9, 6, 'Phúc Đức'], [10, 7, 'Điền Trạch'], [11, 8, 'Quan Lộc'], [12, 9, 'Nô Bộc'],
    ]);
    const annual2027 = calculateAnnualLimitState(chart, 2027, 9);
    expect(annual2027.lunarAge).toBe(28);
    expect(annual2027.tieuHan).toMatchObject({ branchIndex: 1, palaceName: 'Tử Tức' });
    expect(annual2027.monthlyLimits.map(({ month, branchIndex, palaceName }) => [month, branchIndex, palaceName])).toEqual([
      [1, 11, 'Tật Ách'], [2, 0, 'Tài Bạch'], [3, 1, 'Tử Tức'], [4, 2, 'Phu Thê'],
      [5, 3, 'Huynh Đệ'], [6, 4, 'Mệnh'], [7, 5, 'Phụ Mẫu'], [8, 6, 'Phúc Đức'],
      [9, 7, 'Điền Trạch'], [10, 8, 'Quan Lộc'], [11, 9, 'Nô Bộc'], [12, 10, 'Thiên Di'],
    ]);
    expect(calculateTieuHanBranchIndex('Thìn', 2000, 2038, 'Nam')).toBe(0);
    expect(calculateTieuHanBranchIndex('Thìn', 2000, 2038, 'Nữ')).toBe(8);
    expect(new Set(annual2026.monthlyLimits.map(({ branchIndex }) => branchIndex)).size).toBe(12);
    const expectedPalaces: Record<string, string> = {
      Tý: 'Tài Bạch', Sửu: 'Tử Tức', Dần: 'Phu Thê', Mão: 'Huynh Đệ', Thìn: 'Mệnh', Tỵ: 'Phụ Mẫu',
      Ngọ: 'Phúc Đức', Mùi: 'Điền Trạch', Thân: 'Quan Lộc', Dậu: 'Nô Bộc', Tuất: 'Thiên Di', Hợi: 'Tật Ách',
    };
    chart.palaces.forEach((palace) => expect(palace.name).toBe(expectedPalaces[palace.branch]));

    const expectedStars: Record<string, string> = {
      'Tử Vi': 'Thân', 'Thiên Cơ': 'Mùi', 'Thái Dương': 'Tỵ', 'Vũ Khúc': 'Thìn',
      'Thiên Đồng': 'Mão', 'Liêm Trinh': 'Tý', 'Thiên Phủ': 'Thân', 'Thái Âm': 'Dậu',
      'Tham Lang': 'Tuất', 'Cự Môn': 'Hợi', 'Thiên Tướng': 'Tý', 'Thiên Lương': 'Sửu',
      'Thất Sát': 'Dần', 'Phá Quân': 'Ngọ',
    };
    Object.entries(expectedStars).forEach(([star, branch]) => {
      expect(chart.palaces.find((palace) => palace.majorStars.some((item) => item.name === star))?.branch).toBe(branch);
    });
    expect(chart.palaces.find((palace) => palace.branch === 'Mùi')?.majorStars.find((star) => star.name === 'Thiên Cơ')?.brightness).toBe('Vượng');
    expect(chart.palaces.flatMap((palace) => palace.majorStars)).toHaveLength(14);

    const minor = placeMinorStars('Canh', 'Thìn', 8, 'Tỵ');
    expect(minor).toMatchObject({ 'Văn Xương': 5, 'Văn Khúc': 9, 'Tả Phù': 11, 'Hữu Bật': 3, 'Địa Không': 6, 'Địa Kiếp': 4, 'Lộc Tồn': 8, 'Kình Dương': 9, 'Đà La': 7, 'Thiên Mã': 2, 'Đào Hoa': 9, 'Hoa Cái': 4 });
    expect(getTuanTrietBranches('Canh', 'Thìn')).toEqual({ tuan: [8, 9], triet: [6, 7] });
    expect(chart.palaces.filter((palace) => palace.tuan).map((palace) => palace.branch)).toEqual(['Thân', 'Dậu']);
    expect(chart.palaces.filter((palace) => palace.triet).map((palace) => palace.branch)).toEqual(['Ngọ', 'Mùi']);

    const birthHua = getBirthYearTransformations(chart, 'kham_thien');
    expect(TU_HOA_CARRIER_STARS).toHaveLength(18);
    expect(validateTransformationCarriers(chart)).toEqual([]);
    expect(chart.palaces.flatMap((palace) => [...palace.majorStars, ...palace.minorStars]).filter((star) => TU_HOA_CARRIER_STARS.includes(star.name as (typeof TU_HOA_CARRIER_STARS)[number]))).toHaveLength(18);
    expect(birthHua.map(({ type, star, palaceName }) => [type, star, palaceName])).toEqual([
      ['Lộc', 'Thái Dương', 'Phụ Mẫu'], ['Quyền', 'Vũ Khúc', 'Mệnh'],
      ['Khoa', 'Thái Âm', 'Nô Bộc'], ['Kỵ', 'Thiên Đồng', 'Huynh Đệ'],
    ]);
    const expectedAuxiliaryBirthHua = [
      { stem: 'Bính', type: 'Khoa', star: 'Văn Xương', palace: 'Phụ Mẫu' },
      { stem: 'Mậu', type: 'Khoa', star: 'Hữu Bật', palace: 'Huynh Đệ' },
      { stem: 'Kỷ', type: 'Kỵ', star: 'Văn Khúc', palace: 'Nô Bộc' },
      { stem: 'Tân', type: 'Khoa', star: 'Văn Khúc', palace: 'Nô Bộc' },
      { stem: 'Tân', type: 'Kỵ', star: 'Văn Xương', palace: 'Phụ Mẫu' },
      { stem: 'Nhâm', type: 'Khoa', star: 'Tả Phù', palace: 'Tật Ách' },
    ];
    expectedAuxiliaryBirthHua.forEach(({ stem, type, star, palace }) => {
      const chartWithYearStem = {
        ...chart,
        birthCanChi: { ...chart.birthCanChi, year: { ...chart.birthCanChi.year, stem: stem as typeof chart.birthCanChi.year.stem } },
      };
      expect(getBirthYearTransformations(chartWithYearStem, 'kham_thien')).toContainEqual(expect.objectContaining({ type, star, palaceName: palace }));
    });
    const flying = calculateAllFlyingTransformations(chart, 'kham_thien');
    expect(flying).toHaveLength(48);
    const expectedPalaceStems: Record<string, string> = {
      Mệnh: 'Canh', 'Phụ Mẫu': 'Tân', 'Phúc Đức': 'Nhâm', 'Điền Trạch': 'Quý',
      'Quan Lộc': 'Giáp', 'Nô Bộc': 'Ất', 'Thiên Di': 'Bính', 'Tật Ách': 'Đinh',
      'Tài Bạch': 'Mậu', 'Tử Tức': 'Kỷ', 'Phu Thê': 'Mậu', 'Huynh Đệ': 'Kỷ',
    };
    chart.palaces.forEach((palace) => expect(palace.stem).toBe(expectedPalaceStems[palace.name]));
    expect(new Set(flying.map((item) => item.id)).size).toBe(48);
    expect(flying.every((item) => item.layer === 'NATAL_PALACE' && item.profileId === 'KHAM_THIEN_V1')).toBe(true);
    const expectedTargets: Record<string, string[]> = {
      Mệnh: ['Phụ Mẫu', 'Mệnh', 'Nô Bộc', 'Huynh Đệ'],
      'Phụ Mẫu': ['Tật Ách', 'Phụ Mẫu', 'Nô Bộc', 'Phụ Mẫu'],
      'Phúc Đức': ['Tử Tức', 'Quan Lộc', 'Tật Ách', 'Mệnh'],
      'Điền Trạch': ['Phúc Đức', 'Tật Ách', 'Nô Bộc', 'Thiên Di'],
      'Quan Lộc': ['Tài Bạch', 'Phúc Đức', 'Mệnh', 'Phụ Mẫu'],
      'Nô Bộc': ['Điền Trạch', 'Tử Tức', 'Quan Lộc', 'Nô Bộc'],
      'Thiên Di': ['Huynh Đệ', 'Điền Trạch', 'Phụ Mẫu', 'Tài Bạch'],
      'Tật Ách': ['Nô Bộc', 'Huynh Đệ', 'Điền Trạch', 'Tật Ách'],
      'Tài Bạch': ['Thiên Di', 'Nô Bộc', 'Huynh Đệ', 'Điền Trạch'],
      'Tử Tức': ['Mệnh', 'Thiên Di', 'Tử Tức', 'Nô Bộc'],
      'Phu Thê': ['Thiên Di', 'Nô Bộc', 'Huynh Đệ', 'Điền Trạch'],
      'Huynh Đệ': ['Mệnh', 'Thiên Di', 'Tử Tức', 'Nô Bộc'],
    };
    const huaTypes = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'];
    chart.palaces.forEach((palace) => {
      huaTypes.forEach((type, index) => {
        expect(flying.find((item) => item.sourcePalaceName === palace.name && item.type === type)?.targetPalaceName).toBe(expectedTargets[palace.name][index]);
      });
    });
    expect(flying.find((item) => item.sourcePalaceName === 'Mệnh' && item.type === 'Quyền')).toMatchObject({ star: 'Vũ Khúc', mode: 'ly_tam' });
    expect(flying.find((item) => item.sourcePalaceName === 'Phụ Mẫu' && item.type === 'Quyền')).toMatchObject({ star: 'Thái Dương', mode: 'ly_tam' });
    expect(flying.find((item) => item.sourcePalaceName === 'Tật Ách' && item.type === 'Kỵ')).toMatchObject({ star: 'Cự Môn', mode: 'ly_tam' });
    expect(flying.find((item) => item.sourcePalaceName === 'Nô Bộc' && item.type === 'Kỵ')).toMatchObject({ star: 'Thái Âm', mode: 'ly_tam' });
    expect(flying.find((item) => item.sourcePalaceName === 'Tử Tức' && item.type === 'Khoa')).toMatchObject({ star: 'Thiên Lương', mode: 'ly_tam' });
    expect(flying.find((item) => item.sourcePalaceName === 'Phụ Mẫu' && item.type === 'Kỵ')).toMatchObject({ star: 'Văn Xương', direction: 'LY_TAM' });
    expect(flying.find((item) => item.sourcePalaceName === 'Phụ Mẫu' && item.type === 'Lộc')).toMatchObject({ star: 'Cự Môn', targetPalaceName: 'Tật Ách', mode: 'huong_tam' });
    expect(flying.find((item) => item.sourcePalaceName === 'Huynh Đệ' && item.type === 'Kỵ')).toMatchObject({ star: 'Văn Khúc', targetPalaceName: 'Nô Bộc', mode: 'huong_tam' });
    const noBocProfile = getPalaceTransformationProfile(chart, chart.palaces.find((palace) => palace.name === 'Nô Bộc')!.index);
    expect(noBocProfile.self).toMatchObject([expect.objectContaining({ type: 'Kỵ', star: 'Thái Âm', direction: 'LY_TAM' })]);
    expect(noBocProfile.incoming).toContainEqual(expect.objectContaining({ type: 'Kỵ', star: 'Văn Khúc', sourcePalaceName: 'Huynh Đệ', direction: 'HUONG_TAM' }));
    const renderPalace = (palaceName: string, school: 'kham_thien' | 'nam_phai' = 'kham_thien') => {
      const palace = chart.palaces.find((item) => item.name === palaceName)!;
      return renderToStaticMarkup(React.createElement(PalaceCell, {
        palace,
        isFocused: false,
        isPhiSelected: false,
        onSelect: () => undefined,
        showAnnual: false,
        gridRow: 1,
        gridColumn: 1,
        theme: 'paper',
        annualLimitAge: 27,
        annualLimitYear: chart.forecastYear,
        isSelectedLunarMonth: false,
        birthYearTransformations: birthHua.filter((item) => item.palaceIndex === palace.index),
        palaceAgeMapping: null,
        school,
      }));
    };
    const parentMarkup = renderPalace('Phụ Mẫu');
    expect(parentMarkup).toContain('Văn Xương');
    expect(parentMarkup).toContain('Thái Dương');
    expect(renderPalace('Nô Bộc')).toContain('Thái Âm');
    expect(renderPalace('Tật Ách')).toContain('Cự Môn');
    expect(renderPalace('Mệnh')).toContain('Vũ Khúc');
    expect(renderPalace('Tử Tức')).toContain('Thiên Lương');
    expect(renderPalace('Tật Ách')).toContain('Tả Phù');
    expect(renderPalace('Huynh Đệ')).toContain('Hữu Bật');
    expect(renderPalace('Nô Bộc')).toContain('Văn Khúc');
    expect(KHAM_THIEN_VISIBLE_STARS).toHaveLength(18);
    const allKhamThienCells = chart.palaces.map((palace) => renderPalace(palace.name)).join('');
    expect(allKhamThienCells).toContain('Văn Xương');
    expect(allKhamThienCells).toContain('Văn Khúc');
    expect(allKhamThienCells).toContain('Tả Phù');
    expect(allKhamThienCells).toContain('Hữu Bật');
    chart.palaces.forEach((palace) => {
      const displayed = getDisplayedPalaceStars(palace, 'kham_thien');
      ['Văn Xương', 'Văn Khúc', 'Tả Phù', 'Hữu Bật'].forEach((starName) => {
        if (palace.minorStars.some((star) => star.name === starName)) {
          expect(displayed.majorStars.filter((star) => star.name === starName)).toHaveLength(1);
          expect(displayed.minorStars.some((star) => star.name === starName)).toBe(false);
        }
      });
    });
    ['Thiếu Dương', 'Địa Không', 'Tang Môn', 'Linh Tinh', 'Kình Dương', 'Thiên Khôi'].forEach((starName) => {
      expect(allKhamThienCells).not.toContain(starName);
    });
    expect(chart.palaces.every((palace) => getDisplayedPalaceStars(palace, 'nam_phai').minorStars.length === palace.minorStars.filter((star) => !['Văn Xương', 'Văn Khúc'].includes(star.name)).length)).toBe(true);
    expect(chart.palaces.filter((palace) => palace.isAnnualLimit)).toHaveLength(1);
    expect(chart.palaces.find((palace) => palace.isAnnualLimit)?.name).toBe('Tài Bạch');
    const namPhaiBirthHua = getBirthYearTransformations(chart, 'nam_phai');
    expect(namPhaiBirthHua.map(({ type, star, palaceName }) => [type, star, palaceName])).toEqual([
      ['Lộc', 'Thái Dương', 'Phụ Mẫu'], ['Quyền', 'Vũ Khúc', 'Mệnh'],
      ['Khoa', 'Thiên Đồng', 'Huynh Đệ'], ['Kỵ', 'Thái Âm', 'Nô Bộc'],
    ]);
    expect(calculateAllFlyingTransformations(chart, 'nam_phai')).toHaveLength(48);
  });

  it('calculates Khâm Thiên Tứ Hóa and self-transformations', () => {
    const chart = generateNatalChart({
      name: 'Nguyễn Minh An',
      date: '1992-08-18',
      time: '09:30',
      gender: 'Nam',
      calendar: 'solar',
      forecastYear: 2026,
    });

    const birthTransformations = getBirthYearTransformations(chart, 'kham_thien');
    expect(birthTransformations.length).toBeGreaterThan(0);

    const flying = calculateAllFlyingTransformations(chart, 'kham_thien');
    expect(flying.length).toBeGreaterThan(0);
    expect(flying.some((f) => f.type === 'Lộc' || f.type === 'Kỵ')).toBe(true);
  });

  it('keeps Ly Tam and Huong Tam arrows visible with no selected palace and all phi filters off', () => {
    const chart = generateNatalChart({ name: 'Arrow check', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const transformations = calculateAllFlyingTransformations(chart).filter((flow) => flow.mode !== 'flying');
    const markup = renderToStaticMarkup(React.createElement(NatalChart12, {
      chart,
      focusedPalaceIndex: null,
      selectedPhiPalaceIndices: [],
      onSelectPalace: () => undefined,
      layers: { showBirthYear: true, showAnnual: true },
      theme: 'paper',
      school: 'kham_thien',
      palaceAgeOptions: { enabled: false, mode: 'FULL_CAN_CHI', startYear: 1920, endYear: 2030, nearestToBirthYearOnly: false },
      selectedLunarMonth: 1,
      phiHoaVisibility: { Lộc: false, Quyền: false, Khoa: false, Kỵ: false },
    }));
    expect((markup.match(/aria-hidden="false"/g) ?? [])).toHaveLength(transformations.length);
  });

  it('identifies the chart screenshot Quan Loc self-hua from its actual stem and carrier star', () => {
    const chart = generateNatalChart({ name: 'Mai Thi Huong Giang', date: '1999-04-21', time: '10:20', gender: 'Nữ', calendar: 'solar', forecastYear: 2026 });
    const quanLoc = chart.palaces.find((palace) => palace.name === 'Quan Lộc')!;
    const selfFlows = calculateAllFlyingTransformations(chart).filter((flow) => flow.sourcePalaceIndex === quanLoc.index && flow.mode === 'ly_tam');
    expect(quanLoc).toMatchObject({ stem: 'Đinh', branch: 'Mão' });
    expect(quanLoc.majorStars.map(({ name }) => name)).toContain('Thái Âm');
    expect(selfFlows).toContainEqual(expect.objectContaining({ type: 'Lộc', star: 'Thái Âm', direction: 'LY_TAM' }));
  });

  it('generates I Ching hexagram and moving lines correctly', () => {
    const hexagram = generateHexagramFromTosses([7, 7, 7, 7, 7, 7], 'Giáp');
    expect(hexagram.name).toBe('Thuần Càn');
    expect(hexagram.lines).toHaveLength(6);
    expect(hexagram.lines.every((l) => l.yinYang === 'yang')).toBe(true);

    const hexWithMove = generateHexagramFromTosses([9, 7, 7, 7, 7, 7], 'Giáp');
    expect(hexWithMove.transformedHexagram).toBeDefined();
    expect(hexWithMove.transformedHexagram?.lines[0].yinYang).toBe('yin');
  });

  it('executes deterministic tool calls through executor', () => {
    const chart = generateNatalChart({
      name: 'Lê Văn Khang',
      date: '1995-10-12',
      time: '14:20',
      gender: 'Nam',
      calendar: 'solar',
      forecastYear: 2026,
    });

    const executor = new DeterministicToolExecutor(chart);
    const { result, trace } = executor.execute('get_palace_details', { palaceName: 'Tài Bạch' });
    expect(result.palace.name).toBe('Tài Bạch');
    expect(trace.toolName).toBe('get_palace_details');
    expect(trace.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
