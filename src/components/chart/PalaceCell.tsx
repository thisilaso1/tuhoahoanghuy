import React from 'react';
import { Palace, TransformationType } from '../../domain/types';
import type { ChartTheme } from './NatalChart12';
import type { BirthYearTransformation } from '../../domain/tuHoaEngine';
import type { PalaceAgeMapping } from '../../domain/palaceAge';
import { getDisplayedPalaceStars } from '../../domain/starVisibility';
import type { TuHoaSchool } from '../../domain/tuHoaEngine';
import type { AnnualStar } from '../../domain/annualStars';
import { STAR_ID_BY_NAME } from '../../domain/starElements';
import { StarName } from './StarName';

interface PalaceCellProps {
  palace: Palace;
  isFocused: boolean;
  isPhiSelected: boolean;
  onSelect: () => void;
  showAnnual: boolean;
  gridRow: number;
  gridColumn: number;
  theme: ChartTheme;
  annualLimitAge: number;
  annualLimitYear: number;
  isSelectedLunarMonth: boolean;
  birthYearTransformations: BirthYearTransformation[];
  annualStars: AnnualStar[];
  annualHuas: Array<{ type: TransformationType; star: string }>;
  annualYear: number;
  palaceAgeMapping: PalaceAgeMapping | null;
  school: TuHoaSchool;
}

const BRIGHTNESS_SHORT: Record<string, string> = { Miếu: 'M', Vượng: 'V', Đắc: 'Đ', Hãm: 'H', Bình: 'B' };
const TRANG_SINH_STAGES = new Set(['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng']);
const BRANCH_ELEMENT: Record<string, string> = {
  Tý: 'Thủy', Sửu: 'Thổ', Dần: 'Mộc', Mão: 'Mộc', Thìn: 'Thổ', Tỵ: 'Hỏa',
  Ngọ: 'Hỏa', Mùi: 'Thổ', Thân: 'Kim', Dậu: 'Kim', Tuất: 'Thổ', Hợi: 'Thủy',
};
const HUA_MARK: Record<TransformationType, string> = { Lộc: 'A', Quyền: 'B', Khoa: 'C', Kỵ: 'D' };
const YIN_YANG_STARS: Record<string, 'yang' | 'yin'> = {
  'Tử Vi': 'yin', 'Thiên Cơ': 'yin', 'Thái Dương': 'yang', 'Vũ Khúc': 'yin',
  'Thiên Đồng': 'yang', 'Liêm Trinh': 'yin', 'Thiên Phủ': 'yang', 'Thái Âm': 'yin',
  'Tham Lang': 'yang', 'Cự Môn': 'yang', 'Thiên Tướng': 'yang', 'Thiên Lương': 'yang',
  'Thất Sát': 'yin', 'Phá Quân': 'yin', 'Văn Xương': 'yang', 'Văn Khúc': 'yin',
  'Tả Phù': 'yang', 'Hữu Bật': 'yin',
};

