import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Hexagram } from '../../domain/types';
import { generateHexagramFromTosses, tossCoins } from '../../domain/kinhDichEngine';
import { Compass, Sparkles, RotateCcw, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const KinhDichView: React.FC = () => {
  const { sendMessageToThienCo, navigateTo, activeChart } = useApp();
  const [question, setQuestion] = useState('Định hướng công danh và sự nghiệp thời gian tới');
  const [lines, setLines] = useState<number[]>([7, 8, 7, 9, 8, 7]); // Mặc định 6 hào
  const [currentTossStep, setCurrentTossStep] = useState(0); // 0 to 6
  const [activeHexagram, setActiveHexagram] = useState<Hexagram>(() =>
    generateHexagramFromTosses([7, 8, 7, 9, 8, 7], activeChart.birthCanChi.day.stem)
  );
  const [isTossingAnimation, setIsTossingAnimation] = useState(false);
  const [recentCoins, setRecentCoins] = useState<[number, number, number]>([3, 2, 2]);

  // Gieo từng hào (1 đến 6 từ dưới lên)
  const handleTossSingleLine = () => {
    if (currentTossStep >= 6) {
      // Đã đủ 6 hào, reset để gieo lại
      setCurrentTossStep(0);
      setLines([]);
      return;
    }

    setIsTossingAnimation(true);
    setTimeout(() => {
      const { coins, sum } = tossCoins();
      setRecentCoins(coins);
      const newLines = [...lines.slice(0, currentTossStep), sum];
      setLines(newLines);
      const nextStep = currentTossStep + 1;
      setCurrentTossStep(nextStep);
      setIsTossingAnimation(false);

      if (nextStep === 6) {
        const hex = generateHexagramFromTosses(newLines, activeChart.birthCanChi.day.stem);
        setActiveHexagram(hex);
      }
    }, 450);
  };

  // Gieo nhanh đủ 6 hào
  const handleFastTossAll = () => {
    setIsTossingAnimation(true);
    setTimeout(() => {
      const allLines = Array.from({ length: 6 }, () => tossCoins().sum);
      setLines(allLines);
      setCurrentTossStep(6);
      const hex = generateHexagramFromTosses(allLines, activeChart.birthCanChi.day.stem);
      setActiveHexagram(hex);
      setIsTossingAnimation(false);
    }, 300);
  };

  const handleAskCopilot = () => {
    sendMessageToThienCo(
      `Tôi vừa gieo được quẻ Kinh Dịch: ${activeHexagram.vietnameseName} (${activeHexagram.chineseName})${
        activeHexagram.transformedHexagram
          ? `, biến sang quẻ ${activeHexagram.transformedHexagram.vietnameseName}`
          : ''
      }. Chủ đề thắc mắc: "${question}". Xin hãy luận giải chi tiết ý nghĩa Thế Ứng, Lục Thân và lời khuyên xử thế.`
    );
    navigateTo('/thien-co');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
          Chu Dịch Chính Tông · Dã Hạc Bốc Pháp
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mt-1">
          Kinh Dịch & Lục Hào Chiêm Bái
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-xl mx-auto">
          "Dịch dữ thiên địa chuẩn, cố năng di luân thiên địa chi đạo." Giữ tâm an định, giao cảm cùng trời đất để thấu suốt sự việc.
        </p>
      </div>

      {/* Seeker Question Input */}
      <div className="mb-8 rounded-2xl border border-amber-900/30 bg-slate-900/90 p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          Điều Quý Vị Muốn Chiêm Nghiệm (Chủ đề quẻ)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Công việc năm 2026, đối tác hợp tác, thi cử..."
            className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-4 py-2 text-xs sm:text-sm text-amber-100 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleFastTossAll}
            disabled={isTossingAnimation}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:from-amber-500 hover:to-amber-400 transition whitespace-nowrap shadow-md"
          >
            <Compass size={15} />
            <span>Gieo Quẻ Toàn Phần</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Coin Casting Chamber */}
        <div className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl flex flex-col items-center justify-between text-center">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Đài Gieo Đồng Xu Cổ
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Ba đồng tiền đồng cổ: Mặt Chữ (Dương = 3), Mặt Lưng (Âm = 2)
            </p>
          </div>

          {/* 3 Animated Coins */}
          <div className="my-8 flex items-center justify-center gap-4">
            {recentCoins.map((val, i) => (
              <div
                key={i}
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/80 bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 font-serif text-xs font-bold text-slate-950 shadow-xl transition-all duration-300 ${
                  isTossingAnimation ? 'scale-110 rotate-180 animate-bounce' : 'scale-100'
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded border border-amber-800 bg-slate-900 text-[10px] text-amber-300">
                  {val === 3 ? '乾' : '坤'}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full space-y-3">
            <div className="text-xs text-stone-300">
              Tiến trình gieo: <strong className="text-amber-300">{currentTossStep}/6 hào</strong>
            </div>

            <button
              onClick={handleTossSingleLine}
              disabled={isTossingAnimation}
              className="w-full rounded-xl bg-amber-600/30 border border-amber-500/40 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-600/50 transition"
            >
              {currentTossStep >= 6 ? 'Khởi động gieo lại từ đầu' : `Gieo Hào Thứ ${currentTossStep + 1}`}
            </button>
          </div>
        </div>

        {/* Hexagram Display Canvas (2 cols) */}
        <div className="rounded-2xl border border-amber-900/30 bg-slate-900/90 p-6 shadow-xl lg:col-span-2 space-y-6">
          {/* Hexagram Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-900/20 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-cjk text-3xl font-bold text-amber-300">
                  {activeHexagram.chineseName}
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-amber-100">
                    {activeHexagram.vietnameseName}
                  </h2>
                  <div className="text-xs text-stone-400">
                    Thượng quái: <strong className="text-amber-300">{activeHexagram.upperTrigram}</strong> · Hạ quái: <strong className="text-amber-300">{activeHexagram.lowerTrigram}</strong>
                  </div>
                </div>
              </div>
            </div>

            {activeHexagram.transformedHexagram && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs">
                <span className="text-stone-400">Biến sang: </span>
                <strong className="text-amber-200">{activeHexagram.transformedHexagram.vietnameseName}</strong>
              </div>
            )}
          </div>

          {/* 6 Lines Visual Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            {[...activeHexagram.lines].reverse().map((line) => {
              const isYang = line.yinYang === 'yang';
              return (
                <div
                  key={line.lineIndex}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-900"
                >
                  <span className="w-14 text-stone-400 font-serif">Hào {line.lineIndex}</span>

                  {/* Line Visual */}
                  <div className="flex-1 max-w-[220px] px-2 text-center">
                    {isYang ? (
                      <div className="h-2 rounded bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                    ) : (
                      <div className="flex justify-between">
                        <div className="h-2 w-[45%] rounded bg-amber-400/80" />
                        <div className="h-2 w-[45%] rounded bg-amber-400/80" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-stone-300 w-24 text-right">
                      {line.kinship} ({line.element})
                    </span>
                    <span className="text-stone-400 w-20">{line.beast}</span>
                    <div className="w-14 text-right">
                      {line.isThe && <span className="rounded bg-amber-500/20 px-1 text-[10px] text-amber-300">THẾ</span>}
                      {line.isUng && <span className="rounded bg-sky-500/20 px-1 text-[10px] text-sky-300">ỨNG</span>}
                      {line.isMoving && <span className="rounded bg-rose-500/20 px-1 text-[10px] text-rose-300 font-bold">ĐỘNG</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classical Judgments */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="rounded-xl border border-amber-900/20 bg-slate-950/50 p-3.5">
              <h4 className="font-serif font-bold text-amber-300 mb-1">Thoán Từ (Lời Thoán của Chu Văn Vương)</h4>
              <p className="italic text-amber-100/90">{activeHexagram.judgment}</p>
            </div>

            <div className="rounded-xl border border-amber-900/20 bg-slate-950/50 p-3.5">
              <h4 className="font-serif font-bold text-amber-300 mb-1">Đại Tượng Truyện (Lời Tượng của Đức Khổng Tử)</h4>
              <p className="text-stone-300">{activeHexagram.image}</p>
            </div>

            <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-3.5">
              <h4 className="font-serif font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Lời Khuyên Hành Đạo Của Bậc Quân Tử
              </h4>
              <p className="text-emerald-100/90">{activeHexagram.scholarlyAdvice}</p>
            </div>
          </div>

          {/* Copilot Deep Insight CTA */}
          <button
            onClick={handleAskCopilot}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-3 text-xs font-bold text-slate-950 shadow-xl hover:from-amber-500 hover:to-amber-400 transition"
          >
            <Sparkles size={15} />
            <span>Thỉnh Giáo AI Thiên Cơ Luận Giải Quẻ Này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
