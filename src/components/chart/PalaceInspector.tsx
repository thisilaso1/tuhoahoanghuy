import React from 'react';
import { Palace, NatalChart } from '../../domain/types';
import { getBirthYearTransformations, getPalaceTransformationProfile } from '../../domain/tuHoaEngine';
import type { BirthYearTransformation, TuHoaSchool } from '../../domain/tuHoaEngine';
import { getDisplayedPalaceStars } from '../../domain/starVisibility';
import type { ChartLayerVisibility } from './NatalChart12';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

interface PalaceInspectorProps {
  palace: Palace;
  chart: NatalChart;
  onClose: () => void;
  school: TuHoaSchool;
  layers: ChartLayerVisibility;
}

export const PalaceInspector: React.FC<PalaceInspectorProps> = ({
  palace,
  chart,
  onClose,
  school,
  layers,
}) => {
  const { sendMessageToThienCo, navigateTo } = useApp();
  const { majorStars: displayedMajorStars, minorStars: displayedMinorStars } = getDisplayedPalaceStars(palace, school);
  const profile = getPalaceTransformationProfile(chart, palace.index, school);
  const natalTransformations = getBirthYearTransformations(chart, school)
    .filter((item) => item.palaceIndex === palace.index);
  const visibleOutgoing = profile.outgoing;
  const visibleIncoming = profile.incoming;

  // Tam Phương Tứ Chính
  const oppositePalace = chart.palaces[(palace.index + 6) % 12];
  const tamHop1 = chart.palaces[(palace.index + 4) % 12];
  const tamHop2 = chart.palaces[(palace.index + 8) % 12];

  const handleAskCopilot = () => {
    sendMessageToThienCo(`Hãy phân tích chuyên sâu cung ${palace.name} (${palace.stem} ${palace.branch}) của tôi, bao gồm chính tinh tọa thủ và tương tác Tam Phương Tứ Chính.`);
    navigateTo('/thien-co');
  };

  return (
    <aside className="w-full rounded-2xl border border-amber-900/30 bg-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Cung {palace.name}
            </h3>
            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
              {palace.stem} {palace.branch}
            </span>
            {palace.isBodyPalace && (
              <span className="rounded bg-amber-600/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                THÂN CƯ
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Đại Hạn: {palace.decade.startAge}–{palace.decade.endAge} tuổi · Năm xem {chart.forecastYear} ·{' '}
            {palace.isAnnualLimit ? `Tiểu Hạn tại đây (${chart.forecastYear - chart.lunarDate.year + 1} tuổi)` : 'Không có Tiểu Hạn tại cung này'} · Nguyệt Hạn tháng {palace.lunarMonth}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-stone-400 hover:bg-slate-800 hover:text-stone-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* Stars Grid */}
      <div className="my-4 space-y-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
            Chính Tinh Tọa Thủ
          </h4>
          <div className="flex flex-wrap gap-2">
            {displayedMajorStars.length > 0 ? (
              displayedMajorStars.map((star) => (
                <div
                  key={star.name}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-600/30 bg-slate-800/80 px-2.5 py-1 text-xs"
                >
                  <span className="font-semibold text-amber-100">{star.name}</span>
                  <span className="rounded bg-amber-500/20 px-1 text-[10px] text-amber-300">
                    {star.brightness}
                  </span>
                  <span className="text-[10px] text-stone-400">({star.element})</span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-stone-700 p-2 text-xs italic text-stone-400">
                Cung Vô Chính Diệu — Cần mượn khí từ Cung {oppositePalace.name} ({oppositePalace.stem} {oppositePalace.branch}) chiếu về.
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
            Phụ Tinh Đồng Độ
          </h4>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {displayedMinorStars.map((star) => (
              <span
                key={star.name}
                className={`rounded px-2 py-0.5 ${
                  star.category === 'good'
                    ? 'border border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                    : 'border border-stone-700 bg-slate-800/60 text-stone-300'
                }`}
              >
                {star.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tam Phương Tứ Chính */}
      <div className="rounded-xl border border-amber-900/20 bg-slate-950/60 p-3 my-3">
        <h4 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1">
          <ShieldCheck size={14} /> Tam Phương Tứ Chính (Mạng lưới hội tụ)
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded border border-slate-800 bg-slate-900/70 p-2">
            <div className="text-[10px] text-stone-400">Đối Cung</div>
            <div className="font-semibold text-amber-200">{oppositePalace.name}</div>
            <div className="text-[10px] text-stone-400">{oppositePalace.stem} {oppositePalace.branch}</div>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/70 p-2">
            <div className="text-[10px] text-stone-400">Tam Hợp 1</div>
            <div className="font-semibold text-amber-200">{tamHop1.name}</div>
            <div className="text-[10px] text-stone-400">{tamHop1.stem} {tamHop1.branch}</div>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/70 p-2">
            <div className="text-[10px] text-stone-400">Tam Hợp 2</div>
            <div className="font-semibold text-amber-200">{tamHop2.name}</div>
            <div className="text-[10px] text-stone-400">{tamHop2.stem} {tamHop2.branch}</div>
          </div>
        </div>
      </div>

      {/* Phi Hóa Cung Vị */}
      <div className="my-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Khí Cơ Tứ Hóa Khâm Thiên
        </h4>
        {layers.showBirthYear && (
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-sky-200">Sinh Niên Can {chart.birthCanChi.year.stem}:</div>
            {natalTransformations.map((hua) => (
              <div key={hua.id} className="flex items-center justify-between rounded bg-sky-950/30 px-2 py-1 text-xs">
                <span className="font-medium text-sky-100">Hóa {hua.type} · {hua.star}</span>
                <span className="text-stone-400">Tọa {hua.palaceName}</span>
              </div>
            ))}
          </div>
        )}
        {/* Outgoing */}
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-stone-300 flex items-center gap-1">
            <ArrowUpRight size={13} className="text-emerald-400" />
            Can {palace.stem} phát sinh Phi Hóa:
          </div>
          {visibleOutgoing.map((flow) => (
            <div
              key={flow.id}
              className="flex items-center justify-between rounded bg-slate-800/60 px-2 py-1 text-xs"
            >
              <span className="font-medium text-amber-200">
                Hóa {flow.type} ({flow.star})
              </span>
              <span className="text-stone-400">{flow.mode === 'ly_tam' ? 'Ly Tâm ↗' : `→ ${flow.targetPalaceName}${flow.mode === 'huong_tam' ? ' · Hướng Tâm' : ''}`}</span>
            </div>
          ))}
        </div>
        {visibleIncoming.length > 0 && (
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-sky-200 flex items-center gap-1"><ArrowDownLeft size={13} /> Hóa nhập cung:</div>
            {visibleIncoming.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between rounded bg-slate-800/60 px-2 py-1 text-xs">
                <span className="font-medium text-sky-100">Hóa {flow.type} ({flow.star})</span>
                <span className="text-stone-400">{flow.mode === 'huong_tam' ? 'Hướng Tâm · ' : ''}từ {flow.sourcePalaceName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ask Copilot CTA */}
      <button
        onClick={handleAskCopilot}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600/40 via-amber-500/50 to-amber-600/40 p-2.5 text-xs font-semibold text-amber-100 hover:from-amber-600/60 hover:to-amber-500/60 transition shadow-lg"
      >
        <Sparkles size={14} className="text-amber-300" />
        Hỏi AI Thiên Cơ Luận Giải Cung Này
      </button>
    </aside>
  );
};
