import { describe, expect, it } from "vite-plus/test";
import { getWidgetByType } from "@homeslate/widgets";
import { DEFAULT_ROUTINE_STEPS } from "./dailyRoutine";

describe("household list widgets", () => {
  it("registers daily routine defaults", () => {
    expect(getWidgetByType("daily-routine")).toMatchObject({
      type: "daily-routine",
      name: "Daily Routine",
      defaultConfig: {
        steps: DEFAULT_ROUTINE_STEPS,
        resetHour: 4,
        completionDay: null,
        completedStepIds: [],
        showReset: true,
        transparentBackground: false,
      },
    });
  });

  it("registers chores, grocery, countdown, and announcement", () => {
    expect(getWidgetByType("chores")?.defaultConfig).toMatchObject({
      chores: [],
      completions: [],
      showCompleted: true,
      onlyToday: true,
    });
    expect(getWidgetByType("grocery")?.defaultConfig).toMatchObject({
      items: [],
      hideChecked: false,
      groupByAisle: false,
    });
    expect(getWidgetByType("countdown")?.defaultConfig).toMatchObject({
      target: "",
      allDay: true,
      label: "",
      showSeconds: false,
      textAlign: "center",
    });
    expect(getWidgetByType("announcement")?.defaultConfig).toMatchObject({
      body: "",
      size: "lg",
      textAlign: "left",
    });
  });
});
