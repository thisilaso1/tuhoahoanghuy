import React, { useRef, useState } from 'react';
import { NatalChart } from '../../domain/types';
import { PalaceCell } from './PalaceCell';
import { calculateAllFlyingTransformations, FlyingTransformation, getAnnualTransformations, getBirthYearTransformations, TuHoaSchool } from '../../domain/tuHoaEngine';
import { calculateAnnualStars } from '../../domain/annualStars';
import { getPalaceAgeMappings, PalaceAgeOptions } from '../../domain/palaceAge';
import { ELEMENT_IDS, ELEMENT_LABEL } from '../../domain/starElements';
import { PhiHoaVisibility } from './PhiHoaFilterPanel';
import { NamPhaiRelationOverlay } from './NamPhaiRelationOverlay';
import { findNamPhaiLaiNhanPalace, getNamPhaiPalaceRelations } from '../../domain/namPhaiPalaceRelationEngine';

export interface ChartLayerVisibility {
  showBirthYear: boolean;
  showAnnual: boolean;
}
export type ChartTheme = 'paper' | 'parchment' | 'night';

interface NatalChart12Props {
  chart: NatalChart;
  focusedPalaceIndex: number | null;
  selectedPhiPalaceIndices: number[];
  onSelectPalace: (index: number) => void;
  layers: ChartLayerVisibility;
  theme: ChartTheme;
  school: TuHoaSchool;
  palaceAgeOptions: PalaceAgeOptions;
  selectedLunarMonth: number;
  phiHoaVisibility: PhiHoaVisibility;
  namPhaiRelationOptions?: { tamHop: boolean; xungChieu: boolean; giapCung: boolean; lines: boolean; highlight: boolean; laiNhan: boolean };
  namPhaiLayoutMode?: 'auto' | 'compact' | 'wide';
  onClearPalaceSelection?: () => void;
}

// Tọa độ lưới 4x4 truyền thống
// Tý = 0, Sửu = 1, Dần = 2, Mão = 3, Thìn = 4, Tỵ = 5, Ngọ = 6, Mùi = 7, Thân = 8, Dậu = 9, Tuất = 10, Hợi = 11
const BRANCH_GRID: Record<number, [number, number]> = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1],                           9: [2, 4],
  3: [3, 1],                          10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};

const HOA_SYMBOL = { Lộc: 'A', Quyền: 'B', Khoa: 'C', Kỵ: 'D' } as const;

function formatDateDDMMYYYY(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return year && month && day ? `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}` : isoDate;
}

function getPalaceCenterPoint(index: number) {
  const [row, column] = BRANCH_GRID[index];
  const physicalX = (column - 0.5) * 250;
  const physicalY = (row - 0.5) * 250;
  // The SVG is inset by 3.2% around the grid; map cell centers into that expanded viewBox.
  return { x: (physicalX + 32) / 1.064, y: (physicalY + 32) / 1.064 };
}

function getPalacePairMidpoint(firstIndex: number, secondIndex: number) {
  const [firstRow, firstColumn] = BRANCH_GRID[firstIndex];
  const [secondRow, secondColumn] = BRANCH_GRID[secondIndex];
  return {
    left: (((firstColumn + secondColumn) / 2) - 0.5) * 25,
    top: (((firstRow + secondRow) / 2) - 0.5) * 25,
  };
}

function getPalaceEdgePoint(index: number, edge: 'inner' | 'outer') {
  const point = getPalaceCenterPoint(index);
  if (edge === 'outer') {
    const [row, column] = BRANCH_GRID[index];
    if (row === 1) return { x: point.x, y: 30 };
    if (row === 4) return { x: point.x, y: 970 };
    if (column === 1) return { x: 30, y: point.y };
    return { x: 970, y: point.y };
  }
  const dx = point.x - 500;
  const dy = point.y - 500;
  const scale = 235 / Math.max(Math.abs(dx), Math.abs(dy));
  return { x: 500 + dx * scale, y: 500 + dy * scale };
}

function getCentrifugalOuterPoint(index: number) {
  const boundary = getPalaceEdgePoint(index, 'outer');
  const [row, column] = BRANCH_GRID[index];
  if (row === 1) return { x: boundary.x, y: 0 };
  if (row === 4) return { x: boundary.x, y: 1000 };
  if (column === 1) return { x: 0, y: boundary.y };
  return { x: 1000, y: boundary.y };
}

