import { useId, useState } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function LimitNumberInput({ label, value, min, max, onChange }: Props) {
  const errorId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  return <label className="chart-theme-picker chart-view-period-picker chart-limit-number">
    <span>{label}</span>
    <input
      type="text"
      inputMode="numeric"
      value={draft ?? String(value)}
      aria-invalid={invalid}
      aria-describedby={invalid ? errorId : undefined}
      onChange={(event) => {
        setDraft(event.target.value);
        setInvalid(false);
      }}
      onBlur={() => {
        if (draft === null) return;
        const next = Number(draft);
        if (!/^\d+$/.test(draft.trim()) || next < min || next > max) {
          setInvalid(true);
          return;
        }
        setDraft(null);
        setInvalid(false);
        if (next !== value) onChange(next);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        event.currentTarget.blur();
      }}
    />
    {invalid && <small id={errorId} role="alert">Nhập số từ {min} đến {max}.</small>}
  </label>;
}
