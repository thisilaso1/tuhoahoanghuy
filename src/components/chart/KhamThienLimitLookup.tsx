import { LimitNumberInput } from './LimitNumberInput';
import { getAnnualPalaceNames, type AnnualLimitState, type MonthlyLimitMethod } from '../../domain/annualLimits';
import { getMonthCanChi } from '../../domain/lunarCalendar';
import { getAnnualTransformations, getTransformationsForStem } from '../../domain/tuHoaEngine';
import { BRANCHES, type NatalChart } from '../../domain/types';

interface Props {
  chart: NatalChart;
  limits: AnnualLimitState;
  method: MonthlyLimitMethod;
  onMethodChange: (method: MonthlyLimitMethod) => void;
  leapMonth?: number;
  isLeap: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number, isLeap: boolean) => void;
}

export function KhamThienLimitLookup({ chart, limits, method, onMethodChange, leapMonth, isLeap, onYearChange, onMonthChange }: Props) {
  const { forecastYear, forecastCanChi, palaces } = chart;
  const { lunarAge, tieuHan, monthlyLimits, selectedLunarMonth } = limits;
  const minAge = Math.max(1, 1801 - chart.lunarDate.year);
  const maxAge = Math.min(120, 2200 - chart.lunarDate.year);
  const changeAge = (age: number) => onYearChange(chart.lunarDate.year + age - 1);
  const annualNames = getAnnualPalaceNames(forecastYear);
  const annualMenh = BRANCHES.indexOf(forecastCanChi.branch);
  const describePalace = (index: number) => {
    const palace = palaces.find((item) => item.index === index)!;
    return `${palace.name} (${palace.stem} ${palace.branch})`;
  };
  const monthStem = getMonthCanChi(forecastCanChi.stem, selectedLunarMonth).stem;
  const groups = [
    { title: 'Tứ Hóa lưu niên', items: getAnnualTransformations(chart, forecastYear) },
    ...(isLeap ? [] : [{ title: 'Tứ Hóa lưu nguyệt', items: getTransformationsForStem(chart, monthStem, 'kham_thien') }]),
  ];
  return <section className="chart-workspace-toolbar mb-4 space-y-3 rounded-xl p-3" aria-labelledby="limit-lookup-title">
    <h2 id="limit-lookup-title" className="font-semibold">Tra Tiểu hạn, Lưu niên và Nguyệt hạn</h2>
    <div className="flex flex-wrap gap-2">
      <LimitNumberInput key={lunarAge} label="Tuổi mụ" value={lunarAge}
        min={minAge} max={maxAge} onChange={changeAge} />
      <label className="chart-theme-picker chart-view-period-picker">
        <span>Chọn tuổi</span>
        <select aria-label="Chọn tuổi mụ" value={lunarAge} onChange={(event) => changeAge(Number(event.target.value))}>
          {(lunarAge < minAge || lunarAge > maxAge) && <option value={lunarAge}>{lunarAge} tuổi</option>}
          {Array.from({ length: maxAge - minAge + 1 }, (_, offset) => {
            const age = minAge + offset;
            return <option key={age} value={age}>{age} tuổi</option>;
          })}
        </select>
      </label>
      <label className="chart-theme-picker chart-view-period-picker">Tháng âm lịch
        <select value={isLeap ? 'leap' : selectedLunarMonth} onChange={(event) => {
          const value = event.target.value;
          if (value === 'leap' && leapMonth) onMonthChange(leapMonth, true);
          else onMonthChange(Number(value), false);
        }}>
          {monthlyLimits.map(({ month }) => <option key={month} value={month}>Tháng {month}</option>)}
          {leapMonth && <option value="leap">Tháng {leapMonth} nhuận</option>}
        </select>
      </label>
      <label className="chart-theme-picker chart-view-period-picker">An Nguyệt hạn
        <select value={method} onChange={(event) => onMethodChange(event.target.value as MonthlyLimitMethod)}>
          <option value="tieu_han">A · Từ Tiểu hạn</option>
          <option value="fixed_branch">B · Tháng Giêng tại Dần</option>
        </select>
      </label>
    </div>
    <dl className="grid gap-2 text-sm sm:grid-cols-3" aria-live="polite">
      <div><dt className="font-semibold">Tiểu hạn · {lunarAge} tuổi</dt><dd>{describePalace(tieuHan.branchIndex)}</dd></div>
      <div><dt className="font-semibold">Lưu niên Mệnh · {forecastYear} {forecastCanChi.stem} {forecastCanChi.branch}</dt><dd>{describePalace(annualMenh)}</dd></div>
      <div><dt className="font-semibold">Nguyệt hạn · Tháng {selectedLunarMonth}{isLeap ? ' nhuận' : ''}</dt>
        <dd>{isLeap ? 'Cần xác định quy tắc an tháng nhuận' : describePalace(monthlyLimits[selectedLunarMonth - 1].branchIndex)}</dd></div>
    </dl>
    <details className="text-sm">
      <summary className="cursor-pointer">Xem 12 tháng, 12 cung lưu niên và Tứ Hóa</summary>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <ol>{monthlyLimits.map(({ month, branchIndex }) => <li key={month}>Tháng {month} · {describePalace(branchIndex)}</li>)}</ol>
        <ul>{annualNames.map((name, index) => <li key={name}>LN.{name} · {describePalace(index)}</li>)}</ul>
        {groups.map(({ title, items }) => <div key={title}><strong>{title}</strong>
          <ul>{items.map(({ type, star, palaceIndex }) => <li key={type}>Hóa {type} · {star} · {describePalace(palaceIndex)}</li>)}</ul>
        </div>)}
      </div>
    </details>
  </section>;
}
