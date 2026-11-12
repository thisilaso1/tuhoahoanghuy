import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PalaceCell } from '../components/chart/PalaceCell';
import { NatalChart12 } from '../components/chart/NatalChart12';
import { getYearCanChi, getHourBranch, NAP_AM_TABLE, solarToLunar, lunarToSolar, getDayCanChi } from './lunarCalendar';
import { calculateCuc, calculateThaiTueCycle, findMenhAndThan, generateNatalChart, getTuanTrietBranches, placeMajorStars, placeMinorStars, placeTuVi } from './tuViEngine';
import { calculateAllFlyingTransformations, getAnnualTransformations, getBirthYearTransformations, getPalaceTransformationProfile, TU_HOA_CARRIER_STARS, TU_HOA_KHAM_THIEN, validateTransformationCarriers } from './tuHoaEngine';
import { findHexagramByBinary, generateHexagramFromTosses } from './kinhDichEngine';
import { DeterministicToolExecutor } from '../ai/tools';
import { getPalaceAgeMappings, getSexagenaryYear } from './palaceAge';
import { getDisplayedPalaceStars, KHAM_THIEN_VISIBLE_STARS } from './starVisibility';
import { calculateAnnualLimitState, calculateTieuHanBranchIndex } from './annualLimits';
import { calculateAnnualStars } from './annualStars';
import { buildNamPhaiBrightnessAudit, getNamPhaiMinorStarBrightness, getStarBrightness, NAM_PHAI_BRIGHTNESS_DEFINITIONS, NAM_PHAI_FULL_PROFILE_ID, NAM_PHAI_MINOR_BRIGHTNESS_DEFINITIONS } from './starBrightness';
import { STAR_ID_BY_NAME } from './starElements';
import { BRANCHES } from './types';
import { buildNamPhaiStarAuditReport, buildNamPhaiStarCoverageReport, getNamPhaiStarIdForName, NAM_PHAI_STAR_REGISTRY } from './namPhaiStarRegistry';
import { groupStarsForNamPhai } from './namPhaiStarDisplay';
import { findNamPhaiLaiNhanPalace, getNamPhaiPalaceRelations } from './namPhaiPalaceRelationEngine';
import { calculateNamPhaiRelationGeometry, type ChartRect, type EdgeSide } from './namPhaiEdgeAnchorEngine';

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

  it('builds the full verified 168-cell Nam Phai main-star brightness table', () => {
    expect(NAM_PHAI_BRIGHTNESS_DEFINITIONS).toHaveLength(168);
    expect(new Set(NAM_PHAI_BRIGHTNESS_DEFINITIONS.map(({ starId, branch }) => `${starId}:${branch}`)).size).toBe(168);
    expect(NAM_PHAI_BRIGHTNESS_DEFINITIONS.every(({ verified, sourceReference }) => verified && sourceReference.includes('somenh.vn'))).toBe(true);
    expect(getStarBrightness('TU_VI', 'Tý', NAM_PHAI_FULL_PROFILE_ID)).toBe('Đắc');
    expect(getStarBrightness('THIEN_CO', 'Dần', NAM_PHAI_FULL_PROFILE_ID)).toBe('Hãm');
    expect(getStarBrightness('VU_KHUC', 'Thìn', NAM_PHAI_FULL_PROFILE_ID)).toBe('Miếu');
    expect(getStarBrightness('THAI_DUONG', 'Tỵ', NAM_PHAI_FULL_PROFILE_ID)).toBe('Miếu');
    expect(getStarBrightness('VU_KHUC', 'Thìn', 'KHAM_THIEN_V1')).toBe('UNSPECIFIED');
  });

  it('audits all six source-backed Nam Phái malefics without inferring brightness for other stars', () => {
    expect(NAM_PHAI_MINOR_BRIGHTNESS_DEFINITIONS).toHaveLength(84); // six malefics + Thiên Khốc, 12 branches each
    expect(NAM_PHAI_MINOR_BRIGHTNESS_DEFINITIONS.every(({ verified, sourceReference }) => verified && sourceReference.startsWith('https://hocvienlyso.org/'))).toBe(true);
    expect(getNamPhaiMinorStarBrightness('Đà La', 'Dần')).toBe('Đắc');
    expect(getNamPhaiMinorStarBrightness('Hỏa Tinh', 'Ngọ')).toBe('Đắc');
    expect(getNamPhaiMinorStarBrightness('Linh Tinh', 'Sửu')).toBe('Hãm');
    expect(getNamPhaiMinorStarBrightness('Địa Không', 'Thân')).toBe('Đắc');
    expect(getNamPhaiMinorStarBrightness('Địa Kiếp', 'Mão')).toBe('Hãm');
    expect(getNamPhaiMinorStarBrightness('Bạch Hổ', 'Tý')).toBe('UNSPECIFIED');
    expect(getNamPhaiMinorStarBrightness('Đại Hao', 'Dần')).toBe('UNSPECIFIED');
    const audit = buildNamPhaiBrightnessAudit();
    expect(audit.mainStars).toMatchObject({ expected: 168, verified: 168, status: 'COMPLETE' });
    expect(audit.sixMalefics).toMatchObject({ expected: 72, verified: 72, status: 'COMPLETE' });
    expect(audit.verifiedAuxiliaryStars).toContain('Thiên Khốc');
    expect(audit.notApplicable).toContain('Bạch Hổ');
    expect(audit.unverifiedRules).toEqual([]);
  });

  it('places all twelve natal Thai Tue stars from birth-year branch with distinct Quan Phu identities', () => {
    const canhThin = calculateThaiTueCycle(BRANCHES.indexOf('Thìn'));
    expect(canhThin).toHaveLength(12);
    expect(new Set(canhThin.map(({ branchIndex }) => branchIndex)).size).toBe(12);
    expect(canhThin[0]).toMatchObject({ starName: 'Thái Tuế', branchIndex: 4, starId: 'NATAL:THAI_TUE', layer: 'NATAL', cycleId: 'THAI_TUE' });
    expect(canhThin.find(({ starName }) => starName === 'Quan Phù')).toMatchObject({ branchIndex: 8, starId: 'NATAL:QUAN_PHU_THAI_TUE' });
    expect(canhThin.find(({ starName }) => starName === 'Bạch Hổ')).toMatchObject({ branchIndex: 0, starId: 'NATAL:BACH_HO' });
    const kyMao = calculateThaiTueCycle(BRANCHES.indexOf('Mão'));
    expect(kyMao.find(({ starName }) => starName === 'Thái Tuế')?.branchIndex).toBe(3);
    expect(kyMao.find(({ starName }) => starName === 'Quan Phù')?.branchIndex).toBe(7);
    expect(kyMao.find(({ starName }) => starName === 'Bạch Hổ')?.branchIndex).toBe(11);
    expect(getNamPhaiStarIdForName('Quan Phù')).toBe('NATAL:QUAN_PHU_THAI_TUE');
    expect(getNamPhaiStarIdForName('Quan Phủ')).toBe('NATAL:QUAN_PHU_BAC_SI');
    for (const gender of ['Nam', 'Nữ'] as const) {
      const minor = placeMinorStars('Canh', 'Thìn', 8, 'Tỵ', gender);
      expect(minor['Thái Tuế']).toBe(4);
      expect(minor['Quan Phù']).toBe(8);
      expect(minor['Bạch Hổ']).toBe(0);
    }
  });

  it('applies the Nam Phai brightness profile without changing Khâm Thiên star brightness', () => {
    const chart = generateNatalChart({ name: 'Brightness profile', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const palace = chart.palaces.find((item) => item.majorStars.length > 0)!;
    const original = palace.majorStars[0];
    const khamThienStar = getDisplayedPalaceStars(palace, 'kham_thien').majorStars.find((star) => star.name === original.name)!;
    const namPhaiStar = getDisplayedPalaceStars(palace, 'nam_phai').majorStars.find((star) => star.name === original.name)!;
    expect(khamThienStar.brightness).toBe(original.brightness);
    expect(namPhaiStar.brightness).toBe(getStarBrightness(STAR_ID_BY_NAME[original.name], palace.branch, NAM_PHAI_FULL_PROFILE_ID));
  });

  it('places both configured Nam Phai twelve-star cycles using Cục and polarity direction', () => {
    const forward = placeMinorStars('Canh', 'Thìn', 8, 'Tỵ', 'Nam', 4);
    const reverse = placeMinorStars('Canh', 'Thìn', 8, 'Tỵ', 'Nữ', 4);
    const bacSiRing = ['Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao', 'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần', 'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'];
    const trangSinhRing = ['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
    expect(bacSiRing.map((star) => forward[star])).toEqual(Array.from({ length: 12 }, (_, index) => (8 + index) % 12));
    expect(bacSiRing.map((star) => reverse[star])).toEqual(Array.from({ length: 12 }, (_, index) => (8 - index + 12) % 12));
    expect(trangSinhRing.map((star) => forward[star])).toEqual(Array.from({ length: 12 }, (_, index) => (5 + index) % 12));
    expect(trangSinhRing.map((star) => reverse[star])).toEqual(Array.from({ length: 12 }, (_, index) => (5 - index + 12) % 12));
  });

  it('places Thiên Khôi at Ngọ and Thiên Việt at Dần for Canh and Tân years (Canh Tân phùng Mã Hổ)', () => {
    for (const stem of ['Canh', 'Tân'] as const) {
      expect(placeMinorStars(stem, 'Thìn', 8, 'Tỵ')).toMatchObject({ 'Thiên Khôi': 6, 'Thiên Việt': 2 });
    }
    expect(placeMinorStars('Giáp', 'Tý', 8, 'Tỵ')).toMatchObject({ 'Thiên Khôi': 1, 'Thiên Việt': 7 });
    // Lưu Hà (Nam Phái Việt): Canh at Thìn, Tân at Mão.
    expect(placeMinorStars('Canh', 'Thìn', 8, 'Tỵ')['Lưu Hà']).toBe(4);
    expect(placeMinorStars('Tân', 'Tỵ', 8, 'Tỵ')['Lưu Hà']).toBe(3);
    expect(placeMinorStars('Giáp', 'Tý', 8, 'Tỵ')['Lưu Hà']).toBe(9);
    const chart = generateNatalChart({ name: 'Khôi Việt', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2030 });
    for (const year of [2030, 2031]) {
      const annual = calculateAnnualStars(chart, year).map(({ name, branch }) => [name, branch]);
      expect(annual).toEqual(expect.arrayContaining([['Lưu Thiên Khôi', 'Ngọ'], ['Lưu Thiên Việt', 'Dần']]));
    }
  });

  it('places the verified annual star set and re-keys the data when the forecast year changes', () => {
    const chart = generateNatalChart({ name: 'Annual test', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const annual2026 = calculateAnnualStars(chart, 2026);
    expect(annual2026).toHaveLength(17);
    expect(annual2026.map(({ name, branch }) => [name, branch])).toEqual(expect.arrayContaining([
      ['Lưu Thái Tuế', 'Ngọ'], ['Lưu Tang Môn', 'Thân'], ['Lưu Bạch Hổ', 'Dần'],
      ['Lưu Thiên Khốc', 'Tý'], ['Lưu Thiên Hư', 'Tý'], ['Lưu Lộc Tồn', 'Tỵ'],
      ['Lưu Kình Dương', 'Ngọ'], ['Lưu Đà La', 'Thìn'], ['Lưu Thiên Mã', 'Thân'],
      ['Lưu Thiên Khôi', 'Hợi'], ['Lưu Thiên Việt', 'Dậu'], ['Lưu Văn Xương', 'Thân'],
      ['Lưu Văn Khúc', 'Ngọ'], ['Lưu Đào Hoa', 'Mão'], ['Lưu Hồng Loan', 'Dậu'], ['Lưu Thiên Hỷ', 'Mão'],
      ['Lưu Kiếp Sát', 'Hợi'],
    ]));
    expect(annual2026.every(({ brightness, annualYear, id }) => brightness === 'UNSPECIFIED' && annualYear === 2026 && id.startsWith('ANNUAL:2026:'))).toBe(true);
    expect(getAnnualTransformations(chart, 2026, 'nam_phai').map(({ type, star }) => [type, star])).toEqual([
      ['Lộc', 'Thiên Đồng'], ['Quyền', 'Thiên Cơ'], ['Khoa', 'Văn Xương'], ['Kỵ', 'Liêm Trinh'],
    ]);
    const annual2027 = calculateAnnualStars(chart, 2027);
    expect(annual2027).toHaveLength(17);
    expect(annual2027.map(({ name, branch }) => [name, branch])).toEqual(expect.arrayContaining([
      ['Lưu Thái Tuế', 'Mùi'], ['Lưu Tang Môn', 'Dậu'], ['Lưu Bạch Hổ', 'Mão'],
      ['Lưu Thiên Khốc', 'Hợi'], ['Lưu Thiên Hư', 'Sửu'], ['Lưu Lộc Tồn', 'Ngọ'],
      ['Lưu Kình Dương', 'Mùi'], ['Lưu Đà La', 'Tỵ'], ['Lưu Thiên Mã', 'Tỵ'],
    ]));
    expect(annual2027.every(({ annualYear, id }) => annualYear === 2027 && id.startsWith('ANNUAL:2027:'))).toBe(true);
    expect(annual2027.map(({ branch }) => branch)).not.toEqual(annual2026.map(({ branch }) => branch));
  });

  it('groups annual stars at the end of their configured natal columns without mutating the source list', () => {
    const fixture = [
      ...Array.from({ length: 10 }, (_, index) => ({ id: `natal-left-${index}`, name: `N${index}`, layer: 'NATAL' as const, displayColumn: 'LEFT_CATS' as const, displayOrder: 9 - index, data: null })),
      ...Array.from({ length: 8 }, (_, index) => ({ id: `natal-right-${index}`, name: `H${index}`, layer: 'NATAL' as const, displayColumn: 'RIGHT_HUNG' as const, displayOrder: 7 - index, data: null })),
      ...Array.from({ length: 5 }, (_, index) => ({ id: `annual-left-${index}`, name: `LN${index}`, layer: 'ANNUAL' as const, displayColumn: 'LEFT_CATS' as const, displayOrder: 4 - index, data: null })),
      ...Array.from({ length: 7 }, (_, index) => ({ id: `annual-right-${index}`, name: `LH${index}`, layer: 'ANNUAL' as const, displayColumn: 'RIGHT_HUNG' as const, displayOrder: 6 - index, data: null })),
    ];
    const originalIds = fixture.map(({ id }) => id);
    const grouped = groupStarsForNamPhai(fixture);
    expect(grouped.leftNatal).toHaveLength(10);
    expect(grouped.rightNatal).toHaveLength(8);
    expect(grouped.leftAnnual).toHaveLength(5);
    expect(grouped.rightAnnual).toHaveLength(7);
    expect(grouped.leftNatal.map(({ name }) => name)).toEqual(['N9','N8','N7','N6','N5','N4','N3','N2','N1','N0']);
    expect(grouped.rightNatal.map(({ name }) => name)).toEqual(['H7','H6','H5','H4','H3','H2','H1','H0']);
    expect(grouped.leftAnnual.map(({ name }) => name)).toEqual(['LN4','LN3','LN2','LN1','LN0']);
    expect(grouped.rightAnnual.map(({ name }) => name)).toEqual(['LH6','LH5','LH4','LH3','LH2','LH1','LH0']);
    expect(fixture.map(({ id }) => id)).toEqual(originalIds);
  });

  it('audits Nam Phái full coverage and separates required rules from optional school variants', () => {
    expect(new Set(NAM_PHAI_STAR_REGISTRY.map(({ id }) => id)).size).toBe(NAM_PHAI_STAR_REGISTRY.length);
    expect(NAM_PHAI_BRIGHTNESS_DEFINITIONS).toHaveLength(168);
    const chart = generateNatalChart({ name: 'Audit', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const rendered = chart.palaces.flatMap((palace) => {
      const display = getDisplayedPalaceStars(palace, 'nam_phai');
      return [...display.majorStars, ...display.minorStars].map(({ id }) => id!).concat(
        calculateAnnualStars(chart, 2026).filter(({ branchIndex }) => branchIndex === palace.index).map(({ baseStarId }) => `ANNUAL:${baseStarId}`),
      );
    });
    const coverage = buildNamPhaiStarCoverageReport({
      natalStars: chart.palaces.flatMap((palace) => [...palace.majorStars, ...palace.minorStars].map(({ id, name }) => ({ id, name, branchIndex: palace.index }))),
      annualStars: calculateAnnualStars(chart, 2026).map(({ id, name, branchIndex }) => ({ id, name, branchIndex })),
      renderedStarIds: rendered,
    });
    const report = buildNamPhaiStarAuditReport(
      chart.palaces.flatMap((palace) => [...palace.majorStars, ...palace.minorStars].map(({ name }) => name)),
      calculateAnnualStars(chart, 2026).map(({ name }) => name),
    );
    expect(coverage.passed).toBe(true);
    expect(coverage.missingDefinitions).toEqual([]);
    expect(coverage.missingPlacementRules).toEqual([]);
    expect(coverage.unverifiedRequiredRules).toEqual([]);
    expect(coverage.missingNatalPlacements).toEqual([]);
    expect(coverage.missingAnnualPlacements).toEqual([]);
    expect(coverage.missingRenderedStars).toEqual([]);
    expect(coverage.duplicatedPlacements).toEqual([]);
    expect(coverage.invalidBranchPlacements).toEqual([]);
    expect(report.missingBrightnessIds).toEqual([]);
    expect(report.missingAnnualStarIds).toEqual([]);
    expect(report.unverifiedRuleIds).toEqual([]);
    expect(report.missingStarIds).toEqual([]);
    expect(findNamPhaiLaiNhanPalace(chart)).toMatchObject({ status: 'FOUND', branch: 'Thìn', palace: { name: 'Mệnh' } });
  });

  it('calculates Tam Phương Tứ Chính and Giáp from the twelve branch indices', () => {
    expect(getNamPhaiPalaceRelations(4)).toEqual({ self: 4, tamHop: [8, 0], xungChieu: 10, giapCung: [3, 5] });
  });

  it('anchors all five Nam Phái relations on distributed palace edges for all twelve palaces', () => {
    const grid: Record<number, [number, number]> = {
      5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4], 4: [2, 1], 9: [2, 4],
      3: [3, 1], 10: [3, 4], 2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
    };
    const width = 120;
    const height = 90;
    const gap = 4;
    const rects = new Map<number, ChartRect>(Object.entries(grid).map(([index, [row, column]]) => [Number(index), {
      left: (column - 1) * (width + gap), top: (row - 1) * (height + gap), width, height,
    }]));
    const sideIsCorrect = (point: { x: number; y: number; side: EdgeSide }, rect: ChartRect) => {
      const epsilon = 0.001;
      const pad = Math.min(18, (point.side === 'TOP' || point.side === 'BOTTOM' ? rect.width : rect.height) * 0.25);
      if (point.side === 'TOP') return Math.abs(point.y - rect.top) < epsilon && point.x >= rect.left - epsilon && point.x <= rect.left + rect.width + epsilon && (point.x === rect.left || point.x === rect.left + rect.width || (point.x > rect.left + pad && point.x < rect.left + rect.width - pad));
      if (point.side === 'BOTTOM') return Math.abs(point.y - (rect.top + rect.height)) < epsilon && point.x >= rect.left - epsilon && point.x <= rect.left + rect.width + epsilon && (point.x === rect.left || point.x === rect.left + rect.width || (point.x > rect.left + pad && point.x < rect.left + rect.width - pad));
      if (point.side === 'LEFT') return Math.abs(point.x - rect.left) < epsilon && point.y >= rect.top - epsilon && point.y <= rect.top + rect.height + epsilon && (point.y === rect.top || point.y === rect.top + rect.height || (point.y > rect.top + pad && point.y < rect.top + rect.height - pad));
      return Math.abs(point.x - (rect.left + rect.width)) < epsilon && point.y >= rect.top - epsilon && point.y <= rect.top + rect.height + epsilon && (point.y === rect.top || point.y === rect.top + rect.height || (point.y > rect.top + pad && point.y < rect.top + rect.height - pad));
    };
    for (let selected = 0; selected < 12; selected += 1) {
      const geometry = calculateNamPhaiRelationGeometry(rects, selected, { tamHop: true, xungChieu: true, giapCung: true });
      expect(geometry).toHaveLength(6);
      const directRelations = geometry.filter(({ relationType }) => relationType !== 'tam-hop-bridge');
      const sourceAnchors = directRelations.map(({ source }) => `${source.side}:${source.x.toFixed(3)}:${source.y.toFixed(3)}`);
      expect(new Set(sourceAnchors).size, `selected palace ${selected}: ${sourceAnchors.join(' | ')}`).toBe(1);
      directRelations.forEach(({ source, target }) => {
        expect([source.x, source.y, target.x, target.y].every(Number.isFinite)).toBe(true);
        expect(sideIsCorrect(source, rects.get(source.palaceId)!)).toBe(true);
        expect(sideIsCorrect(target, rects.get(target.palaceId)!)).toBe(true);
        expect(source.palaceId).toBe(selected);
        expect(target.palaceId).not.toBe(selected);
      });
      const bridge = geometry.find(({ relationType }) => relationType === 'tam-hop-bridge')!;
      const tamHopTargets = directRelations.filter(({ relationType }) => relationType === 'tam-hop').map(({ target }) => target);
      expect(bridge.source).toEqual(tamHopTargets[0]);
      expect(bridge.target).toEqual(tamHopTargets[1]);
      expect(sideIsCorrect(bridge.source, rects.get(bridge.source.palaceId)!)).toBe(true);
      expect(sideIsCorrect(bridge.target, rects.get(bridge.target.palaceId)!)).toBe(true);
    }
    // A mid-left palace always launches from its inner right edge, regardless
    // of the target; a corner palace launches from one consistent inner-corner
    // edge rather than fanning out from several different places.
    const leftMid = calculateNamPhaiRelationGeometry(rects, 4, { tamHop: true, xungChieu: true, giapCung: true });
    expect(leftMid.filter(({ relationType }) => relationType !== 'tam-hop-bridge').every(({ source }) => source.side === 'RIGHT')).toBe(true);
    const topLeft = calculateNamPhaiRelationGeometry(rects, 5, { tamHop: true, xungChieu: true, giapCung: true });
    expect(new Set(topLeft.filter(({ relationType }) => relationType !== 'tam-hop-bridge').map(({ source }) => source.side))).toEqual(new Set(['RIGHT']));
    for (const cornerIndex of [2, 5, 8, 11]) {
      expect(calculateNamPhaiRelationGeometry(rects, cornerIndex, { tamHop: true, xungChieu: true, giapCung: true })).toHaveLength(6);
    }
  });

  it('covers Hỏa/Linh positions for all 12 year branches and 12 birth hours', () => {
    const expectedStarts: Record<string, [number, number]> = {
      Tý: [2, 10], Sửu: [3, 10], Dần: [1, 3], Mão: [9, 10], Thìn: [2, 10], Tỵ: [3, 10],
      Ngọ: [1, 3], Mùi: [9, 10], Thân: [2, 10], Dậu: [3, 10], Tuất: [1, 3], Hợi: [9, 10],
    };
    const validYears = Array.from({ length: 60 }, (_, offset) => getYearCanChi(1984 + offset));
    for (const yearBranch of BRANCHES) {
      const year = validYears.find((item) => item.branch === yearBranch)!;
      const [fireStart, bellStart] = expectedStarts[yearBranch];
      BRANCHES.forEach((hourBranch, hourIndex) => {
        const positions = placeMinorStars(year.stem, yearBranch, 8, hourBranch, 'Nam', undefined, 28);
        expect(positions['Hỏa Tinh']).toBe((fireStart + hourIndex) % 12);
        expect(positions['Linh Tinh']).toBe((bellStart + hourIndex) % 12);
      });
    }
  });

  it('uses a distinct stem table for Nam Phái quý tinh and Lưu Hà', () => {
    const golden: Record<string, { quan: number; phuc: number; tru: number; luuHa: number }> = {
      Giáp: { quan: 7, phuc: 9, tru: 5, luuHa: 9 }, Ất: { quan: 4, phuc: 8, tru: 6, luuHa: 10 },
      Bính: { quan: 5, phuc: 0, tru: 0, luuHa: 7 }, Đinh: { quan: 2, phuc: 11, tru: 5, luuHa: 8 },
      Mậu: { quan: 3, phuc: 3, tru: 6, luuHa: 5 }, Kỷ: { quan: 9, phuc: 2, tru: 8, luuHa: 6 },
      Canh: { quan: 11, phuc: 6, tru: 2, luuHa: 4 }, Tân: { quan: 9, phuc: 5, tru: 6, luuHa: 3 },
      Nhâm: { quan: 10, phuc: 6, tru: 9, luuHa: 11 }, Quý: { quan: 6, phuc: 5, tru: 11, luuHa: 2 },
    };
    const validYears = Array.from({ length: 60 }, (_, offset) => getYearCanChi(1984 + offset));
    Object.entries(golden).forEach(([stem, expected]) => {
      const year = validYears.find((item) => item.stem === stem)!;
      const positions = placeMinorStars(year.stem, year.branch, 8, 'Tỵ', 'Nam', undefined, 28);
      expect(positions['Thiên Quan']).toBe(expected.quan);
      expect(positions['Thiên Phúc']).toBe(expected.phuc);
      expect(positions['Thiên Trù']).toBe(expected.tru);
      expect(positions['Lưu Hà']).toBe(expected.luuHa);
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
        annualStars: [],
        annualHuas: [],
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
    const thaiTuePalace = chart.palaces.find((palace) => palace.minorStars.some((star) => star.name === 'Thái Tuế'))!;
    const thaiTueMarkup = renderPalace(thaiTuePalace.name, 'nam_phai');
    expect(thaiTueMarkup).toContain('palace-auxiliary-grid');
    expect(thaiTueMarkup).toContain('Thái Tuế');
    expect(thaiTueMarkup).not.toContain('palace-cycle-footer');
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
    const render = (options: Partial<React.ComponentProps<typeof NatalChart12>> = {}) => renderToStaticMarkup(React.createElement(NatalChart12, {
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
      ...options,
    }));
    const countVisible = (markup: string) => (markup.match(/aria-hidden="false"/g) ?? []).length;
    expect(countVisible(render())).toBe(transformations.length);
    expect(countVisible(render({ showDefaultPhiHoa: false }))).toBe(0);

    const { sourcePalaceIndex, type } = transformations[0];
    const selected = { showDefaultPhiHoa: false, selectedPhiPalaceIndices: [sourcePalaceIndex] };
    expect(countVisible(render(selected))).toBe(0);
    expect(countVisible(render({
      ...selected,
      phiHoaVisibility: { Lộc: false, Quyền: false, Khoa: false, Kỵ: false, [type]: true },
    }))).toBe(1);
    expect(countVisible(render({ showDefaultPhiHoa: true }))).toBe(transformations.length);
  });

  it('renders natal Kình Dương at Dậu as Hãm in Nam Phái', () => {
    const chart = generateNatalChart({ name: 'Canh Thìn', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2020 });
    const markup = renderToStaticMarkup(React.createElement(NatalChart12, {
      chart,
      focusedPalaceIndex: null,
      selectedPhiPalaceIndices: [],
      onSelectPalace: () => undefined,
      layers: { showBirthYear: true, showAnnual: true },
      theme: 'paper',
      school: 'nam_phai',
      palaceAgeOptions: { enabled: false, mode: 'FULL_CAN_CHI', startYear: 1920, endYear: 2030, nearestToBirthYearOnly: false },
      selectedLunarMonth: 1,
      phiHoaVisibility: { Lộc: true, Quyền: true, Khoa: true, Kỵ: true },
    }));
    const dau = chart.palaces.find(({ branch }) => branch === 'Dậu');
    expect(getStarBrightness('KINH_DUONG', 'Dậu')).toBe('Hãm');
    expect(dau?.minorStars.find(({ name }) => name === 'Kình Dương')?.brightnessByProfile)
      .toMatchObject({ [NAM_PHAI_FULL_PROFILE_ID]: 'Hãm' });
    expect(calculateAnnualStars(chart, 2020).find(({ name }) => name === 'Lưu Kình Dương'))
      .toMatchObject({ branch: 'Dậu', brightness: 'Hãm' });
    expect(markup).toContain('title="Kình Dương · Hãm tại Dậu">Kình Dương<strong class="palace-minor-brightness"> (H)</strong>');
  });

  it('isolates Nam Phái rendering from Khâm Thiên Phi Hóa and retains all twelve palaces', () => {
    const chart = generateNatalChart({ name: 'Canh Thìn', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const markup = renderToStaticMarkup(React.createElement(NatalChart12, {
      chart,
      focusedPalaceIndex: null,
      selectedPhiPalaceIndices: [],
      onSelectPalace: () => undefined,
      onClearPalaceSelection: () => undefined,
      namPhaiRelationOptions: { tamHop: true, xungChieu: true, giapCung: true, lines: true, highlight: true, laiNhan: true },
      namPhaiLayoutMode: 'auto',
      layers: { showBirthYear: true, showAnnual: true },
      theme: 'paper',
      school: 'nam_phai',
      palaceAgeOptions: { enabled: false, mode: 'FULL_CAN_CHI', startYear: 1920, endYear: 2030, nearestToBirthYearOnly: false },
      selectedLunarMonth: 1,
      phiHoaVisibility: { Lộc: true, Quyền: true, Khoa: true, Kỵ: true },
    }));
    expect((markup.match(/data-palace-index=/g) ?? [])).toHaveLength(12);
    expect(markup).toContain('LAI NHÂN');
    expect(markup).toContain('palace-auxiliary-grid');
    expect(markup).toContain('chart-export-frame');
    expect(markup).not.toContain('palace-annual-star-list');
    calculateAnnualStars(chart, chart.forecastYear).forEach((star) => expect(markup).toContain(star.name.replace(/^Lưu\s+/, 'L.')));
    [
      'L.Kiếp Sát','L.Thiên Khôi','L.Thiên Việt','L.Văn Xương','L.Văn Khúc','L.Đào Hoa','L.Hồng Loan','L.Thiên Hỷ',
    ].forEach((label) => expect(markup).toContain(label));
    [
      'L.Long Đức','L.Hoa Cái','L.Quốc Ấn','L.Thiếu Âm','L.Thiếu Dương','L.Long Trì','L.Đường Phù',
      'L.Quan Phù','L.Cô Thần','L.Thiên Quan','L.Trực Phù','L.Phá Toái','L.Quả Tú','L.Phượng Các',
      'L.Giải Thần','L.Điếu Khách','L.Phúc Đức','L.Thiên Đức','L.Tuế Phá','L.Thiên Phúc','L.Thiên Trù',
    ].forEach((label) => expect(markup).not.toContain(label));
    expect(markup).toContain('L.Hóa Lộc');
    expect(markup).not.toContain('L.Hóa Lộc → Thiên Đồng');
    expect(markup).not.toContain('Đường Tứ Hóa Khâm Thiên');
    expect(markup).not.toContain('phi-hoa-edge');
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
