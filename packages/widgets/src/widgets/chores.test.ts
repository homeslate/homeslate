import { describe, expect, it } from "vite-plus/test";
import { isChoreDueOn, pruneCompletions, toggleChoreCompletion } from "./chores";

describe("isChoreDueOn", () => {
  it("treats empty days as every day", () => {
    expect(isChoreDueOn([], 3)).toBe(true);
  });

  it("matches the weekday list", () => {
    expect(isChoreDueOn([1, 3, 5], 3)).toBe(true);
    expect(isChoreDueOn([1, 3, 5], 2)).toBe(false);
  });
});

describe("pruneCompletions", () => {
  it("keeps at most 28 days of completions relative to today", () => {
    const completions = [
      { choreId: "a", day: "2026-08-01" },
      { choreId: "a", day: "2026-09-01" },
      { choreId: "b", day: "2026-09-11" },
    ];
    expect(pruneCompletions(completions, "2026-09-11", 28)).toEqual([
      { choreId: "a", day: "2026-09-01" },
      { choreId: "b", day: "2026-09-11" },
    ]);
  });
});

describe("toggleChoreCompletion", () => {
  it("adds today's completion and removes it on a second toggle", () => {
    const once = toggleChoreCompletion([], "dishes", "2026-09-11");
    expect(once).toEqual([{ choreId: "dishes", day: "2026-09-11" }]);
    expect(toggleChoreCompletion(once, "dishes", "2026-09-11")).toEqual([]);
  });
});
