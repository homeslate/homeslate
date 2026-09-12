export const DEFAULT_ROUTINE_STEPS = [
  { id: "wake", label: "Wake up", icon: "sun" as const },
  { id: "eat", label: "Eat breakfast", icon: "utensils" as const },
  { id: "dress", label: "Get dressed", icon: "shirt" as const },
  { id: "teeth", label: "Brush teeth", icon: "toothbrush" as const },
  { id: "bag", label: "Pack bag", icon: "backpack" as const },
  { id: "shoes", label: "Shoes on", icon: "shoes" as const },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatCivilDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function routineDayKey(now: Date, resetHour: number): string {
  const hour = Number.isFinite(resetHour) ? Math.min(23, Math.max(0, Math.trunc(resetHour))) : 4;
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() < hour) {
    date.setDate(date.getDate() - 1);
  }
  return formatCivilDay(date);
}

export function effectiveCompletedStepIds(
  completionDay: string | null,
  completedStepIds: string[],
  now: Date,
  resetHour: number,
): string[] {
  if (completionDay !== routineDayKey(now, resetHour)) return [];
  return completedStepIds;
}

export function toggleRoutineStep(completedStepIds: string[], stepId: string): string[] {
  return completedStepIds.includes(stepId)
    ? completedStepIds.filter((id) => id !== stepId)
    : [...completedStepIds, stepId];
}
