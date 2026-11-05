import { useId } from 'react';
import { completeBirthDateSegment, formatBirthDateInput, parseBirthDateInput } from '../../domain/birthDateInput';

export function AccountBirthDateField({ value, onChange, label = 'Ngày sinh dương lịch' }: { label?: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} type="text" inputMode="numeric" autoComplete="bday" placeholder="DD-MM-YYYY"
      value={value} required maxLength={10} className="w-full px-3"
      onChange={(event) => onChange(completeBirthDateSegment(event.currentTarget, event.nativeEvent as InputEvent))}
      onBlur={() => {
        const date = parseBirthDateInput(value, 'solar');
        if (date) onChange(formatBirthDateInput(date));
      }} />
  </div>;
}