export const PalaceCell: React.FC<PalaceCellProps> = ({
  palace,
  isFocused,
  isPhiSelected,
  onSelect,
  showAnnual,
  gridRow,
  gridColumn,
  theme,
  annualLimitAge,
  annualLimitYear,
  isSelectedLunarMonth,
  birthYearTransformations,
  annualStars,
  annualHuas,
  annualYear,
  palaceAgeMapping,
  school,
}) => {
  const { majorStars: displayedMajorStars, minorStars: allDisplayedMinorStars } = getDisplayedPalaceStars(palace, school);
  const trangSinhStage = school === 'nam_phai' ? allDisplayedMinorStars.find((star) => TRANG_SINH_STAGES.has(star.name)) : undefined;
  const displayedMinorStars = school === 'nam_phai'
    ? allDisplayedMinorStars.filter((star) => !TRANG_SINH_STAGES.has(star.name))
    : allDisplayedMinorStars;
  const auspiciousStars = displayedMinorStars.filter((star) => star.category !== 'bad');
  const adverseStars = displayedMinorStars.filter((star) => star.category === 'bad');

  return (
    <article
      onClick={onSelect}
      style={{ gridRow, gridColumn }}
      className={`palace-cell group ${theme === 'paper' ? 'palace-paper' : theme === 'parchment' ? 'palace-parchment' : 'palace-night'} ${isFocused ? 'focused' : ''} ${isPhiSelected ? 'phi-selected' : ''} ${isSelectedLunarMonth ? 'selected-lunar-month' : ''} ${showAnnual && palace.isAnnualLimit ? 'selected-annual-limit' : ''}`}
    >
      {/* ══ HEADER: Tên cung / Đại Hạn / Can Chi ══ */}
      <div className="palace-cell-heading">
        {/* Row 1: Tên cung lớn, căn giữa */}
        <div className="palace-heading-name-row">
          <span
            className="palace-name palace-heading-title font-serif font-bold"
            data-element={BRANCH_ELEMENT[palace.branch]}
          >
            {palace.name}
            {palace.isBodyPalace && <span className="palace-body-inline"> (Thân)</span>}
          </span>
        </div>

        {/* Row 2: Đại Hạn + Sinh Niên Tứ Hóa badges (trái) | Can Chi (phải) */}
        <div className="palace-heading-meta-row">
          <div className="palace-heading-meta-left">
            <span
              className="palace-heading-age"
              title={`Đại hạn ${palace.decade.startAge}–${palace.decade.endAge} tuổi`}
            >
              {palace.decade.startAge} tuổi
            </span>
            {birthYearTransformations.length > 0 && (
              <div className="palace-birth-hua-row" aria-label="Sinh Niên Tứ Hóa">
                {birthYearTransformations.map((item) => (
                  <span
                    key={item.id}
                    className={`chart-birth-hua chart-birth-hua-prominent hua-${
                      item.type === 'Lộc' ? 'loc' : item.type === 'Quyền' ? 'quyen' : item.type === 'Khoa' ? 'khoa' : 'ky'
                    }`}
                    title={`Sinh Niên Hóa ${item.type}: ${item.star} · Can ${item.yearStem}`}
                  >
                    {HUA_MARK[item.type]}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="palace-heading-stem">
            <span
              className="palace-stem rounded border px-1.5 py-0.5 font-serif text-[10px]"
              data-element={BRANCH_ELEMENT[palace.branch]}
            >
              {palace.stem} {palace.branch}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tuổi ứng cung (Age search results) ── */}
      {palaceAgeMapping && (
        <div
          className="palace-age-years"
          title={
            palaceAgeMapping.mode === 'FULL_CAN_CHI'
              ? 'Các năm có cả Can và Chi trùng cung'
              : 'Các năm có Địa Chi trùng cung'
          }
        >
          <span>Tuổi ứng</span>
          <strong>
            {palaceAgeMapping.matchingYears.length
              ? palaceAgeMapping.matchingYears.join(' · ')
              : '—'}
          </strong>
        </div>
      )}

      {/* ══ CHÍNH TINH — Vùng trung tâm cung ══
           Tách riêng hoàn toàn, cách tên cung bằng margin.
           Font lớn, đậm, hiển thị từng sao theo hàng dọc. */}
      <div className="palace-major-stars-zone">
        {displayedMajorStars.length > 0 ? (
          displayedMajorStars.map((star) => (
            <div key={star.name} className="palace-major-star-entry" data-element={star.element}>
              <StarName
                starId={STAR_ID_BY_NAME[star.name] ?? star.name}
                name={star.name}
                className="palace-major"
              />
              {star.brightness && (
                <span
                  title={star.brightness}
                  data-element={star.element}
                  className="palace-brightness-badge"
                >
                  ({BRIGHTNESS_SHORT[star.brightness] || star.brightness})
                </span>
              )}
            </div>
          ))
        ) : (
          <span className="palace-empty">Vô chính diệu</span>
        )}
      </div>

      {/* ══ PHỤ TINH — cát tinh trái | hung tinh phải ══ */}
      <div className="palace-minor-columns">
        <div className="palace-auspicious-stars">
          {auspiciousStars.map((star) => (
            <span
              key={star.name}
              data-element={star.element}
              data-yinyang={YIN_YANG_STARS[star.name]}
              className="palace-good-star"
            >
              {STAR_ID_BY_NAME[star.name] ? (
                <StarName starId={STAR_ID_BY_NAME[star.name]} name={star.name} />
              ) : (
                star.name
              )}
            </span>
          ))}
        </div>
        <div className="palace-adverse-stars" aria-label="Sát bại tinh">
          {adverseStars.map((star) => (
            <span
              key={star.name}
              data-element={star.element}
              data-yinyang={YIN_YANG_STARS[star.name]}
              className="palace-minor-star"
            >
              {STAR_ID_BY_NAME[star.name] ? (
                <StarName starId={STAR_ID_BY_NAME[star.name]} name={star.name} />
              ) : (
                star.name
              )}
            </span>
          ))}
        </div>
      </div>

      {showAnnual && school === 'nam_phai' && (annualStars.length > 0 || annualHuas.length > 0) && (
        <div className="palace-annual-star-list" aria-label={`Sao Lưu Niên ${annualYear}`}>
          <div className="palace-annual-star-items">
            {annualStars.map((item) => (
              <span key={item.id} className="palace-annual-star" data-element={item.element} title={`${item.name} · ${item.branch} · Độ sáng: Không quy định · ${item.placementRuleId}`}>
                {item.name}
              </span>
            ))}
            {annualHuas.map((item) => (
              <span key={`annual-hua:${item.type}:${item.star}`} className={`palace-annual-hua hua-${item.type === 'Lộc' ? 'loc' : item.type === 'Quyền' ? 'quyen' : item.type === 'Khoa' ? 'khoa' : 'ky'}`} title={`Lưu Hóa ${item.type} gắn với sao nguyên bàn ${item.star}`}>
                L.Hóa {item.type} · {item.star}
              </span>
            ))}
          </div>
        </div>
      )}

      {trangSinhStage && (
        <div className="palace-trang-sinh-stage" aria-label={`Vòng Tràng Sinh: ${trangSinhStage.name}`}>
          {trangSinhStage.name}
        </div>
      )}

      {/* ══ FOOTER: Nguyệt hạn + Tiểu Hạn ══ */}
      <div className="palace-cell-footer">
        <span className={`palace-month ${isSelectedLunarMonth ? 'palace-month-current' : ''}`} title={`Nguyệt Hạn tháng ${palace.lunarMonth} âm lịch`}>
          Nguyệt {palace.lunarMonth}{isSelectedLunarMonth && <small> · ĐANG XEM</small>}
        </span>
        {showAnnual && palace.isAnnualLimit && (
          <span className="palace-annual font-semibold" title={`Cung an Tiểu Hạn năm ${annualLimitYear}, tuổi mụ ${annualLimitAge}`}>
            TH {annualLimitYear} · {annualLimitAge}t
          </span>
        )}
      </div>
    </article>
  );
};
