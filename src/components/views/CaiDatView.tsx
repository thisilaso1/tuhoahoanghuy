import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AISettings } from '../../ai/types';
import { Settings, Shield, Key, Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const CaiDatView: React.FC = () => {
  const { settings, updateSettings, clearChatHistory } = useApp();
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [saveNotice, setSaveNotice] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);
  };

  const handleWipeData = () => {
    localStorage.removeItem('hoai_nguyet_charts');
    localStorage.removeItem('hoai_nguyet_chat');
    localStorage.removeItem('hoai_nguyet_notes');
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
          Cấu Hình Hệ Thống · AI Native 2026
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mt-1">
          Cài Đặt & Quyền Riêng Tư
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-md mx-auto">
          Tự do lựa chọn nhà cung cấp AI, cấu hình API Key và tinh chỉnh trường phái chiêm tinh học.
        </p>
      </div>

      {saveNotice && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <CheckCircle size={15} />
          <span>Đã lưu cấu hình thành công!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* AI Provider Configuration */}
        <section className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-amber-900/20 pb-3 mb-5">
            <Key size={18} className="text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-amber-200">
              Nhà Cung Cấp AI Copilot
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
                Chế Độ Vận Hành AI
              </label>
              <select
                value={localSettings.provider}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, provider: e.target.value as AISettings['provider'] })
                }
                className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs text-amber-100 focus:outline-none"
              >
                <option value="demo">
                  ✦ Khảo Sát Học Thuật Cổ Điển (Tất định 100% · Không cần API Key)
                </option>
                <option value="local">AI Tử Vi nội bộ · Qwen (cần đăng nhập)</option>
                <option value="gemini">Google Gemini API (Gemini 1.5 Pro / Flash)</option>
                <option value="openai">OpenAI API (GPT-4o / GPT-4 Turbo)</option>
                <option value="anthropic">Anthropic API (Claude 3.5 Sonnet)</option>
                <option value="custom">Tùy Chỉnh (Ollama / Local LLM / Reverse Proxy)</option>
              </select>
              <p className="text-[11px] text-stone-400 mt-1">
                {localSettings.provider === 'demo'
                  ? 'Chế độ an toàn cao nhất: Sử dụng trực tiếp bộ engine toán học tất định tích hợp sẵn của Hoài Nguyệt Các.'
                  : localSettings.provider === 'local' ? 'Dùng model Tử Vi trên máy chủ Hoài Nguyệt Các qua tài khoản đăng nhập.'
                  : 'Sử dụng API Key cá nhân của quý vị để trò chuyện với mô hình ngôn ngữ lớn thời gian thực.'}
              </p>
            </div>

            {localSettings.provider !== 'demo' && localSettings.provider !== 'local' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập khóa bí mật API (sk-... hoặc AIzaSy...)"
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                    className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs text-amber-100 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Khóa được lưu cục bộ trên trình duyệt của bạn (Local Storage) và không bao giờ gửi về máy chủ trung gian.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    Tên Mô Hình (Model Name)
                  </label>
                  <input
                    type="text"
                    value={localSettings.modelName}
                    onChange={(e) => setLocalSettings({ ...localSettings, modelName: e.target.value })}
                    className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs text-amber-100 focus:outline-none"
                  />
                </div>

                {localSettings.provider === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                      Endpoint Tùy Biến
                    </label>
                    <input
                      type="url"
                      placeholder="http://localhost:11434/v1/chat/completions"
                      value={localSettings.apiEndpoint || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiEndpoint: e.target.value })}
                      className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs text-amber-100 focus:outline-none"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* School Preference */}
        <section className="rounded-2xl border border-amber-900/30 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-amber-900/20 pb-3 mb-5">
            <Settings size={18} className="text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-amber-200">
              Trường Phái Luận Giải Mặc Định
            </h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  localSettings.school === 'kham_thien'
                    ? 'border-amber-500/80 bg-amber-950/30'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <input
                  type="radio"
                  name="school"
                  checked={localSettings.school === 'kham_thien'}
                  onChange={() => setLocalSettings({ ...localSettings, school: 'kham_thien' })}
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <div className="font-serif font-bold text-amber-200 text-sm">
                    Khâm Thiên Môn (Bắc Phái)
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Trọng Tứ Hóa, Phi Tinh và hiện tượng Tự Hóa Ly Tâm & Hướng Tâm. Can Canh quy tắc: Nhật Vũ Âm Đồng.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  localSettings.school === 'nam_phai'
                    ? 'border-amber-500/80 bg-amber-950/30'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <input
                  type="radio"
                  name="school"
                  checked={localSettings.school === 'nam_phai'}
                  onChange={() => setLocalSettings({ ...localSettings, school: 'nam_phai' })}
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <div className="font-serif font-bold text-amber-200 text-sm">
                    Tử Vi Toàn Thư (Nam Phái)
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Trọng sao tọa thủ, cách cục miếu vượng đắc hãm và hội tụ tinh đẩu. Can Canh quy tắc: Nhật Vũ Đồng Âm.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-500 hover:to-amber-400 transition shadow-lg"
          >
            Lưu Toàn Bộ Cài Đặt
          </button>
        </div>
      </form>

      {/* Danger Zone: Wipe Local Data */}
      <section className="mt-12 rounded-2xl border border-rose-900/30 bg-rose-950/15 p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-rose-900/20 pb-3 mb-4 text-rose-300">
          <Database size={18} />
          <h2 className="font-serif text-lg font-bold">Quản Lý Bộ Nhớ Cục Bộ (Danger Zone)</h2>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed mb-4">
          Nếu quý vị muốn xóa sạch toàn bộ lịch sử đối thoại, các lá số đã lưu và ghi chép cá nhân khỏi trình duyệt này:
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
          >
            Xóa Toàn Bộ Dữ Liệu Lưu Trữ
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-rose-400 flex items-center gap-1">
              <AlertTriangle size={14} /> Bạn có chắc chắn muốn xóa vĩnh viễn?
            </span>
            <button
              onClick={handleWipeData}
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
            >
              Xác Nhận Xóa
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="rounded-xl border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-slate-800"
            >
              Hủy
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
