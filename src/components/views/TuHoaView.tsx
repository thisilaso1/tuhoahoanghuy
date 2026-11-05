import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { STEMS, TransformationType } from '../../domain/types';
import {
  calculateAllFlyingTransformations,
  getTuHoaRules,
  TU_HOA_KHAM_THIEN,
  TU_HOA_NAM_PHAI,
  TuHoaSchool,
} from '../../domain/tuHoaEngine';
import { Layers, ArrowRight, Sparkles, Filter } from 'lucide-react';

const FOUR_HUA = [
  { symbol: 'A', name: 'Hóa Lộc', color: 'text-emerald-300', description: 'Duyên kết nối, nguồn lực và cơ hội. Xem sao mang Lộc và cung tiếp nhận để biết lĩnh vực được chú ý.' },
  { symbol: 'B', name: 'Hóa Quyền', color: 'text-amber-300', description: 'Quyền chủ động, sức thúc đẩy và trách nhiệm. Có thể biểu hiện qua việc đứng ra quyết định hoặc gánh thêm việc.' },
  { symbol: 'C', name: 'Hóa Khoa', color: 'text-sky-300', description: 'Học hỏi, danh tiếng, sự hỗ trợ và khả năng tháo gỡ. Đọc cùng tính chất của sao và cung liên quan.' },
  { symbol: 'D', name: 'Hóa Kỵ', color: 'text-rose-300', description: 'Điểm vướng mắc, bận tâm hoặc ràng buộc. Cần xem hoàn cảnh của cung và các Hóa đi cùng trước khi luận.' },
];

