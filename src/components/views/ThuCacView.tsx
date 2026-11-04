import React, { useState } from 'react';
import { CLASSICAL_ARTICLES, LEXICON_TERMS, ScholarlyArticle } from '../../domain/knowledgeBase';
import { BookOpen, Search, BookMarked, ArrowRight, X } from 'lucide-react';

export const ThuCacView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ScholarlyArticle | null>(null);

  const filteredArticles = CLASSICAL_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.keyConcepts.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTerms = LEXICON_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
          Tàng Kinh Các Cổ Học · Điển Tịch Đông Phương
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mt-1">
          Hoài Nguyệt Thư Các
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Tra cứu trước tác kinh điển của Hi Di Trần Đoàn, Khâm Thiên Môn và Chu Dịch Bốc Phổ.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8 mx-auto max-w-xl">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm thuật ngữ hoặc trước tác... (ví dụ: 'Tự hóa', 'Tam phương', 'Dụng thần')"
            className="w-full rounded-2xl border border-amber-900/40 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-amber-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Classical Articles Grid */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
          <BookMarked size={18} className="text-amber-400" />
          Trước Tác Kinh Điển
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="cursor-pointer rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5 shadow-lg transition hover:border-amber-500/50 hover:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] uppercase tracking-wider text-amber-500 mb-1">
                  {article.source}
                </div>
                <h3 className="font-serif text-base font-bold text-amber-100">
                  {article.title}
                </h3>
                {article.chineseTitle && (
                  <div className="font-cjk text-xs text-amber-400/80 mt-0.5">
                    {article.chineseTitle}
                  </div>
                )}
                <p className="mt-2 text-xs text-stone-400 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex flex-wrap gap-1">
                  {article.keyConcepts.slice(0, 2).map((k) => (
                    <span key={k} className="rounded bg-slate-800 px-1.5 py-0.5 text-stone-300">
                      #{k}
                    </span>
                  ))}
                </div>
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  Đọc tiếp <ArrowRight size={12} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Lexicon Dictionary */}
      <section className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl">
        <h2 className="font-serif text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-amber-400" />
          Từ Điển Thuật Ngữ Chiêm Tinh & Dịch Học ({filteredTerms.length})
        </h2>
        <div className="divide-y divide-slate-800/80">
          {filteredTerms.map((term) => (
            <div key={term.term} className="py-3.5 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-bold text-amber-100">
                    {term.term}
                  </h3>
                  <span className="font-cjk text-xs text-amber-400">({term.chinese})</span>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-stone-400">
                  {term.category}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {term.definition}
              </p>
              <div className="text-[11px] text-amber-300/80 italic pt-0.5">
                ✦ {term.scholarlyNote}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-amber-900/20 pb-3">
              <div>
                <span className="text-xs text-amber-500 font-semibold">{selectedArticle.source}</span>
                <h2 className="font-serif text-xl font-bold text-amber-100 mt-1">
                  {selectedArticle.title}
                </h2>
                {selectedArticle.chineseTitle && (
                  <div className="font-cjk text-xs text-amber-400 mt-0.5">
                    {selectedArticle.chineseTitle}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-slate-800 hover:text-stone-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              {selectedArticle.content}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl bg-amber-600/30 px-4 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-600/50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
