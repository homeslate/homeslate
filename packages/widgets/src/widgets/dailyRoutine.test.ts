import { describe, expect, it } from "vite-plus/test";
import { effectiveCompletedStepIds, routineDayKey, toggleRoutineStep } from "./dailyRoutine";

describe("routineDayKey", () => {
  it("uses yesterday before the reset hour and today at or after it", () => {
    expect(routineDayKey(new Date("2026-09-11T03:30:00"), 4)).toBe("2026-09-10");
    expect(routineDayKey(new Date("2026-09-11T04:00:00"), 4)).toBe("2026-09-11");
  });
});

describe("effectiveCompletedStepIds", () => {
  it("treats completions from another day as empty without mutating them", () => {
    const stored = ["wake"];
    expect(
      effectiveCompletedStepIds("2026-09-10", stored, new Date("2026-09-11T08:00:00"), 4),
    ).toEqual([]);
    expect(stored).toEqual(["wake"]);
  });

  it("keeps completions when the stored day matches the current day key", () => {
    expect(
      effectiveCompletedStepIds(
        "2026-09-11",
        ["wake", "missing"],
        new Date("2026-09-11T08:00:00"),
        4,
      ),
    ).toEqual(["wake", "missing"]);
  });
});

describe("toggleRoutineStep", () => {
  it("adds and removes a step id", () => {
    expect(toggleRoutineStep([], "wake")).toEqual(["wake"]);
    expect(toggleRoutineStep(["wake", "eat"], "wake")).toEqual(["eat"]);
  });
});
