import React, { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import { BirthInput, Gender, NatalChart } from '../../domain/types';

interface ActiveChartFormProps { chart: NatalChart; onSubmit: (input: BirthInput) => void }

function chartToInput(chart: NatalChart): BirthInput {
  return {
    name: chart.name,
    date: chart.solarDate,
    time: chart.time,
    gender: chart.gender,
    calendar: 'solar',
    isLeapMonth: false,
    forecastYear: chart.forecastYear,
    notes: chart.notes ?? '',
  };
}

export const ActiveChartForm: React.FC<ActiveChartFormProps> = ({ chart, onSubmit }) => {
  const [form, setForm] = useState<BirthInput>(() => chartToInput(chart));
  const [error, setError] = useState('');

  useEffect(() => { setForm(chartToInput(chart)); setError(''); }, [chart.id]);
  useEffect(() => {
    setForm((current) => ({ ...current, forecastYear: chart.forecastYear }));
  }, [chart.forecastYear]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    try { onSubmit(form); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lập lá số. Vui lòng kiểm tra lại thông tin.'); }
  };

  return <section className="chart-active-form-panel" aria-labelledby="chart-active-form-title">
    <div className="chart-active-form-heading">
      <span className="chart-active-form-mark"><Sparkles size={17} /></span>
      <div><span className="chart-section-kicker">HOÀI NGUYỆT CÁC · LẬP MỆNH BÀN</span><h2 id="chart-active-form-title">An Sao Lá Số</h2><p>Thông tin đang hiển thị đã được điền sẵn; chỉnh sửa ngày giờ sinh hoặc năm xem rồi lập lại khi cần.</p><small>Đang xem {chart.forecastYear} ({chart.forecastCanChi.stem} {chart.forecastCanChi.branch}) · Nạp âm {chart.napAm}</small></div>
    </div>
    <form className="chart-active-form" onSubmit={submit}>
      <label className="chart-active-field chart-active-name"><span>Họ và tên</span><input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label className="chart-active-field"><span><CalendarDays size={12} />Ngày sinh dương lịch</span><input aria-label="Ngày sinh dương lịch" required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
      <label className="chart-active-field"><span><Clock3 size={12} />Giờ sinh</span><input aria-label="Giờ sinh" required type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label>
      <label className="chart-active-field"><span>Giới tính</span><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></label>
      <label className="chart-active-field chart-active-year"><span>Năm xem</span><input aria-label="Năm xem" required type="number" min="1900" max="2100" value={form.forecastYear} onChange={(event) => setForm({ ...form, forecastYear: Number(event.target.value) })} /></label>
      <button className="chart-active-submit" type="submit"><Sparkles size={14} /><span>An Sao Lá Số</span><ArrowRight size={15} /></button>
      {error && <p className="chart-active-error" role="alert">{error}</p>}
    </form>
  </section>;
};
