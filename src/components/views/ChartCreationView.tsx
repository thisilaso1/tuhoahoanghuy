import { completeBirthDateSegment, formatBirthDateInput, parseBirthDateInput } from '../../domain/birthDateInput';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BirthInput, CalendarType, Gender } from '../../domain/types';
import { getDayCanChi, getHourBranch, getYearCanChi, lunarToSolar, solarToLunar } from '../../domain/lunarCalendar';
import { Sparkles, Calendar, Clock, ArrowRight, Moon, Compass, Orbit, Stars } from 'lucide-react';

export const ChartCreationView: React.FC = () => {
  const { createChart, navigateTo } = useApp();

  const [form, setForm] = useState<BirthInput>({
    name: '',
    date: '1995-10-12',
    time: '14:20',
    gender: 'Nam',
    calendar: 'solar',
    isLeapMonth: false,
    forecastYear: 2026,
    notes: '',
  });
  const [birthDateText, setBirthDateText] = useState(() => formatBirthDateInput(form.date));
  const birthDate = parseBirthDateInput(birthDateText, form.calendar);
  const [formError, setFormError] = useState('');

  // Tính toán nháp tức thì để người dùng xem trước Can Chi
  const [sYear, sMonth, sDay] = (birthDate ?? form.date).split('-').map(Number);
  const [hour, min] = form.time.split(':').map(Number);

  const lunar = form.calendar === 'solar' ? solarToLunar(sDay, sMonth, sYear) : { lYear: sYear, lMonth: sMonth, lDay: sDay, isLeap: Boolean(form.isLeapMonth) };
  const yearCanChi = getYearCanChi(lunar.lYear);
  const hourBranch = getHourBranch(hour || 0, min || 0);
  let solarBirth = { year: sYear, month: sMonth, day: sDay };
  try {
    if (form.calendar === 'lunar') solarBirth = lunarToSolar(sDay, sMonth, sYear, Boolean(form.isLeapMonth));
  } catch {
    // Keep the live preview stable while the user is editing an incomplete lunar date.
  }
  const dayCanChi = getDayCanChi(solarBirth.year, solarBirth.month, solarBirth.day, hour || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setFormError('Vui lòng nhập ngày sinh hợp lệ theo DD-MM-YYYY.');
      return;
    }
    try {
      const finalName = form.name.trim() || 'Vô Danh Cư Sĩ';
      createChart({ ...form, date: birthDate, name: finalName });
      setFormError('');
      navigateTo('/menh-ban');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ngày âm lịch không hợp lệ. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="chart-create-page">
      <div className="chart-create-atmosphere" aria-hidden="true">
        <div className="chart-create-moon" />
        <div className="chart-create-water" />
        <div className="chart-create-mist chart-create-mist-one" />
        <div className="chart-create-mist chart-create-mist-two" />
        <div className="chart-create-stars" />
      </div>

      <div className="chart-create-content">
        <header className="chart-create-hero">
          <div className="chart-create-kicker"><Moon size={14} strokeWidth={1.5} /><span>HOÀI NGUYỆT CÁC <i>·</i> MỆNH BÀN KHÂM THIÊN</span></div>
          <h1 className="chart-create-title">An Sao Lá Số</h1>
          <p className="chart-create-intro">
            Lập lá số Tử Vi Khâm Thiên Tứ Hóa từ ngày giờ sinh một cách trực quan, chuẩn xác và giàu tính chiêm nghiệm.
          </p>
          <div className="chart-create-ornament" aria-hidden="true"><span /><Stars size={13} /><span /></div>
        </header>

      <div className="chart-create-layout">
        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="chart-create-form"
        >
          <div className="chart-form-heading">
            <div className="chart-form-icon"><Orbit size={18} strokeWidth={1.5} /></div>
            <div><span className="chart-section-kicker">NGHI THỨC LẬP SỐ</span><h2>Thông tin đương số</h2></div>
            <span className="chart-form-step">01 <i>/</i> 01</span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              Họ và Tên Đương Số
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="name"
                aria-label="Họ và tên đương số"
                placeholder="Ví dụ: Nguyễn Minh An"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2.5 text-sm text-amber-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender & Calendar Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                Giới Tính
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-amber-900/30 bg-slate-950 p-1 text-xs">
                {(['Nam', 'Nữ'] as Gender[]).map((g) => (
                  <button
                    type="button"
                    key={g}
                    aria-pressed={form.gender === g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`rounded-lg py-1.5 font-semibold transition ${
                      form.gender === g
                        ? 'bg-amber-600 text-slate-950'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                Loại Lịch Sinh
              </label>
              <select
                aria-label="Loại lịch sinh"
                value={form.calendar}
                onChange={(e) => setForm({ ...form, calendar: e.target.value as CalendarType })}
                className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3 py-2 text-xs text-amber-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="solar">Dương Lịch (Chuẩn quốc tế)</option>
                <option value="lunar">Âm Lịch (Nông lịch)</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                <Calendar size={13} /> Ngày Sinh
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD-MM-YYYY"
                required
                aria-label="Ngày sinh"
                value={birthDateText}
                onChange={(e) => setBirthDateText(completeBirthDateSegment(e.currentTarget, e.nativeEvent as InputEvent))}
                onBlur={() => { if (birthDate) setBirthDateText(formatBirthDateInput(birthDate)); }}
                className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-amber-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                <Clock size={13} /> Giờ Sinh
              </label>
              <input
                type="time"
                step="60"
                required
                aria-label="Giờ sinh"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-amber-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {form.calendar === 'lunar' && (
            <label className="flex items-center gap-2 rounded-lg border border-amber-900/30 bg-slate-950/70 p-3 text-xs text-stone-300">
              <input
                type="checkbox"
                checked={Boolean(form.isLeapMonth)}
                onChange={(e) => setForm({ ...form, isLeapMonth: e.target.checked })}
                className="accent-amber-500"
              />
              Ngày sinh thuộc tháng nhuận âm lịch
            </label>
          )}
          {formError && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/30 p-3 text-xs text-rose-200">{formError}</p>}

          {/* Forecast Year */}
          <div className="chart-form-optional">
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              Năm Cần Xem Vận Trình
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={form.forecastYear}
              onChange={(e) => setForm({ ...form, forecastYear: Number(e.target.value) })}
              className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-amber-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              Ghi Chú Hoặc Chủ Đề Quan Tâm (Tùy chọn)
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Định hướng sự nghiệp, công việc, sức khỏe, tài lộc năm 2026..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-amber-900/40 bg-slate-950 px-3.5 py-2 text-xs text-amber-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="chart-create-submit"
          >
            <Sparkles size={16} />
            <span>Khai mở mệnh bàn</span>
            <ArrowRight size={16} />
          </button>
          <p className="chart-create-form-footnote">Thông tin ngày giờ sinh được dùng để an vị 12 cung và hệ thống sao.</p>
        </form>

        {/* Live Calculation Preview Sidebar */}
        <aside className="space-y-4">
          <div className="chart-create-preview rounded-2xl p-5 backdrop-blur-md">
            <div className="chart-preview-heading"><div className="chart-preview-icon"><Compass size={17} strokeWidth={1.5} /></div><div><span className="chart-section-kicker">LỊCH PHÁP</span><h2 className="chart-preview-title">Đối chiếu Can Chi</h2></div></div>
            <p className="chart-preview-caption">Bản xem trước cập nhật theo ngày và giờ bạn nhập.</p>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-stone-400">Năm Âm Lịch:</span>
                <span className="font-semibold text-amber-300">
                  {yearCanChi.stem} {yearCanChi.branch} ({lunar.lYear})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-stone-400">Tháng Âm Lịch:</span>
                <span className="font-medium text-stone-200">
                  Tháng {lunar.lMonth} (Âm lịch)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-stone-400">Ngày Âm Lịch:</span>
                <span className="font-medium text-stone-200">
                  Ngày {lunar.lDay} (Can {dayCanChi.stem})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-stone-400">Giờ Sinh:</span>
                <span className="font-semibold text-amber-300">
                  Giờ {hourBranch} ({form.time})
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-400">Lưu Niên Đang Xem:</span>
                <span className="font-semibold text-emerald-300">
                  Năm {form.forecastYear}
                </span>
              </div>
            </div>

            <div className="chart-preview-note">
              <Sparkles size={14} /><span>Khi hoàn tất, lá số 12 cung sẽ được lập theo thông tin sinh này.</span>
            </div>
          </div>

          <div className="chart-create-result-hint">
            <span className="chart-section-kicker">KẾT QUẢ</span>
            <h2>Lá số của bạn</h2>
            <p>Mệnh bàn sẽ mở ngay sau khi bạn chọn “Khai mở mệnh bàn”.</p>
            <div className="chart-result-mark" aria-hidden="true"><span>命</span><i /><i /><i /></div>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
};
