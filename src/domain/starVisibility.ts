import type { Palace } from './types';
import { STAR_ID_BY_NAME } from './starElements';
import { getStarBrightness, NAM_PHAI_FULL_PROFILE_ID } from './starBrightness';

export type TuViSchool = 'kham_thien' | 'nam_phai';

export const KHAM_THIEN_VISIBLE_STARS = [
  'TU_VI', 'THIEN_CO', 'THAI_DUONG', 'VU_KHUC', 'THIEN_DONG', 'LIEM_TRINH',
  'THIEN_PHU', 'THAI_AM', 'THAM_LANG', 'CU_MON', 'THIEN_TUONG', 'THIEN_LUONG', 'THAT_SAT', 'PHA_QUAN',
  'VAN_XUONG', 'VAN_KHUC', 'TA_PHU', 'HUU_BAT',
] as const;

const KHAM_THIEN_VISIBLE_SET = new Set<string>(KHAM_THIEN_VISIBLE_STARS);
const FOUR_TRANSFORMABLE_AUXILIARY_STARS = new Set(['Văn Xương', 'Văn Khúc', 'Tả Phù', 'Hữu Bật']);

export function isKhamThienVisibleStar(starName: string): boolean {
  const starId = STAR_ID_BY_NAME[starName];
  return starId !== undefined && KHAM_THIEN_VISIBLE_SET.has(starId);
}

export function getDisplayedPalaceStars(palace: Palace, school: TuViSchool) {
  const showStar = (starName: string) => school !== 'kham_thien' || isKhamThienVisibleStar(starName);
  const promotedAuxiliaryStars = school === 'kham_thien'
    ? FOUR_TRANSFORMABLE_AUXILIARY_STARS
    : new Set(['Văn Xương', 'Văn Khúc']);
  return {
    majorStars: [
      ...palace.majorStars.filter((star) => showStar(star.name)).map((star) => {
        if (school !== 'nam_phai') return star;
        const starId = STAR_ID_BY_NAME[star.name];
        // Resolve from the selected profile and the palace's Earthly Branch
        // every time. Saved charts may contain an older cached brightnessByProfile
        // value, so that cache must not override the V2 registry.
        const brightness = starId
          ? getStarBrightness(starId, palace.branch, NAM_PHAI_FULL_PROFILE_ID)
          : 'UNSPECIFIED';
        return {
          ...star,
          brightness,
          brightnessByProfile: { ...star.brightnessByProfile, [NAM_PHAI_FULL_PROFILE_ID]: brightness },
        };
      }),
      ...palace.minorStars
        .filter((star) => promotedAuxiliaryStars.has(star.name) && showStar(star.name))
        .map((star) => school !== 'nam_phai' ? star : {
          ...star,
          brightness: getStarBrightness(star.id ?? star.name, palace.branch, NAM_PHAI_FULL_PROFILE_ID),
        }),
    ],
    minorStars: palace.minorStars
      .filter((star) => !promotedAuxiliaryStars.has(star.name) && showStar(star.name))
      .map((star) => school !== 'nam_phai' ? star : {
        ...star,
        brightness: getStarBrightness(star.id ?? star.name, palace.branch, NAM_PHAI_FULL_PROFILE_ID),
      }),
  };
}
