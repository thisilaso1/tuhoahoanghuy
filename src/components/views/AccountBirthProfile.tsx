import { useState, type FormEvent } from 'react';
import { AccountBirthDateField } from '../common/AccountBirthDateField';
import { useApp, type AuthenticatedUserProfile } from '../../context/AppContext';
import { solarToLunar, lunarToSolar } from '../../domain/lunarCalendar';
import type { Gender } from '../../domain/types';
import { formatBirthDateInput, parseBirthDateInput } from '../../domain/birthDateInput';

function getSolarBirthDate(user: AuthenticatedUserProfile) {
  if (!user.birthDate) return '';
  if (user.calendar !== 'lunar') return formatBirthDateInput(user.birthDate);
  const [year, month, day] = user.birthDate.split('-').map(Number);
  try {
    const solar = lunarToSolar(day, month, year, user.isLeapMonth);
    return [solar.day, solar.month, solar.year].map((part) => String(part).padStart(2, '0')).join('-');
  } catch {
    return '';
  }
}

export function AccountBirthProfile({ user }: { user: AuthenticatedUserProfile }) {
  const { setAuthenticatedUser } = useApp();
  const [birthDateText, setBirthDateText] = useState(() => getSolarBirthDate(user));
  const [birthTime, setBirthTime] = useState(user.birthTime ?? '');
  const [gender, setGender] = useState<Gender | ''>(user.gender ?? '');
  const solarDate = parseBirthDateInput(birthDateText, 'solar');
  const [year, month, day] = solarDate?.split('-').map(Number) ?? [];
  const lunar = solarDate ? solarToLunar(day, month, year) : null;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setError('');
    const birthDate = parseBirthDateInput(birthDateText, 'solar');
    if (!birthDate) {
      setError('Vui lòng nhập ngày sinh dương lịch hợp lệ theo DD-MM-YYYY.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime: birthTime || null, gender: gender || undefined }),
      });
      if (response.status === 400) {
        setError('Ngày hoặc giờ sinh không hợp lệ. Ngày sinh không được ở tương lai.');
        return;
      }
      if (response.status === 401) {
        setAuthenticatedUser(null);
        return;
      }
      if (!response.ok) throw new Error();
      const { user: updated }: { user: AuthenticatedUserProfile } = await response.json();
      setAuthenticatedUser(updated);
      setNotice('Đã lưu thông tin ngày giờ sinh.');
    } catch {
      setError('Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="mb-10" aria-labelledby="account-birth-profile">
    <form onSubmit={save} className="chart-create-form">
      <h2 id="account-birth-profile" className="font-serif text-lg font-bold text-amber-200">Thông tin ngày giờ sinh</h2>
      <p className="text-sm text-stone-300">Họ và tên · <strong className="text-amber-100">{user.name}</strong></p>
      <div className="grid gap-4 sm:grid-cols-3">
        <AccountBirthDateField value={birthDateText} onChange={setBirthDateText} />
        <div>
          <label htmlFor="profile-birth-time">Giờ sinh (không bắt buộc)</label>
          <input id="profile-birth-time" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)}
            className="w-full px-3" />
        </div>
        <div>
          <label htmlFor="profile-gender">Giới tính dùng để an lá số</label>
          <select id="profile-gender" value={gender} onChange={(event) => setGender(event.target.value as Gender | '')} className="w-full px-3">
            <option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>
      {lunar && <p className="text-sm text-stone-300">Ngày sinh âm lịch · {formatBirthDateInput(`${lunar.lYear}-${String(lunar.lMonth).padStart(2, '0')}-${String(lunar.lDay).padStart(2, '0')}`)}{lunar.isLeap ? ' (tháng nhuận)' : ''}</p>}
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      <button type="submit" disabled={busy} className="chart-create-submit px-5 justify-self-start disabled:opacity-60">
        {busy ? 'Đang lưu…' : 'Lưu thông tin'}
      </button>
    </form>
  </section>;
}
