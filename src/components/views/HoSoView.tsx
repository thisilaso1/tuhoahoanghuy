import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Trash2, Plus, Download, Upload, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export const HoSoView: React.FC = () => {
  const {
    savedCharts,
    activeChart,
    selectChart,
    deleteChart,
    personalNotes,
    addPersonalNote,
    deletePersonalNote,
    navigateTo,
  } = useApp();

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [importNotice, setImportNotice] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;
    addPersonalNote(noteTitle, noteContent);
    setNoteTitle('');
    setNoteContent('');
    setShowAddNote(false);
  };

  const handleExportData = () => {
    const backupData = {
      charts: savedCharts,
      notes: personalNotes,
      exportedAt: new Date().toISOString(),
      app: 'Hoài Nguyệt Các 2026',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoai-nguyet-cac-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.charts && Array.isArray(json.charts)) {
          localStorage.setItem('hoai_nguyet_charts', JSON.stringify(json.charts));
          setImportNotice('Đã nhập dữ liệu thành công! Xin hãy tải lại trang để cập nhật.');
          window.location.reload();
        }
      } catch (err) {
        setImportNotice('Tệp sao lưu không hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <User size={18} />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Hồ Sơ & Bản Mệnh Cá Nhân
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Quản lý các mệnh bàn đã lưu, ghi chép nghiên cứu và kiểm soát dữ liệu riêng tư.
          </p>
        </div>

        {/* Data Export / Import Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-xl border border-amber-900/40 bg-slate-900 px-3 py-1.5 text-xs text-amber-200 hover:bg-slate-800 transition"
          >
            <Download size={13} />
            <span>Sao Lưu Dữ Liệu</span>
          </button>
          <label className="flex items-center gap-1.5 rounded-xl border border-amber-900/40 bg-slate-900 px-3 py-1.5 text-xs text-amber-200 hover:bg-slate-800 cursor-pointer transition">
            <Upload size={13} />
            <span>Nhập Sao Lưu</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>

      {importNotice && (
        <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300">
          {importNotice}
        </div>
      )}

      {/* Saved Charts Section */}
      <section className="mb-10 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-amber-900/20 pb-3 mb-4">
          <h2 className="font-serif text-lg font-bold text-amber-200">
            Danh Sách Mệnh Bàn ({savedCharts.length})
          </h2>
          <button
            onClick={() => navigateTo('/la-so')}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            <Plus size={14} /> Lập lá số mới
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {savedCharts.map((chart) => {
            const isActive = chart.id === activeChart.id;
            return (
              <div
                key={chart.id}
                className={`rounded-2xl border p-4 transition ${
                  isActive
                    ? 'border-amber-500/70 bg-amber-950/25 shadow-lg'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-amber-100 text-base">
                    {chart.name}
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      <CheckCircle size={11} /> ĐANG XEM
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-stone-400 mb-3">
                  <div>Sinh ngày: {chart.solarDate} ({chart.gender})</div>
                  <div>Năm Can Chi: <strong className="text-amber-200">{chart.birthCanChi.year.stem} {chart.birthCanChi.year.branch}</strong> ({chart.napAm})</div>
                  <div>Cục số: {chart.cuc.name}</div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
                  <button
                    onClick={() => {
                      selectChart(chart);
                      navigateTo('/menh-ban');
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Xem Mệnh Bàn →
                  </button>
                  {savedCharts.length > 1 && (
                    <button
                      onClick={() => deleteChart(chart.id)}
                      className="text-stone-500 hover:text-rose-400 transition"
                      title="Xóa lá số này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Personal Research Notes */}
      <section className="mb-10 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-amber-900/20 pb-3 mb-4">
          <h2 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <FileText size={16} className="text-amber-400" />
            Ghi Chép Chiêm Nghiệm Cá Nhân ({personalNotes.length})
          </h2>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            <Plus size={14} /> Thêm ghi chép mới
          </button>
        </div>

        {showAddNote && (
          <form onSubmit={handleAddNote} className="mb-6 rounded-xl border border-amber-900/40 bg-slate-950 p-4 space-y-3">
            <input
              type="text"
              placeholder="Tiêu đề ghi chép (ví dụ: Nghiệm lý hạn năm 2026)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-slate-900 px-3 py-1.5 text-xs text-amber-100 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Nội dung đúc kết hoặc phát hiện chiêm tinh..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-slate-900 px-3 py-1.5 text-xs text-amber-100 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddNote(false)}
                className="rounded-lg px-3 py-1 text-xs text-stone-400 hover:bg-slate-900"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-500"
              >
                Lưu Ghi Chép
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {personalNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-amber-200">
                  {note.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-stone-500">
                    {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button
                    onClick={() => deletePersonalNote(note.id)}
                    className="text-stone-500 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Guarantee Statement */}
      <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-5 text-xs text-emerald-200 leading-relaxed flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-emerald-300 font-semibold mb-0.5">Cam Kết Quyền Riêng Tư & An Toàn Bản Mệnh</strong>
          Mọi dữ liệu ngày giờ sinh và ghi chép cá nhân được lưu trữ trực tiếp trên trình duyệt của quý vị (Local Storage). Hoài Nguyệt Các không thu thập, bán hay chia sẻ thông tin lá số của quý vị cho bất kỳ bên thứ ba nào.
        </div>
      </div>
    </div>
  );
};
