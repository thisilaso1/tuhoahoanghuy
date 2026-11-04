import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SealStamp } from '../common/SealStamp';
import { Sparkles, Compass, Grid, Layers, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigateTo, sendMessageToThienCo, activeChart } = useApp();
  const [heroPrompt, setHeroPrompt] = useState('');

  const suggestedPrompts = [
    'Luận giải lá số của tôi',
    'Xem vận trình năm 2026 Bính Ngọ',
    'Phân tích cung Phu Thê',
    'Khám phá Khâm Thiên Tứ Hóa',
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim()) return;
    sendMessageToThienCo(heroPrompt);
    navigateTo('/thien-co');
  };

  const handleSelectSuggested = (prompt: string) => {
    sendMessageToThienCo(prompt);
    navigateTo('/thien-co');
  };

  return (
    <div className="relative w-full">
      {/* Cinematic Hero Section - Styled after the Scholar & Moon Pavilion */}
      <section className="relative min-h-[90vh] overflow-hidden border-b border-amber-900/30 flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8 text-center">
        {/* Background Image: Scholar reading under the window with the moon */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/art/scholar-moon.jpg')" }}
        />
        {/* Deep Cinematic Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/70" />
        <div className="absolute inset-0 -z-10 bg-radial-gradient from-transparent via-slate-950/60 to-slate-950" />

        {/* Traditional Seal Stamp */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <SealStamp text="懷月閣" subtext="欽天" size="lg" />
        </div>

        {/* Hero Headings */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/90 font-medium">
            TỬ VI ĐẨU SỐ · KHÂM THIÊN TỨ HÓA · CHU DỊCH LỤC HÀO
          </p>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-amber-100 drop-shadow-2xl">
            HOÀI NGUYỆT CÁC
          </h1>

          <div className="font-cjk text-2xl sm:text-3xl text-amber-300/85 tracking-[0.25em]">
            懷月閣
          </div>

          <div className="border-y border-amber-500/20 py-3 my-4 max-w-xl mx-auto">
            <p className="font-serif italic text-base sm:text-lg text-amber-200/95 leading-relaxed">
              "Nguyệt hữu âm tình viên khuyết.
              <br />
              Nhân sinh tự hữu định số."
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Chiêm nghiệm thiên mệnh, thấu hiểu nhân duyên.
            <br />
            Nơi cổ học phương Đông hội ngộ trí tuệ nhân tạo thế hệ 2026.
          </p>
        </div>

        {/* Intelligent Hero Prompt Box */}
        <div className="mt-8 w-full max-w-2xl">
          <form
            onSubmit={handleHeroSubmit}
            className="relative flex items-center rounded-2xl border border-amber-500/50 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20"
          >
            <input
              type="text"
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              placeholder="Hôm nay, điều gì khiến bạn muốn hỏi thiên mệnh?..."
              className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-amber-100 placeholder-stone-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:from-amber-500 hover:to-amber-400 transition whitespace-nowrap"
            >
              <Sparkles size={14} />
              <span>Hỏi Thiên Cơ</span>
            </button>
          </form>

          {/* Suggested Prompts */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-stone-400 font-medium">Gợi ý chiêm bái:</span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggested(p)}
                className="rounded-full border border-amber-900/40 bg-slate-900/70 px-3 py-1 text-[11px] text-amber-300/90 hover:border-amber-500/60 hover:bg-slate-800 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigateTo('/menh-ban')}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-7 py-3 text-xs font-bold text-slate-950 shadow-xl hover:from-amber-500 hover:to-amber-400 transition transform hover:-translate-y-0.5"
          >
            <Grid size={15} />
            <span>Khám phá mệnh bàn ({activeChart.name})</span>
          </button>
          <button
            onClick={() => navigateTo('/thien-co')}
            className="flex items-center gap-2 rounded-full border border-amber-500/50 bg-slate-900/90 px-7 py-3 text-xs font-semibold text-amber-200 hover:bg-slate-800 hover:text-amber-100 transition shadow-lg"
          >
            <Sparkles size={15} />
            <span>Đối thoại cùng Thiên Cơ</span>
          </button>
          <button
            onClick={() => navigateTo('/la-so')}
            className="flex items-center gap-2 rounded-full border border-stone-700 bg-slate-900/50 px-5 py-3 text-xs font-medium text-stone-300 hover:bg-slate-800 transition"
          >
            + Lập lá số mới
          </button>
        </div>
      </section>

      {/* The Scholar's Ethos Story (Inspired by Image 2) */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-amber-900/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            {/* Image Preview with ancient frame */}
            <div className="md:col-span-2 relative group">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-2xl aspect-[4/3]">
                <img
                  src="/art/scholar-moon.jpg"
                  alt="Văn nhân Hoài Nguyệt Các đọc sách dưới trăng"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 text-[10px] text-amber-300/90 font-serif italic text-center">
                  "Độc tọa nguyệt hạ, quan sát càn khôn biến dịch."
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="md:col-span-3 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Câu Chuyện Hoài Nguyệt Các
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
                Đạo Tri Mệnh Của Bậc Văn Nhân
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Hoài Nguyệt Các lấy cảm hứng từ một văn nhân từng kinh qua muôn vàn biến thiên của thế thái nhân tình. Rời xa chốn phồn hoa trục lợi, người quay về bên khung cửa sổ ngập tràn ánh trăng khuya, bên cuốn cổ thư và ngọn nến trầm để thấu suốt bản đồ số phận.
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Học thuyết chiêm tinh tại đây không dạy con người cam chịu hay phán quyết sợ hãi, mà chỉ ra cội nguồn của định mệnh để tự cường tu dưỡng:
              </p>
              <blockquote className="border-l-2 border-amber-500/60 pl-3 py-1 text-xs sm:text-sm italic text-amber-300 font-serif">
                "Tri thiên mệnh bất vi sợ hãi, tri kỷ giả bất oán nhân sinh."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h3 className="font-serif text-2xl font-bold text-amber-100">
            Hệ Thống Tinh Hoa Học Thuật
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Bốn phân hệ cốt lõi hòa quyện hoàn hảo giữa cổ học và công nghệ 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div
            onClick={() => navigateTo('/menh-ban')}
            className="group cursor-pointer rounded-2xl border border-amber-900/30 bg-slate-900/70 p-5 shadow-lg transition hover:border-amber-500/50 hover:bg-slate-900"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Grid size={20} />
            </div>
            <h4 className="font-serif text-base font-bold text-amber-200 group-hover:text-amber-100">
              Tử Vi Đẩu Số 12 Cung
            </h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Mệnh bàn hoàn chỉnh với 14 chính diệu, hệ thống phụ tinh, an vị Cục và đại hạn 10 năm theo thuật toán chuẩn mực.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
              Mở mệnh bàn <ArrowRight size={12} />
            </span>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigateTo('/tu-hoa')}
            className="group cursor-pointer rounded-2xl border border-amber-900/30 bg-slate-900/70 p-5 shadow-lg transition hover:border-amber-500/50 hover:bg-slate-900"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Layers size={20} />
            </div>
            <h4 className="font-serif text-base font-bold text-amber-200 group-hover:text-amber-100">
              Khâm Thiên Tứ Hóa
            </h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Khám phá Lộc · Quyền · Khoa · Kỵ, đường đi của Phi Tinh và hiện tượng Tự Hóa Ly Tâm & Hướng Tâm vi diệu.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              Quan sát phi hóa <ArrowRight size={12} />
            </span>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigateTo('/kinh-dich')}
            className="group cursor-pointer rounded-2xl border border-amber-900/30 bg-slate-900/70 p-5 shadow-lg transition hover:border-amber-500/50 hover:bg-slate-900"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-600/30 bg-amber-600/10 text-amber-400">
              <Compass size={20} />
            </div>
            <h4 className="font-serif text-base font-bold text-amber-200 group-hover:text-amber-100">
              Kinh Dịch & Lục Hào
            </h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Không gian gieo 3 đồng xu cổ, 64 quẻ dịch, hào động biến hóa, Thế Ứng và lời dạy tu thân của bậc hiền triết.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
              Gieo quẻ vấn bốc <ArrowRight size={12} />
            </span>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => navigateTo('/thien-co')}
            className="group cursor-pointer rounded-2xl border border-amber-900/30 bg-slate-900/70 p-5 shadow-lg transition hover:border-amber-500/50 hover:bg-slate-900"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300">
              <Sparkles size={20} />
            </div>
            <h4 className="font-serif text-base font-bold text-amber-200 group-hover:text-amber-100">
              AI Thiên Cơ Copilot
            </h4>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Trợ lý đối thoại tiếng Việt thông minh, gọi công cụ tất định, giải thích minh bạch và tạo widget động tức thì.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-sky-400">
              Trò chuyện ngay <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
