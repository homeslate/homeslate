import { describe, expect, it } from "vite-plus/test";
import { getWidgetByType } from "@homeslate/widgets";
import type { DisplayDocument, View } from "@homeslate/schema";
import {
  PRESET_VIEW_NAMES,
  addPresetViews,
  createPresetView,
  missingPresetViews,
} from "./presetViews";

const view = (id: string, name: string): View => ({
  id,
  name,
  columns: 12,
  rowHeight: 80,
  widgets: [],
});

const doc = (views: View[] = [view("main", "Main")]): DisplayDocument => ({
  schemaVersion: 1,
  name: "Kitchen",
  views,
  activeViewId: views[0]?.id ?? null,
  rotation: { enabled: false, intervalMs: 30000 },
  themes: [],
  activeThemeId: null,
  settings: {},
});

describe("presetViews", () => {
  it("offers Morning, Evening, and Weekend", () => {
    expect(PRESET_VIEW_NAMES).toEqual(["Morning", "Evening", "Weekend"]);
  });

  it("createPresetView builds a populated view with the preset icon", () => {
    const morning = createPresetView("Morning");
    expect(morning.name).toBe("Morning");
    expect(morning.icon).toBe("IconSun");
    expect(morning.columns).toBe(12);
    expect(morning.rowHeight).toBe(80);
    expect(morning.widgets.map((widget) => widget.type)).toEqual([
      "clock",
      "weather",
      "google-calendar-day",
      "todo",
      "news",
    ]);
    expect(new Set(morning.widgets.map((widget) => widget.id)).size).toBe(morning.widgets.length);
  });

  it("uses registry defaults for widgets without an explicit size", () => {
    const clock = createPresetView("Evening").widgets[0];
    const entry = getWidgetByType("clock");
    expect(clock.title).toBe(entry?.name);
    expect(clock.layout).toMatchObject({
      x: 0,
      y: 0,
      w: entry?.defaultLayout.w,
      h: entry?.defaultLayout.h,
    });
    expect(clock.config).toEqual(entry?.defaultConfig);
  });

  it("missingPresetViews ignores names already present, case-insensitively", () => {
    const document = doc([view("main", "Main"), view("pm", "  evening "), view("sun", "MORNING")]);
    expect(missingPresetViews(document)).toEqual(["Weekend"]);
  });

  it("addPresetViews appends only the missing presets and is idempotent", () => {
    const once = addPresetViews(doc());
    expect(once.views.map((item) => item.name)).toEqual(["Main", "Morning", "Evening", "Weekend"]);

    const twice = addPresetViews(once);
    expect(twice).toBe(once);
    expect(twice.views).toHaveLength(4);
  });

  it("addPresetViews adopts the first preset when the display has no views", () => {
    const next = addPresetViews(doc([]));
    expect(next.views.map((item) => item.name)).toEqual(["Morning", "Evening", "Weekend"]);
    expect(next.activeViewId).toBe(next.views[0].id);
  });
});
