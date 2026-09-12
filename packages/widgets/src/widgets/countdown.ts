export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type CountdownRemaining =
  | { kind: "invalid" }
  | { kind: "past"; dateLabel: string }
  | { kind: "remaining"; parts: CountdownParts };

function parseTarget(target: string, allDay: boolean): Date | null {
  if (!target.trim()) return null;
  if (allDay && /^\d{4}-\d{2}-\d{2}$/.test(target)) {
    const [year, month, day] = target.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(target);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function countdownRemaining(now: Date, target: string, allDay: boolean): CountdownRemaining {
  const end = parseTarget(target, allDay);
  if (!end) return { kind: "invalid" };
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) {
    return {
      kind: "past",
      dateLabel: end.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { kind: "remaining", parts: { days, hours, minutes, seconds } };
}

export function formatCountdownParts(parts: CountdownParts, showSeconds: boolean): string {
  const units: Array<[number, string, string]> = [
    [parts.days, "day", "days"],
    [parts.hours, "hr", "hrs"],
    [parts.minutes, "min", "min"],
    ...(showSeconds ? ([[parts.seconds, "sec", "sec"]] as Array<[number, string, string]>) : []),
  ];
  const start = units.findIndex(([value]) => value > 0);
  const slice = (start === -1 ? units.slice(-1) : units.slice(start, start + 2)).filter(
    ([value], index) => value > 0 || index === 0,
  );
  return slice
    .map(([value, singular, plural]) => `${value} ${value === 1 ? singular : plural}`)
    .join(" ");
}
