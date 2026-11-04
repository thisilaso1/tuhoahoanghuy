import React, { useRef } from 'react';
import { NatalChart } from '../../domain/types';
import { PalaceCell } from './PalaceCell';
import { calculateAllFlyingTransformations, FlyingTransformation, getBirthYearTransformations, TuHoaSchool } from '../../domain/tuHoaEngine';
import { getPalaceAgeMappings, PalaceAgeOptions } from '../../domain/palaceAge';
import { ELEMENT_IDS, ELEMENT_LABEL } from '../../domain/starElements';
import { PhiHoaVisibility } from './PhiHoaFilterPanel';

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
  phiHoaVisibility: PhiHoaVisibility;
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
  phiHoaVisibility,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const allTransformations = calculateAllFlyingTransformations(chart, school);
  const birthYearTransformations = getBirthYearTransformations(chart, school);
  const palaceAgeMappings = getPalaceAgeMappings(chart.palaces, chart.lunarDate.year, palaceAgeOptions);

  // Lọc đường Tứ Hóa hiển thị
  const visibleTransformations = allTransformations.filter((t) =>
    t.mode !== 'flying' || selectedPhiPalaceIndices.includes(t.sourcePalaceIndex),
  );

  return (
    <div className={`chart-theme chart-theme-${theme} chart-export-frame relative w-full overflow-visible rounded-2xl p-2 sm:p-4 shadow-2xl`}>
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
              isPhiSelected={selectedPhiPalaceIndices.includes(palace.index)}
              onSelect={() => onSelectPalace(palace.index)}
              showAnnual={layers.showAnnual}
              theme={theme}
              annualLimitAge={chart.forecastYear - chart.lunarDate.year + 1}
              birthYearTransformations={birthYearTransformations.filter((item) => item.palaceIndex === palace.index)}
              palaceAgeMapping={palaceAgeMappings.find((item) => item.palaceId === `palace-${palace.index}`) ?? null}
              school={school}
              gridRow={row}
              gridColumn={col}
            />
          );
        })}

        {/* Tuần / Triệt belong to the boundary between their two affected palaces. */}
        {(['tuan', 'triet'] as const).flatMap((kind) => {
          const affected = chart.palaces.filter((palace) => palace[kind]);
          if (affected.length < 2) return [];
          const position = getPalacePairMidpoint(affected[0].index, affected[1].index);
          const label = kind === 'tuan' ? 'TUẦN' : 'TRIỆT';
          return [<span
            key={kind}
            className={`palace-boundary-badge palace-boundary-${kind}`}
            style={{ left: `${position.left}%`, top: `${position.top}%` }}
            aria-label={`${label} án hai cung ${affected[0].name} và ${affected[1].name}`}
            title={`${label}: ${affected[0].name} · ${affected[1].name}`}
          >{label}</span>];
        })}

        {/* The subject profile sits in the central field; SVG paths paint above it. */}
        <section className="center-chamber" aria-label="Thông tin đương số">
          <div className="chart-subject-panel">
            <div className="chart-subject-heading">
              <div className="chart-center-symbol select-none" aria-hidden="true">☯</div>
              <div>
                <div className="chart-center-eyebrow text-[10px] uppercase tracking-widest">ĐƯƠNG SỐ</div>
                <h2 className="chart-center-name font-serif font-bold">{chart.name}</h2>
                <div className="chart-center-meta">{chart.gender} · {chart.birthCanChi.year.stem} {chart.birthCanChi.year.branch}</div>
              </div>
            </div>
            <div className="chart-center-data space-y-1.5 rounded-xl p-3 text-left text-xs">
              <div className="flex justify-between"><span className="chart-data-label">Dương lịch:</span><span className="chart-data-value">{chart.solarDate} ({chart.time})</span></div>
              <div className="flex justify-between"><span className="chart-data-label">Âm lịch:</span><span className="chart-data-value">{chart.lunarDate.day}/{chart.lunarDate.month}/{chart.lunarDate.year} ({chart.birthCanChi.hour.stem} {chart.birthCanChi.hour.branch} thời)</span></div>
              <div className="flex justify-between"><span className="chart-data-label">Bản Mệnh:</span><span className="chart-data-emphasis">{chart.napAm}</span></div>
              <div className="flex justify-between"><span className="chart-data-label">Cục Số:</span><span className="chart-data-emphasis">{chart.cuc.name}</span></div>
              <div className="flex justify-between"><span className="chart-data-label">Năm xem:</span><span className="chart-data-forecast">{chart.forecastCanChi.stem} {chart.forecastCanChi.branch} {chart.forecastYear}</span></div>
            </div>
            <div className="chart-center-foot flex items-center gap-1.5 text-[9px] tracking-wider uppercase"><span>懷月閣</span><span>·</span><span>Khâm Thiên Tứ Hóa</span></div>
            <p className="chart-subject-slogan">“Nhất phiến cố nguyệt, vạn cổ nhân duyên.”</p>
          </div>
        </section>

      {/* SVG Tứ Hóa Flow Lines Overlay */}
        <svg
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
            const start = getPalaceEdgePoint(t.sourcePalaceIndex, isCentrifugal ? 'outer' : 'inner');
            const end = isCentrifugal
              ? getCentrifugalOuterPoint(t.sourcePalaceIndex)
              : getPalaceEdgePoint(t.targetPalaceIndex, 'inner');

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
              <g key={t.id} className={`group phi-hoa-edge ${phiHoaVisibility[t.type] ? '' : 'phi-hoa-filtered-out'}`} aria-hidden={!phiHoaVisibility[t.type]}>
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
        </svg>
      </div>

      {/* Legend Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/20 pt-2 text-[11px] text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-serif font-medium text-amber-200">
            {focusedPalaceIndex !== null
              ? `Đang soi chiếu: Cung ${chart.palaces[focusedPalaceIndex].name}`
              : selectedPhiPalaceIndices.length > 0
                ? `Phi Hóa từ ${selectedPhiPalaceIndices.map((index) => chart.palaces[index].name).join(', ')}`
                : 'Chọn một hoặc nhiều cung để xem Phi Hóa'}
          </span>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-stone-500">
          <span>─ ─ Phi Tinh</span>
          <span>· · · Tự Hóa Ly Tâm</span>
          <span>─ · ─ Hướng Tâm</span>
        </div>
      </div>
    </div>
  );
};
