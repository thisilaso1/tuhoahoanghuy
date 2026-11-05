import React from 'react';
import { Palace, Star, TransformationType } from '../../domain/types';
import type { ChartTheme } from './NatalChart12';
import type { BirthYearTransformation } from '../../domain/tuHoaEngine';
import type { PalaceAgeMapping } from '../../domain/palaceAge';
import { getDisplayedPalaceStars } from '../../domain/starVisibility';
import type { TuHoaSchool } from '../../domain/tuHoaEngine';
import type { AnnualStar } from '../../domain/annualStars';
import { STAR_ID_BY_NAME } from '../../domain/starElements';
import { getNamPhaiMinorStarBrightness } from '../../domain/starBrightness';
import { getAnnualDisplayRule, getNatalDisplayRule, groupStarsForNamPhai } from '../../domain/namPhaiStarDisplay';
import type { RenderableNamPhaiStar } from '../../domain/namPhaiStarDisplay';
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
  lunarMonth?: number;
  isLuuNienMenh?: boolean;
  showLimitLabels?: boolean;
  birthYearTransformations: BirthYearTransformation[];
  annualStars: AnnualStar[];
  annualHuas: Array<{ type: TransformationType; star: string }>;
  palaceAgeMapping: PalaceAgeMapping | null;
  school: TuHoaSchool;
  onHoverPalace?: (index: number | null) => void;
  onClearPalaceSelection?: () => void;
  isLaiNhan?: boolean;
  relationRole?: 'self' | 'tam-hop' | 'xung-chieu' | 'giap-cung' | null;
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
  lunarMonth = palace.lunarMonth,
  isLuuNienMenh,
  showLimitLabels,
  birthYearTransformations,
  annualStars,
  annualHuas,
  palaceAgeMapping,
  school,
  onHoverPalace,
  onClearPalaceSelection,
  isLaiNhan = false,
  relationRole = null,
}) => {
  const { majorStars: displayedMajorStars, minorStars: allDisplayedMinorStars } = getDisplayedPalaceStars(palace, school);
  const trangSinhStage = school === 'nam_phai' ? allDisplayedMinorStars.find((star) => TRANG_SINH_STAGES.has(star.name)) : undefined;
  const displayedMinorStars = school === 'nam_phai'
    ? allDisplayedMinorStars.filter((star) => !TRANG_SINH_STAGES.has(star.name))
    : allDisplayedMinorStars;
  const auspiciousStars = displayedMinorStars.filter((star) => star.category === 'good');
  const adverseStars = displayedMinorStars.filter((star) => star.category === 'bad');
  const neutralStars = displayedMinorStars.filter((star) => star.category === 'other');
  const namPhaiItems: RenderableNamPhaiStar<Star | AnnualStar | BirthYearTransformation>[] = school === 'nam_phai' ? [
    ...displayedMinorStars.flatMap((star) => {
      const rule = getNatalDisplayRule(star.name);
      return rule ? [{ id: rule.starId, name: star.name, layer: 'NATAL' as const, displayColumn: rule.displayColumn, displayOrder: rule.order, data: star }] : [];
    }),
    ...birthYearTransformations.map((transformation, index) => ({
      id: transformation.id,
      name: `Hóa ${transformation.type}`,
      layer: 'NATAL' as const,
      displayColumn: transformation.type === 'Kỵ' ? 'RIGHT_HUNG' as const : 'LEFT_CATS' as const,
      displayOrder: 1000 + index,
      data: transformation,
    })),
    ...(showAnnual ? annualStars.flatMap((star) => {
      const rule = getAnnualDisplayRule(star.name);
      return rule ? [{ id: star.id, name: star.name, layer: 'ANNUAL' as const, displayColumn: rule.displayColumn, displayOrder: rule.order, data: star }] : [];
    }) : []),
  ] : [];
  const namPhaiGroups = groupStarsForNamPhai(namPhaiItems);
  const leftAnnualHuas = showAnnual && school === 'nam_phai' ? annualHuas.filter((item) => item.type !== 'Kỵ') : [];
  const rightAnnualHuas = showAnnual && school === 'nam_phai' ? annualHuas.filter((item) => item.type === 'Kỵ') : [];

  const renderMinorStar = (star: typeof displayedMinorStars[number], className: string) => {
    const brightness = school === 'nam_phai'
      ? getNamPhaiMinorStarBrightness(star.name, palace.branch)
      : 'UNSPECIFIED';
    return (
      <span
        key={star.name}
        data-element={star.element}
        data-yinyang={YIN_YANG_STARS[star.name]}
        className={className}
        title={brightness !== 'UNSPECIFIED' ? `${star.name} · ${brightness} tại ${palace.branch}` : undefined}
      >
        {STAR_ID_BY_NAME[star.name]
          ? <StarName starId={STAR_ID_BY_NAME[star.name]} name={star.name} />
          : star.name}
        {brightness !== 'UNSPECIFIED' && <strong className="palace-minor-brightness"> ({BRIGHTNESS_SHORT[brightness] || brightness})</strong>}
      </span>
    );
  };

  return (
    <article
      onClick={onSelect}
      onMouseEnter={() => onHoverPalace?.(palace.index)}
      onMouseLeave={() => onHoverPalace?.(null)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); }
        if (event.key === 'Escape') { event.preventDefault(); onHoverPalace?.(null); onClearPalaceSelection?.(); }
      }}
      tabIndex={0}
      data-palace-index={palace.index}
      style={{ gridRow, gridColumn }}
      className={`palace-cell group ${theme === 'paper' ? 'palace-paper' : theme === 'parchment' ? 'palace-parchment' : 'palace-night'} ${isFocused ? 'focused' : ''} ${isPhiSelected ? 'phi-selected' : ''} ${isSelectedLunarMonth ? 'selected-lunar-month' : ''} ${showAnnual && palace.isAnnualLimit ? 'selected-annual-limit' : ''} ${isLaiNhan ? 'lai-nhan-palace' : ''} ${relationRole ? `nam-phai-relation-${relationRole}` : ''}`}
    >
      {isLaiNhan && school === 'nam_phai' && <span className="nam-phai-lai-nhan-badge" title="Lai Nhân Cung — Can cung trùng Can năm sinh theo quy tắc LAI_NHAN_EXCLUDE_TY_SUU_V1">LAI NHÂN</span>}
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

      {/* ══ SAO PHỤ — giữ nhóm sao gọn, không in nhãn phân loại ══ */}
      <div className="palace-minor-columns">
        {school === 'nam_phai' ? (
          <div className="palace-auxiliary-grid" aria-label="Phụ tinh và sao lưu niên">
            <div className="palace-auxiliary-column palace-left-column">
              <div className="palace-auxiliary-star-list">
                {namPhaiGroups.leftNatal.map(({ data }) => {
                  if ('carrierStarId' in data) {
                    return <span key={data.id} className="palace-good-star">Hóa {data.type}</span>;
                  }
                  const star = data as Star;
                  return renderMinorStar(star, star.category === 'bad' ? 'palace-minor-star' : star.category === 'other' ? 'palace-neutral-star' : 'palace-good-star');
                })}
                {namPhaiGroups.leftAnnual.map(({ data }) => {
                  const item = data as AnnualStar;
                  return <span key={item.id} className="palace-annual-star" data-element={item.element} title={`${item.name} · ${item.branch}`}>
                    {item.name.replace(/^Lưu\s+/, 'L.')}
                  </span>;
                })}
                {leftAnnualHuas.map((item) => <span key={`annual-hua:${item.type}:${item.star}`} className={`palace-annual-hua hua-${item.type === 'Lộc' ? 'loc' : item.type === 'Quyền' ? 'quyen' : 'khoa'}`} title={`Lưu Hóa ${item.type}`}>
                  L.Hóa {item.type}
                </span>)}
              </div>
            </div>
            <div className="palace-auxiliary-column palace-right-column">
              <div className="palace-auxiliary-star-list">
                {namPhaiGroups.rightNatal.map(({ data }) => {
                  if ('carrierStarId' in data) {
                    return <span key={data.id} className="palace-minor-star">Hóa {data.type}</span>;
                  }
                  const star = data as Star;
                  return renderMinorStar(star, star.category === 'good' ? 'palace-good-star' : 'palace-minor-star');
                })}
                {namPhaiGroups.rightAnnual.map(({ data }) => {
                  const item = data as AnnualStar;
                  return <span key={item.id} className="palace-annual-star" data-element={item.element} title={`${item.name} · ${item.branch}`}>
                    {item.name.replace(/^Lưu\s+/, 'L.')}
                  </span>;
                })}
                {rightAnnualHuas.map((item) => <span key={`annual-hua:${item.type}:${item.star}`} className="palace-annual-hua hua-ky" title={`Lưu Hóa ${item.type}`}>
                  L.Hóa {item.type}
                </span>)}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="palace-auspicious-stars">
              {auspiciousStars.map((star) => renderMinorStar(star, 'palace-good-star'))}
              {neutralStars.map((star) => renderMinorStar(star, 'palace-neutral-star'))}
            </div>
            <div className="palace-adverse-stars" aria-label="Sao phụ">
              {adverseStars.map((star) => renderMinorStar(star, 'palace-minor-star'))}
            </div>
          </>
        )}
      </div>

      {trangSinhStage && (
        <div className="palace-trang-sinh-stage" aria-label={`Vòng Tràng Sinh: ${trangSinhStage.name}`}>
          {trangSinhStage.name}
        </div>
      )}

      {/* ══ FOOTER: Nguyệt hạn + Tiểu Hạn ══ */}
      <div className="palace-cell-footer">
        <span className={`palace-month ${isSelectedLunarMonth ? 'palace-month-current' : ''}`} title={`Nguyệt Hạn tháng ${lunarMonth} âm lịch`}>
          {showLimitLabels ? 'NH.' : 'Nguyệt '}{lunarMonth}{isSelectedLunarMonth && <small> · ĐANG XEM</small>}
        </span>
        {showAnnual && isLuuNienMenh && <span className="palace-annual font-semibold" title="Lưu niên Mệnh">LN.Mệnh</span>}
        {showAnnual && palace.isAnnualLimit && (
          <span className="palace-annual font-semibold" title={`Cung an Tiểu Hạn năm ${annualLimitYear}, tuổi mụ ${annualLimitAge}`}>
            {showLimitLabels ? `TH.${annualLimitAge}` : `TH ${annualLimitYear} · ${annualLimitAge}t`}
          </span>
        )}
      </div>
    </article>
  );
};
