import { useState, type FormEvent } from 'react';
import { AccountBirthDateField } from '../common/AccountBirthDateField';
import { calculateAnnualLimitState } from '../../domain/annualLimits';
import { formatBirthDateInput, parseBirthDateInput } from '../../domain/birthDateInput';
import { getDayCanChi, solarToLunar } from '../../domain/lunarCalendar';
import type { NatalChart } from '../../domain/types';

interface LimitEvent { id: string; title: string; date: string }

export function ProfileLimitEvents({ userId, chart }: { userId: string; chart: NatalChart | null }) {
  const storageKey = `hoai_nguyet_limit_events:${userId}`;
  const [events, setEvents] = useState<LimitEvent[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (Array.isArray(stored)) {
        return stored.filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string' &&
          typeof item.date === 'string' && parseBirthDateInput(formatBirthDateInput(item.date), 'solar'));
      }
    } catch {
      // A new event can still be entered if stored data cannot be read.
    }
    return [];
  });
  const [title, setTitle] = useState('');
  const [dateText, setDateText] = useState('');
  const [error, setError] = useState('');

  function save(next: LimitEvent[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setEvents(next);
      setError('');
      return true;
    } catch {
      setError('Không thể lưu sự kiện trên trình duyệt này.');
      return false;
    }
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const date = parseBirthDateInput(dateText, 'solar');
    if (!date || !title.trim()) {
      setError('Vui lòng nhập tên sự kiện và ngày dương lịch hợp lệ.');
      return;
    }
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (save([{ id, date, title: title.trim() }, ...events])) {
      setTitle('');
      setDateText('');
    }
  }

  return <section className="mb-10 rounded-2xl border border-amber-900/30 bg-slate-900/80 p-5" aria-labelledby="profile-limit-events">
    <h2 id="profile-limit-events" className="font-serif text-lg font-bold text-amber-200">Đánh dấu sự kiện Nguyệt hạn và Nhật hạn</h2>
    <p className="mt-1 text-sm text-stone-300">Nhập ngày dương để đối chiếu với Nguyệt hạn từ Tiểu hạn, ngày âm và Can Chi ngày. Sự kiện được lưu trên trình duyệt này.</p>
    <form onSubmit={add} className="chart-create-form my-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="limit-event-title">Tên sự kiện</label>
          <input id="limit-event-title" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full px-3" />
        </div>
        <AccountBirthDateField label="Ngày sự kiện dương lịch" value={dateText} onChange={setDateText} />
      </div>
      <button className="chart-create-submit justify-self-start px-5" type="submit">Đánh dấu sự kiện</button>
    </form>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    {events.length > 0 && <ul className="space-y-2">{events.map((item) => {
      const [year, month, day] = item.date.split('-').map(Number);
      const lunar = solarToLunar(day, month, year);
      const canChi = getDayCanChi(year, month, day);
      const limit = chart && !lunar.isLeap && lunar.lYear >= chart.lunarDate.year
        ? calculateAnnualLimitState(chart, lunar.lYear, lunar.lMonth).monthlyLimits[lunar.lMonth - 1]
        : null;
      return <li key={item.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
        <div className="min-w-0 break-words">
          <strong className="text-amber-100">{item.title}</strong>
          <p className="text-sm text-stone-300">{formatBirthDateInput(item.date)} dương lịch · {lunar.lDay}/{lunar.lMonth}/{lunar.lYear} âm lịch{lunar.isLeap ? ' (nhuận)' : ''} · Ngày {canChi.stem} {canChi.branch}</p>
          <p className="text-sm text-stone-300">Nguyệt hạn · {limit ? `${limit.palaceName} (${chart?.palaces[limit.branchIndex].branch})` : lunar.isLeap ? 'Cần xác định quy tắc an tháng nhuận' : 'Cần lá số cá nhân hợp lệ cho năm sự kiện'}</p>
        </div>
        <button type="button" onClick={() => save(events.filter(({ id }) => id !== item.id))} className="text-sm text-rose-300" aria-label={`Xóa sự kiện ${item.title}`}>Xóa</button>
      </li>;
    })}</ul>}
  </section>;
}