export const TuHoaView: React.FC = () => {
  const { activeChart, authenticatedUser } = useApp();
  const [selectedSchool, setSelectedSchool] = useState<TuHoaSchool>('kham_thien');
  const [filterType, setFilterType] = useState<TransformationType | 'all'>('all');
  const [selectedPalaceFilter, setSelectedPalaceFilter] = useState<number | 'all'>('all');

  const rules = getTuHoaRules(selectedSchool);
  const flyingTransformations = authenticatedUser ? calculateAllFlyingTransformations(activeChart, selectedSchool) : [];

  const filteredFlying = flyingTransformations.filter((f) => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (selectedPalaceFilter !== 'all' && f.sourcePalaceIndex !== selectedPalaceFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers size={18} />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Khâm Thiên Tứ Hóa Bí Cung
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Khảo sát 4 đầu mối biến dịch: Lộc (A) · Quyền (B) · Khoa (C) · Kỵ (D) và mạng lưới Phi Tinh, Tự Hóa.
          </p>
        </div>

        {/* School Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Môn phái:</span>
          <div className="rounded-xl border border-amber-900/40 bg-slate-900 p-1 flex text-xs">
            <button
              onClick={() => setSelectedSchool('kham_thien')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                selectedSchool === 'kham_thien'
                  ? 'bg-amber-600 text-slate-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Bắc Phái Khâm Thiên
            </button>
            <button
              onClick={() => setSelectedSchool('nam_phai')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                selectedSchool === 'nam_phai'
                  ? 'bg-amber-600 text-slate-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tử Vi Toàn Thư (Nam Phái)
            </button>
          </div>
        </div>
      </div>

      <section className="mb-10 space-y-4 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5" aria-labelledby="tu-hoa-guide">
        <div>
          <h2 id="tu-hoa-guide" className="font-serif text-lg font-bold text-amber-200">Kiến thức về bộ bốn Tứ Hóa</h2>
          <p className="mt-1 text-sm text-stone-300">
            Lộc, Quyền, Khoa và Kỵ là bốn tính chất gắn với các sao. Để đọc một Hóa, hãy xác định Thiên Can dùng để tra bảng, sao mang Hóa và cung nơi sao đó tọa.
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FOUR_HUA.map(({ symbol, name, color, description }) => (
            <div key={symbol} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <dt className={`font-semibold ${color}`}>{symbol} · {name}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-stone-300">{description}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-4 border-t border-amber-900/30 pt-4 sm:grid-cols-2">
          <article>
            <h3 className="font-semibold text-amber-200">Tứ Hóa năm sinh · Sinh niên</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-300">
              Lấy Can năm sinh để tra bốn sao mang Lộc, Quyền, Khoa, Kỵ. Đây là lớp nguyên cục của đương số. Đổi năm xem vẫn giữ các vị trí này.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-amber-200">Tứ Hóa lưu niên · Năm đang xem</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-300">
              Lấy Can năm âm lịch đang xem để tra bốn sao mang Hóa rồi tìm cung có các sao ấy trên lá số gốc. Đây là lớp theo năm, nên đổi năm xem có thể đổi sao và cung được kích hoạt.
            </p>
          </article>
        </div>
        <article className="border-t border-amber-900/30 pt-4">
          <h3 className="font-semibold text-amber-200">Phi Hóa từ một cung</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-300">
            Khi đọc đường Phi Hóa, lấy Can của cung xuất phát để tra sao mang Hóa, rồi lần đến cung có sao đó. Theo cách hiển thị của lá số, sao nằm ngay cung xuất phát là Tự Hóa Ly Tâm, còn sao ở đối cung là Tự Hóa Hướng Tâm. Bảng khảo sát bên dưới cho phép lọc theo cung xuất phát và từng loại Hóa.
          </p>
        </article>
      </section>

      {/* Canonical Table: 10 Heavenly Stems */}
      <section className="mb-10 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-amber-900/20 pb-3 mb-4">
          <h2 className="font-serif text-lg font-bold text-amber-200">
            Bảng Quy Tắc Tứ Hóa Thập Thiên Can
          </h2>
          <span className="text-xs text-stone-400">
            {selectedSchool === 'kham_thien' ? 'Chuẩn mực Khâm Thiên Môn (Can Canh: Nhật Vũ Âm Đồng)' : 'Chuẩn mực Toàn Thư (Can Canh: Nhật Vũ Đồng Âm)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Thiên Can</th>
                <th className="py-2.5 px-3 text-emerald-400">A · Hóa Lộc</th>
                <th className="py-2.5 px-3 text-amber-400">B · Hóa Quyền</th>
                <th className="py-2.5 px-3 text-blue-800">C · Hóa Khoa</th>
                <th className="py-2.5 px-3 text-rose-400">D · Hóa Kỵ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {STEMS.map((stem) => {
                const isBirthStem = stem === activeChart.birthCanChi.year.stem;
                const isForecastStem = stem === activeChart.forecastCanChi.stem;
                return (
                  <tr
                    key={stem}
                    className={`transition ${
                      isBirthStem
                        ? 'bg-amber-600/20 font-semibold text-amber-100'
                        : isForecastStem
                        ? 'bg-emerald-600/15 text-emerald-100'
                        : 'hover:bg-slate-800/40 text-stone-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-serif font-bold flex items-center gap-1.5">
                      <span>{stem}</span>
                      {isBirthStem && (
                        <span className="rounded bg-amber-500/30 px-1.5 text-[9px] text-amber-300">
                          Năm sinh
                        </span>
                      )}
                      {isForecastStem && (
                        <span className="rounded bg-emerald-500/30 px-1.5 text-[9px] text-emerald-300">
                          Năm {activeChart.forecastYear}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">{rules[stem].Lộc}</td>
                    <td className="py-2 px-3">{rules[stem].Quyền}</td>
                    <td className="py-2 px-3">{rules[stem].Khoa}</td>
                    <td className="py-2 px-3">{rules[stem].Kỵ}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Flying & Self Transformation Explorer */}
      {authenticatedUser && <section className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-900/20 pb-4 mb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-amber-200">
              Khảo Sát Toàn Bộ Phi Hóa & Tự Hóa Trên Mệnh Bàn
            </h2>
            <p className="text-xs text-stone-400">
              Mỗi cung mang một Thiên Can khởi sinh 4 luồng phi hóa sang các cung khác.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Transformation Type */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs">
              {(['all', 'Lộc', 'Quyền', 'Khoa', 'Kỵ'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`rounded px-2.5 py-1 ${
                    filterType === t
                      ? 'bg-amber-600 text-slate-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t === 'all' ? 'Tất cả' : t}
                </button>
              ))}
            </div>

            {/* Filter by Source Palace */}
            <select
              value={selectedPalaceFilter}
              onChange={(e) =>
                setSelectedPalaceFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="rounded-lg border border-amber-900/40 bg-slate-950 px-2.5 py-1 text-xs text-amber-100 focus:outline-none"
            >
              <option value="all">Tất cả cung xuất phát</option>
              {activeChart.palaces.map((p) => (
                <option key={p.index} value={p.index}>
                  Cung {p.name} ({p.stem})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Transformations */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredFlying.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-3 text-xs transition ${
                item.mode === 'ly_tam'
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : item.mode === 'huong_tam'
                  ? 'border-sky-500/40 bg-sky-950/20'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-200">
                  {item.sourcePalaceName} ({item.sourceStem})
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    item.type === 'Lộc'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : item.type === 'Quyền'
                      ? 'bg-amber-500/20 text-amber-300'
                      : item.type === 'Khoa'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  Hóa {item.type} ({item.star})
                </span>
              </div>

              <div className="text-[11px] text-stone-300 flex items-center gap-1.5 my-1">
                <span>→ Nhập Cung:</span>
                <strong className="text-amber-100">{item.targetPalaceName}</strong>
                {item.mode === 'ly_tam' && (
                  <span className="rounded bg-amber-600/30 px-1 text-[9px] text-amber-300">
                    Tự Hóa Ly Tâm
                  </span>
                )}
                {item.mode === 'huong_tam' && (
                  <span className="rounded bg-sky-600/30 px-1 text-[9px] text-sky-300">
                    Tự Hóa Hướng Tâm
                  </span>
                )}
              </div>

              <p className="text-[10px] text-stone-400 mt-1 italic">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>}
    </div>
  );
};
