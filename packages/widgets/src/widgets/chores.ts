import { formatCivilDay } from "./dailyRoutine";

export type ChoreCompletion = {
  choreId: string;
  day: string;
};

export function civilDayKey(now: Date): string {
  return formatCivilDay(now);
}

export function isChoreDueOn(days: number[], weekday: number): boolean {
  if (days.length === 0) return true;
  return days.includes(weekday);
}

export function pruneCompletions(
  completions: ChoreCompletion[],
  today: string,
  keepDays = 28,
): ChoreCompletion[] {
  const [year, month, day] = today.split("-").map(Number);
  const cutoffDate = new Date(year, month - 1, day);
  cutoffDate.setDate(cutoffDate.getDate() - keepDays);
  const cutoff = formatCivilDay(cutoffDate);
  return completions.filter((completion) => completion.day >= cutoff);
}

export function toggleChoreCompletion(
  completions: ChoreCompletion[],
  choreId: string,
  day: string,
): ChoreCompletion[] {
  const exists = completions.some(
    (completion) => completion.choreId === choreId && completion.day === day,
  );
  const next = exists
    ? completions.filter(
        (completion) => !(completion.choreId === choreId && completion.day === day),
      )
    : [...completions, { choreId, day }];
  return pruneCompletions(next, day);
}
