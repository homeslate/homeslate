import {
  CalendarDate,
  CalendarDateTime,
  Time,
  parseDate,
  parseDateTime,
  type DateValue,
} from "@internationalized/date";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function calendarDateFromIso(value: string): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

export function isoFromCalendarDate(value: DateValue | null): string {
  if (!value) return "";
  return `${value.year}-${pad(value.month)}-${pad(value.day)}`;
}

export function dateTimeFromLocalInput(value: string): CalendarDateTime | null {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  try {
    return parseDateTime(normalized);
  } catch {
    return null;
  }
}

export function localInputFromDateTime(value: CalendarDateTime | null): string | undefined {
  if (!value) return undefined;
  return `${value.year}-${pad(value.month)}-${pad(value.day)}T${pad(value.hour)}:${pad(value.minute)}`;
}

export function timeFromHhMm(value: string): Time | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return new Time(hour, minute);
}

export function hhMmFromTime(value: Time | null): string {
  if (!value) return "";
  return `${pad(value.hour)}:${pad(value.minute)}`;
}
