import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getYearCanChi } from '../../domain/lunarCalendar';
import { getAnnualTransformations } from '../../domain/tuHoaEngine';
import { Calendar, Compass, Sparkles, ArrowRight } from 'lucide-react';

export const VanHanView: React.FC = () => {
  const { activeChart, updateForecastYear, sendMessageToThienCo, navigateTo } = useApp();
  const [selectedYear, setSelectedYear] = useState(activeChart.forecastYear);
  useEffect(() => setSelectedYear(activeChart.forecastYear), [activeChart.forecastYear]);

  const birthYear = activeChart.lunarDate.year;
  const currentAge = selectedYear - birthYear + 1;
  const yearCanChi = getYearCanChi(selectedYear);
  const annualTransformations = getAnnualTransformations(activeChart, selectedYear, 'kham_thien');

  // Tìm Đại Hạn tương ứng tuổi này
  const decadePalace = activeChart.palaces.find(
    (p) => currentAge >= p.decade.startAge && currentAge <= p.decade.endAge
  );

  // Tiểu hạn tuổi
  const annualPalace = activeChart.palaces.find((p) => p.annualAge === (currentAge % 12 || 12));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar size={18} />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Vận Trình Khảo Sát
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Theo dõi dòng chảy thời gian từ Đại Hạn 10 năm đến Lưu Niên và Nguyệt Hạn của {activeChart.name}.
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Chọn năm xem:</span>
          <div className="flex items-center gap-1 rounded-xl border border-amber-900/40 bg-slate-900 p-1 text-xs">
            {[2025, 2026, 2027, 2028].filter((year) => year >= birthYear).map((y) => (
              <button
                key={y}
                onClick={() => { setSelectedYear(y); updateForecastYear(y); }}
                className={`rounded-lg px-3 py-1 font-semibold transition ${
                  selectedYear === y
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Highlights for the Selected Year */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Year & Age Overview */}
        <div className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5 shadow-xl">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block mb-1">
            Thời Vận Hàng Năm
          </span>
          <h2 className="font-serif text-2xl font-bold text-amber-100">
            Năm {selectedYear} ({yearCanChi.stem} {yearCanChi.branch})
          </h2>
          <div className="mt-3 space-y-2 text-xs text-stone-300">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-stone-400">Tuổi Đương Số (tuổi mụ):</span>
              <strong className="text-amber-300">{currentAge} tuổi</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-stone-400">Cung vị Tiểu Hạn:</span>
              <strong className="text-emerald-300">Cung {annualPalace?.name || 'Tài Bạch'}</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-stone-400">Phương vị địa chi:</span>
              <span>{annualPalace?.branch}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Current 10-Year Major Cycle */}
        <div className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5 shadow-xl">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block mb-1">
            Đại Hạn 10 Năm Quản Lý
          </span>
          <h2 className="font-serif text-2xl font-bold text-amber-100">
            Cung {decadePalace?.name || 'Mệnh'}
          </h2>
          <div className="mt-3 space-y-2 text-xs text-stone-300">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-stone-400">Khung độ tuổi:</span>
              <strong className="text-amber-300">{decadePalace?.decade.startAge} – {decadePalace?.decade.endAge} tuổi</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-stone-400">Can Chi cung quản lý:</span>
              <span>{decadePalace?.stem} {decadePalace?.branch}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-stone-400">Chính tinh tọa thủ:</span>
              <span className="text-amber-200">{decadePalace?.majorStars.map((s) => s.name).join(', ') || 'Vô chính diệu'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Annual Four Transformations */}
        <div className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5 shadow-xl">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block mb-1">
            Tứ Hóa Lưu Niên {yearCanChi.stem} {yearCanChi.branch}
          </span>
          <h2 className="font-serif text-lg font-bold text-amber-100 mb-2">
            Can {yearCanChi.stem} Phát Động
          </h2>
          <div className="space-y-1.5 text-xs">
            {annualTransformations.map((t) => (
              <div key={t.type} className="flex justify-between rounded bg-slate-800/60 px-2 py-1">
                <span className="font-semibold text-amber-300">Hóa {t.type} ({t.star})</span>
                <span className="text-stone-300">→ Cung {t.palaceName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10-Year Major Decades Timeline */}
      <section className="mb-10 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl">
        <h3 className="font-serif text-lg font-bold text-amber-200 mb-4">
          Chu Kỳ Đại Hạn Suốt Cuộc Đời
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {activeChart.palaces.map((p) => {
            const isCurrent = currentAge >= p.decade.startAge && currentAge <= p.decade.endAge;
            return (
              <div
                key={p.index}
                className={`rounded-xl border p-3 text-xs transition ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-950/40 shadow-lg'
                    : 'border-slate-800 bg-slate-950/60 text-stone-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-serif font-bold text-amber-200">{p.name}</span>
                  {isCurrent && (
                    <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-300">
                      HIỆN TẠI
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-stone-300">
                  {p.decade.startAge}–{p.decade.endAge} tuổi
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Phương {p.branch} ({p.stem})
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ask Copilot for Yearly Analysis */}
      <div className="rounded-2xl border border-amber-900/30 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-100">
            Hỏi Thiên Cơ Về Toàn Cảnh Vận Trình Năm {selectedYear}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Bóc tách biến động tài lộc, sự nghiệp và nhân duyên theo thời hạn cụ thể.
          </p>
        </div>
        <button
          onClick={() => {
            sendMessageToThienCo(`Hãy phân tích toàn diện vận trình năm ${selectedYear} (${yearCanChi.stem} ${yearCanChi.branch}) cho đương số ${activeChart.name}, bao gồm Đại hạn, Lưu niên và Tứ Hóa phát động.`);
            navigateTo('/thien-co');
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-500 hover:to-amber-400 transition shadow-lg whitespace-nowrap"
        >
          <Sparkles size={15} />
          <span>Luận Giải Vận Năm {selectedYear}</span>
        </button>
      </div>
    </div>
  );
};
