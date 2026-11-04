import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StarName } from '../components/chart/StarName';
import { DARK_ELEMENT_COLORS, ELEMENT_IDS, STAR_ELEMENTS, STAR_ID_BY_NAME, ELEMENT_LABEL, LIGHT_ELEMENT_COLORS } from './starElements';
import { generateNatalChart } from './tuViEngine';
import { getDisplayedPalaceStars } from './starVisibility';

describe('Khâm Thiên natal star element metadata', () => {
  it('defines the complete 18-star canonical set and expected primary elements', () => {
    expect(Object.keys(STAR_ELEMENTS)).toHaveLength(18);
    expect(Object.keys(STAR_ID_BY_NAME)).toHaveLength(18);
    expect(STAR_ELEMENTS).toMatchObject({
      TU_VI: { primary: 'THO' }, THIEN_CO: { primary: 'MOC' }, THAI_DUONG: { primary: 'HOA' },
      VU_KHUC: { primary: 'KIM' }, THIEN_DONG: { primary: 'THUY' }, LIEM_TRINH: { primary: 'HOA' },
      THIEN_PHU: { primary: 'THO' }, THAI_AM: { primary: 'THUY' }, THAM_LANG: { primary: 'THUY', secondary: 'MOC' },
      CU_MON: { primary: 'THUY' }, THIEN_TUONG: { primary: 'THUY' }, THIEN_LUONG: { primary: 'MOC' },
      THAT_SAT: { primary: 'KIM', secondary: 'HOA' }, PHA_QUAN: { primary: 'THUY' },
      VAN_XUONG: { primary: 'KIM' }, VAN_KHUC: { primary: 'THUY' }, TA_PHU: { primary: 'THO' }, HUU_BAT: { primary: 'THUY' },
    });
  });

  it('renders each known star with its own normalized element color token, independent of Hua', () => {
    Object.entries(STAR_ID_BY_NAME).forEach(([name, id]) => {
      const markup = renderToStaticMarkup(React.createElement(StarName, { starId: id, name }));
      expect(markup).toContain(`data-star-id="${id}"`);
      expect(markup).toContain(`data-element="${STAR_ELEMENTS[id].primary}"`);
      expect(markup).toContain('class="star-name"');
    });
    expect(ELEMENT_IDS.map((element) => ELEMENT_LABEL[element])).toEqual(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']);
    expect(DARK_ELEMENT_COLORS).toEqual({ KIM: '#F5D47A', MOC: '#4ADE80', THUY: '#7DD3FC', HOA: '#FB7185', THO: '#E8B86D' });
    expect(LIGHT_ELEMENT_COLORS).toEqual({ KIM: '#8A5A00', MOC: '#166534', THUY: '#075985', HOA: '#B42318', THO: '#87520C' });
  });

  it('preserves the 25/09/2000 chart placements while exposing the requested primary elements', () => {
    const chart = generateNatalChart({ name: 'Golden', date: '2000-09-25', time: '10:20', gender: 'Nam', calendar: 'solar', forecastYear: 2026 });
    const stars = chart.palaces.flatMap((palace) => [...palace.majorStars, ...palace.minorStars]);
    const byName = new Map(stars.map((star) => [star.name, star]));
    const expected: Record<string, string> = {
      'Vũ Khúc': 'KIM', 'Tử Vi': 'THO', 'Thiên Phủ': 'THO', 'Thái Dương': 'HOA', 'Văn Xương': 'KIM',
      'Thái Âm': 'THUY', 'Văn Khúc': 'THUY', 'Cự Môn': 'THUY', 'Tả Phù': 'THO', 'Thất Sát': 'KIM', 'Thiên Lương': 'MOC',
    };
    Object.entries(expected).forEach(([name, element]) => {
      expect(byName.get(name)?.element).toBe(ELEMENT_LABEL[element as keyof typeof ELEMENT_LABEL]);
    });
    expect(getDisplayedPalaceStars(chart.palaces.find((palace) => palace.name === 'Mệnh')!, 'kham_thien').majorStars.map((star) => star.name)).toContain('Vũ Khúc');
  });
});