export const NatalChart12: React.FC<NatalChart12Props> = ({
  chart,
  focusedPalaceIndex,
  selectedPhiPalaceIndices,
  onSelectPalace,
  layers,
  theme,
  school,
  palaceAgeOptions,
  selectedLunarMonth,
  phiHoaVisibility,
  namPhaiRelationOptions = { tamHop: true, xungChieu: true, giapCung: true, lines: true, highlight: true, laiNhan: true },
  namPhaiLayoutMode = 'auto',
  onClearPalaceSelection,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredPalaceIndex, setHoveredPalaceIndex] = useState<number | null>(null);
  const allTransformations = school === 'kham_thien' ? calculateAllFlyingTransformations(chart, school) : [];
  const birthYearTransformations = getBirthYearTransformations(chart, school);
  const annualStars = school === 'nam_phai' && layers.showAnnual ? calculateAnnualStars(chart, chart.forecastYear) : [];
  const annualTransformations = school === 'nam_phai' && layers.showAnnual
    ? getAnnualTransformations(chart, chart.forecastYear, school)
    : [];
  const palaceAgeMappings = getPalaceAgeMappings(chart.palaces, chart.lunarDate.year, palaceAgeOptions);
  const laiNhan = school === 'nam_phai' && namPhaiRelationOptions.laiNhan ? findNamPhaiLaiNhanPalace(chart) : null;
  const laiNhanInfo = findNamPhaiLaiNhanPalace(chart);
  const menhBranch = chart.palaces.find((palace) => palace.index === chart.menhPalaceIndex)?.branch;
  const menhChuByBranch: Record<string, string> = {
    Tý: 'Tham Lang', Sửu: 'Cự Môn', Dần: 'Lộc Tồn', Mão: 'Văn Khúc',
    Thìn: 'Liêm Trinh', Tỵ: 'Vũ Khúc', Ngọ: 'Phá Quân', Mùi: 'Vũ Khúc',
    Thân: 'Liêm Trinh', Dậu: 'Văn Khúc', Tuất: 'Lộc Tồn', Hợi: 'Cự Môn',
  };
  const menhChu = menhBranch ? menhChuByBranch[menhBranch] : '—';
  const laiNhanName = laiNhanInfo.status === 'FOUND'
    ? `${laiNhanInfo.palace.name} (${laiNhanInfo.palace.stem} ${laiNhanInfo.branch})`
    : 'Chưa xác định';
  const relationFocus = hoveredPalaceIndex ?? focusedPalaceIndex;
  const relations = relationFocus === null ? null : getNamPhaiPalaceRelations(relationFocus);
  const relationRole = (index: number): 'self' | 'tam-hop' | 'xung-chieu' | 'giap-cung' | null => {
    if (school !== 'nam_phai' || !relations || !namPhaiRelationOptions.highlight) return null;
    if (index === relations.self) return 'self';
    if (namPhaiRelationOptions.tamHop && relations.tamHop.includes(index)) return 'tam-hop';
    if (namPhaiRelationOptions.xungChieu && relations.xungChieu === index) return 'xung-chieu';
    if (namPhaiRelationOptions.giapCung && relations.giapCung.includes(index)) return 'giap-cung';
    return null;
  };

  // Lọc đường Tứ Hóa hiển thị
  const visibleTransformations = school === 'kham_thien' ? allTransformations.filter((t) =>
    t.mode !== 'flying' || selectedPhiPalaceIndices.includes(t.sourcePalaceIndex),
  ) : [];

  return (
    <div className={`chart-theme chart-theme-${theme} chart-export-frame ${school === 'nam_phai' ? `chart-school-nam-phai nam-phai-layout-${namPhaiLayoutMode}` : ''} relative w-full overflow-visible rounded-2xl p-2 sm:p-4 shadow-2xl`}>
      <div className="star-element-legend" aria-label="Chú giải Ngũ Hành tinh diệu">
        <span className="star-element-legend-title">NGŨ HÀNH TINH DIỆU</span>
        {ELEMENT_IDS.map((element) => <span className="star-element-legend-item" data-element={element} key={element}><i />{ELEMENT_LABEL[element]}</span>)}
      </div>
      <div ref={chartRef} className="palace-grid w-full">
        {/* 12 Cung xung quanh */}
        {chart.palaces.map((palace) => {
          const [row, col] = BRANCH_GRID[palace.index];
          return (
            <PalaceCell
              key={palace.index}
              palace={palace}
              isFocused={focusedPalaceIndex === palace.index}
              isPhiSelected={school === 'kham_thien' && selectedPhiPalaceIndices.includes(palace.index)}
              onSelect={() => onSelectPalace(palace.index)}
              onHoverPalace={school === 'nam_phai' ? setHoveredPalaceIndex : undefined}
              onClearPalaceSelection={onClearPalaceSelection}
              isLaiNhan={laiNhan?.status === 'FOUND' && laiNhan.palace.index === palace.index}
              relationRole={relationRole(palace.index)}
              showAnnual={layers.showAnnual}
              theme={theme}
              annualLimitAge={chart.forecastYear - chart.lunarDate.year + 1}
              annualLimitYear={chart.forecastYear}
              isSelectedLunarMonth={palace.lunarMonth === selectedLunarMonth}
              birthYearTransformations={birthYearTransformations.filter((item) => item.palaceIndex === palace.index)}
              annualStars={annualStars.filter((item) => item.branchIndex === palace.index)}
              annualHuas={annualTransformations.filter((item) => item.palaceIndex === palace.index)}
              palaceAgeMapping={palaceAgeMappings.find((item) => item.palaceId === `palace-${palace.index}`) ?? null}
              school={school}
              gridRow={row}
              gridColumn={col}
            />
          );
        })}

        {school === 'nam_phai' && <NamPhaiRelationOverlay containerRef={chartRef} selectedIndex={relationFocus} enabled={namPhaiRelationOptions} />}

        {/* Tuần / Triệt belong to the boundary between their two affected palaces. */}
        {(['tuan', 'triet'] as const).flatMap((kind) => {
          const affected = chart.palaces.filter((palace) => palace[kind]);
          if (affected.length < 2) return [];
          const position = getPalacePairMidpoint(affected[0].index, affected[1].index);
          const label = kind === 'tuan' ? 'TUẦN' : 'TRIỆT';
          const otherKind = kind === 'tuan' ? 'triet' : 'tuan';
          const otherAffected = chart.palaces.filter((palace) => palace[otherKind]);
          const sharesBoundary = otherAffected.length >= 2 && affected.slice(0, 2).every((palace) => otherAffected.slice(0, 2).some((other) => other.index === palace.index));
          const horizontalOffset = sharesBoundary ? (kind === 'tuan' ? -3.2 : 3.2) : 0;
          const spansHorizontalBoundary = BRANCH_GRID[affected[0].index][0] === BRANCH_GRID[affected[1].index][0];
          // Triệt sits toward the lower corner of two side-by-side palaces,
          // away from the star names near the palace headers.
          const verticalOffset = kind === 'triet' && spansHorizontalBoundary ? 8 : 0;
          return [<span
            key={kind}
            className={`palace-boundary-badge palace-boundary-${kind}`}
            style={{ left: `${position.left + horizontalOffset}%`, top: `${position.top + verticalOffset}%` }}
            aria-label={`${label} án hai cung ${affected[0].name} và ${affected[1].name}`}
            title={`${label}: ${affected[0].name} · ${affected[1].name}`}
          >{label}</span>];
        })}

        {/* The subject profile sits in the central field; SVG paths paint above it. */}
        <section className="center-chamber" aria-label="Thông tin đương số">
          <div className="chart-subject-panel">
            <div className="chart-center-brand">
              <div className="chart-center-symbol select-none" aria-hidden="true">☯</div>
              <div className="chart-center-brand-name">HOÀI NGUYỆT CÁC</div>
              <div className="chart-center-eyebrow">LÁ SỐ TỬ VI · {school === 'nam_phai' ? 'NAM PHÁI' : 'KHÂM THIÊN TỨ HÓA'}</div>
            </div>
            <div className="chart-center-name-row">
              <span className="chart-data-label">Họ và tên</span>
              <strong className="chart-center-name">{chart.name}</strong>
            </div>
            <div className="chart-center-meta">{chart.gender} · {chart.birthCanChi.year.stem} {chart.birthCanChi.year.branch}</div>
            <div className="chart-center-data">
              <div className="chart-info-row"><span className="chart-data-label">Ngày sinh dương</span><strong className="chart-data-value">{formatDateDDMMYYYY(chart.solarDate)} · {chart.time}</strong></div>
              <div className="chart-info-row"><span className="chart-data-label">Ngày sinh âm lịch</span><strong className="chart-data-value">{String(chart.lunarDate.day).padStart(2, '0')}/{String(chart.lunarDate.month).padStart(2, '0')}/{chart.lunarDate.year}{chart.lunarDate.isLeap ? ' (nhuận)' : ''} · {chart.birthCanChi.hour.stem} {chart.birthCanChi.hour.branch}</strong></div>
              <div className="chart-info-row"><span className="chart-data-label">Lai nhân cung</span><strong className="chart-data-value">{laiNhanName}</strong></div>
              <div className="chart-info-row"><span className="chart-data-label">Bản mệnh</span><strong className="chart-data-emphasis">{chart.napAm}</strong></div>
              <div className="chart-info-row"><span className="chart-data-label">Cục số</span><strong className="chart-data-emphasis">{chart.cuc.name}</strong></div>
              <div className="chart-info-row chart-info-row-menh-chu"><span className="chart-data-label">Chủ mệnh</span><strong className="chart-data-emphasis">{menhChu}</strong></div>
              <div className="chart-info-row"><span className="chart-data-label">Năm xem</span><strong className="chart-data-forecast">{chart.forecastCanChi.stem} {chart.forecastCanChi.branch} {chart.forecastYear}</strong></div>
            </div>
            <div className="chart-center-foot">HOÀI NGUYỆT CÁC <span>·</span> {school === 'nam_phai' ? 'TỬ VI NAM PHÁI' : 'KHÂM THIÊN TỨ HÓA'}</div>
            <p className="chart-subject-slogan">“Nhất phiến cố nguyệt, vạn cổ nhân duyên.”</p>
          </div>
        </section>

      {/* SVG Tứ Hóa Flow Lines Overlay */}
        {school === 'kham_thien' && <svg
          className="tuhoa-svg-overlay"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-label="Đường Tứ Hóa Khâm Thiên"
        >
          <defs>
            {(['Lộc', 'Quyền', 'Khoa', 'Kỵ'] as const).map((kind) => (
              <marker
                key={kind}
                id={`arrow-head-${kind}`}
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,1 L7,4 L0,7 Z"
                  className={
                    kind === 'Lộc'
                      ? 'fill-emerald-400'
                      : kind === 'Quyền'
                      ? 'fill-amber-400'
                      : kind === 'Khoa'
                      ? 'fill-blue-800'
                      : 'fill-rose-500'
                  }
                />
              </marker>
            ))}
          </defs>

          {visibleTransformations.map((t, index) => {
            const isCentrifugal = t.mode === 'ly_tam';
            const isSelf = t.sourcePalaceIndex === t.targetPalaceIndex;
            // Self/opposite-palace transformations are core chart annotations,
            // not ordinary flying lines; keep them visible regardless of the
            // optional Phi Hóa type filters.
            const isAlwaysVisibleTransformation = t.mode !== 'flying';
            const isFilteredOut = !isAlwaysVisibleTransformation && !phiHoaVisibility[t.type];
            // Multiple self-transformations can leave the same palace (for
            // example Tân: Thái Dương Quyền and Văn Xương Kỵ). Give each line
            // its own anchor along that palace edge so their arrows and A/B/C/D
            // badges do not paint directly on top of one another.
            const centrifugalSiblings = isCentrifugal
              ? visibleTransformations.filter((other) => other.mode === 'ly_tam' && other.sourcePalaceIndex === t.sourcePalaceIndex)
              : [];
            const siblingIndex = centrifugalSiblings.findIndex((other) => other.id === t.id);
            const edgeOffset = centrifugalSiblings.length > 1
              ? (siblingIndex - (centrifugalSiblings.length - 1) / 2) * 22
              : 0;
            const palaceGridPosition = BRANCH_GRID[t.sourcePalaceIndex];
            const offsetAlongEdge = (point: { x: number; y: number }) => {
              if (palaceGridPosition[0] === 1 || palaceGridPosition[0] === 4) return { ...point, x: point.x + edgeOffset };
              return { ...point, y: point.y + edgeOffset };
            };
            const startBase = getPalaceEdgePoint(t.sourcePalaceIndex, isCentrifugal ? 'outer' : 'inner');
            const endBase = isCentrifugal
              ? getCentrifugalOuterPoint(t.sourcePalaceIndex)
              : getPalaceEdgePoint(t.targetPalaceIndex, 'inner');
            const start = isCentrifugal ? offsetAlongEdge(startBase) : startBase;
            const end = isCentrifugal ? offsetAlongEdge(endBase) : endBase;

            // Tọa độ đặt huy hiệu ký hiệu A, B, C, D
            const badgeX = start.x + (end.x - start.x) * (isCentrifugal ? 0.55 : 0.82);
            const badgeY = start.y + (end.y - start.y) * (isCentrifugal ? 0.55 : 0.82);

            const pathD =
              isCentrifugal
                ? `M ${start.x} ${start.y} L ${end.x} ${end.y}`
                : isSelf
                ? `M ${start.x} ${start.y} Q ${500 + (start.x - 500) * 0.78} ${500 + (start.y - 500) * 0.78}, ${start.x} ${start.y}`
                : `M ${start.x} ${start.y} Q 500 500, ${end.x} ${end.y}`;

            const strokeColor =
              t.type === 'Lộc'
                ? '#34d399'
                : t.type === 'Quyền'
                ? '#fbbf24'
                : t.type === 'Khoa'
                ? '#0759a5'
                : '#f43f5e';

            const dashArray =
              t.mode === 'ly_tam' ? '4 4' : t.mode === 'huong_tam' ? '12 4 2 4' : '8 5';

            return (
              <g key={t.id} className={`group phi-hoa-edge ${isFilteredOut ? 'phi-hoa-filtered-out' : ''}`} aria-hidden={isFilteredOut}>
                <title>
                  {t.mode === 'ly_tam'
                    ? `Cung ${chart.palaces[t.sourcePalaceIndex].name} tự hóa ${t.type}, hướng ra ngoài lá số`
                    : `${t.mode === 'huong_tam' ? 'Hướng tâm' : 'Phi tinh'} ${t.type}: ${chart.palaces[t.sourcePalaceIndex].name} → ${chart.palaces[t.targetPalaceIndex].name}`}
                </title>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={t.mode === 'ly_tam' ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={dashArray}
                  strokeOpacity="0.85"
                  markerEnd={`url(#arrow-head-${t.type})`}
                  className="transition-all duration-300"
                />
                <circle
                  cx={badgeX}
                  cy={badgeY}
                  r="13"
                  fill={theme === 'night' ? '#0A111C' : theme === 'parchment' ? '#f7efdf' : '#ffffff'}
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                <text
                  x={badgeX}
                  y={badgeY + 4.5}
                  fill={strokeColor}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="'Be Vietnam Pro', sans-serif"
                >
                  {HOA_SYMBOL[t.type]}
                </text>
              </g>
            );
          })}
        </svg>}
      </div>

      {/* Legend Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/20 pt-2 text-[11px] text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-serif font-medium text-amber-200">
            {school === 'nam_phai' ? (relationFocus !== null ? `Quan hệ cung: ${chart.palaces[relationFocus].name}` : 'Chọn cung để xem Tam Phương Tứ Chính và Giáp Cung') : focusedPalaceIndex !== null
              ? `Đang soi chiếu: Cung ${chart.palaces[focusedPalaceIndex].name}`
              : selectedPhiPalaceIndices.length > 0
                ? `Phi Hóa từ ${selectedPhiPalaceIndices.map((index) => chart.palaces[index].name).join(', ')}`
                : 'Chọn một hoặc nhiều cung để xem Phi Hóa'}
          </span>
          {school === 'kham_thien' && <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> A: Hóa Lộc
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> B: Hóa Quyền
            </span>
            <span className="flex items-center gap-1 text-blue-800">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-800" /> C: Hóa Khoa
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> D: Hóa Kỵ
            </span>
          </div>}
        </div>

        {school === 'kham_thien' ? <div className="flex items-center gap-3 text-[10px] text-stone-500">
          <span>─ ─ Phi Tinh</span>
          <span>· · · Tự Hóa Ly Tâm</span>
          <span>─ · ─ Hướng Tâm</span>
        </div> : <div className="flex items-center gap-3 text-[10px] text-stone-500"><span>— Tam Hợp</span><span>– – Xung Chiếu</span><span>··· Giáp Cung</span>{laiNhan?.status === 'NOT_UNIQUE' && <span className="text-rose-600">Không xác định được duy nhất Lai Nhân Cung</span>}</div>}
      </div>
    </div>
  );
};
