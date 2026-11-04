import React from 'react';
import { ChatWidget } from '../../ai/types';
import { useApp } from '../../context/AppContext';
import { Compass, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

interface ChatWidgetRendererProps {
  widget: ChatWidget;
}

export const ChatWidgetRenderer: React.FC<ChatWidgetRendererProps> = ({ widget }) => {
  const { setFocusedPalaceIndex, navigateTo } = useApp();

  switch (widget.type) {
    case 'palace_highlight': {
      const { palace, reason } = widget.data;
      return (
        <div className="my-3 overflow-hidden rounded-xl border border-amber-500/40 bg-slate-900/90 p-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                <Sparkles size={13} />
              </span>
              <div>
                <span className="font-serif font-bold text-amber-200">Cung {palace.name}</span>
                <span className="ml-1.5 text-xs text-amber-400">({palace.stem} {palace.branch})</span>
              </div>
            </div>
            <button
              onClick={() => {
                setFocusedPalaceIndex(palace.index);
                navigateTo('/menh-ban');
              }}
              className="flex items-center gap-1 rounded bg-amber-600/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-amber-600/40"
            >
              Xem trên mệnh bàn <ArrowRight size={12} />
            </button>
          </div>

          <div className="mt-2 text-xs text-stone-300">
            <p className="mb-1 text-stone-400">{reason}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {palace.majorStars.map((star) => (
                <span key={star.name} className="rounded bg-slate-800 px-2 py-0.5 text-amber-100 font-medium">
                  {star.name} ({star.brightness})
                </span>
              ))}
              {palace.majorStars.length === 0 && (
                <span className="italic text-stone-500">Vô chính diệu</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'transformation_flow': {
      const { flow, significance } = widget.data;
      return (
        <div className="my-3 rounded-xl border border-emerald-600/30 bg-slate-900/90 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
            <Layers size={14} /> Khí Cơ Phi Hóa: Cung {flow.sourcePalaceName} → Cung {flow.targetPalaceName}
          </div>
          <div className="flex items-center gap-2 font-serif text-amber-200 my-1">
            <span>Can {flow.sourceStem}</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-sans font-bold text-emerald-300">
              Hóa {flow.type}
            </span>
            <span>ngự sao {flow.star}</span>
          </div>
          <p className="text-stone-300 mt-1">{significance}</p>
        </div>
      );
    }

    case 'hexagram_card': {
      const { hexagram, question } = widget.data;
      return (
        <div className="my-3 rounded-xl border border-amber-600/40 bg-slate-900/95 p-3.5">
          <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-cjk text-lg text-amber-300">{hexagram.chineseName}</span>
              <div>
                <h4 className="font-serif font-bold text-amber-100">{hexagram.vietnameseName}</h4>
                <div className="text-[10px] text-stone-400">Thượng {hexagram.upperTrigram} · Hạ {hexagram.lowerTrigram}</div>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/kinh-dich')}
              className="rounded bg-amber-600/20 px-2 py-1 text-[11px] text-amber-300 hover:bg-amber-600/30"
            >
              Không gian Kinh Dịch
            </button>
          </div>

          <div className="my-2 space-y-1 text-xs">
            <p className="italic text-amber-200/90">"{hexagram.judgment}"</p>
            <p className="text-stone-300 text-[11px] leading-relaxed">{hexagram.scholarlyAdvice}</p>
          </div>

          {/* Lines Preview */}
          <div className="mt-2 space-y-1 border-t border-slate-800 pt-2">
            {[...hexagram.lines].reverse().map((line) => (
              <div key={line.lineIndex} className="flex items-center justify-between text-[10px]">
                <span className="w-12 text-stone-400">Hào {line.lineIndex}:</span>
                <span className="font-mono text-amber-300 tracking-widest">
                  {line.yinYang === 'yang' ? '━━━━━━━' : '━━━ ━━━'}
                </span>
                <span className="text-stone-400">{line.kinship} ({line.element})</span>
                {line.isMoving && <span className="text-rose-400 font-bold">● Động</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'fortune_timeline': {
      const { currentDecade, annualForecast, annualTransformations } = widget.data;
      return (
        <div className="my-3 rounded-xl border border-amber-700/30 bg-slate-900/90 p-3 text-xs">
          <div className="font-serif text-sm font-bold text-amber-200 mb-2 flex items-center gap-1.5">
            <Compass size={14} className="text-amber-400" /> Vận Trình {annualForecast.year} ({annualForecast.canChi})
          </div>
          <div className="grid grid-cols-2 gap-2 text-stone-300 mb-2">
            <div className="rounded bg-slate-800/60 p-2">
              <span className="text-[10px] text-stone-400 block">Đại Hạn 10 năm</span>
              <strong className="text-amber-200">Cung {currentDecade.palaceName}</strong> ({currentDecade.startAge}–{currentDecade.endAge} tuổi)
            </div>
            <div className="rounded bg-slate-800/60 p-2">
              <span className="text-[10px] text-stone-400 block">Lưu Niên Tiểu Hạn</span>
              <strong className="text-emerald-300">Cung {annualForecast.keyPalace}</strong> ({annualForecast.year})
            </div>
          </div>
          <div className="border-t border-slate-800 pt-1.5">
            <div className="text-[10px] uppercase text-stone-400 mb-1">Tứ Hóa Lưu Niên {annualForecast.canChi}:</div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {annualTransformations.map((t) => (
                <span key={t.type} className="rounded bg-slate-800 px-2 py-0.5">
                  <b className="text-amber-300">{t.type}</b>: {t.star} ({t.palaceName})
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'trace_panel': {
      const { traces, methodology } = widget.data;
      return (
        <div className="my-3 rounded-xl border border-stone-800 bg-slate-950/80 p-3 text-xs font-mono">
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-sans">
              <ShieldCheck size={13} /> {methodology}
            </span>
            <span className="text-[10px] text-emerald-400 font-sans">Toán học tất định ✓</span>
          </div>
          <div className="space-y-1 text-[10px] text-stone-400">
            {traces.map((trace, i) => (
              <div key={i} className="flex justify-between border-b border-slate-900 pb-0.5">
                <span className="text-amber-300/80">{trace.toolName}()</span>
                <span>{trace.executionTimeMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
