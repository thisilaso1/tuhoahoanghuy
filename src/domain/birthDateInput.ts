import type { CalendarType } from './types';

export function formatBirthDateInput(isoDate: string): string {
  return isoDate.split('-').reverse().join('-');
}

export function parseBirthDateInput(value: string, calendar: CalendarType): string | null {
  const text = value.trim();
  const match = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = calendar === 'lunar' ? 30 : [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (day > daysInMonth) return null;
  return `${yearText}-${monthText.padStart(2, '0')}-${dayText.padStart(2, '0')}`;
}

export function completeBirthDateSegment(input: HTMLInputElement, event: InputEvent): string {
  const { value, selectionStart } = input;
  if (event.isComposing || event.inputType?.startsWith('delete') || selectionStart !== value.length) {
    return value;
  }
  return /^(?:\d{2}|\d{2}-\d{2})$/.test(value) ? `${value}-` : value;
}
