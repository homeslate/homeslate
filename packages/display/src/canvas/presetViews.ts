import { v4 as uuidv4 } from "uuid";
import { getWidgetByType } from "@homeslate/widgets";
import type { DisplayDocument, View, WidgetInstance } from "@homeslate/schema";
import { addView } from "./patchDocument";

/** Preset views offered by "Add preset views", matching the hosted product. */
export const PRESET_VIEW_NAMES = ["Morning", "Evening", "Weekend"] as const;
export type PresetViewName = (typeof PRESET_VIEW_NAMES)[number];

type WidgetSpec = { type: string; x: number; y: number; w?: number; h?: number };

const PRESET_VIEW_SPECS: Record<PresetViewName, { icon: string; widgets: WidgetSpec[] }> = {
  Morning: {
    icon: "IconSun",
    widgets: [
      { type: "clock", x: 0, y: 0 },
      { type: "weather", x: 3, y: 0 },
      { type: "google-calendar-day", x: 6, y: 0, w: 3, h: 4 },
      { type: "todo", x: 9, y: 0, w: 3, h: 4 },
      { type: "news", x: 0, y: 3, w: 6, h: 4 },
    ],
  },
  Evening: {
    icon: "IconMoon",
    widgets: [
      { type: "clock", x: 0, y: 0 },
      { type: "todo", x: 3, y: 0, w: 3, h: 4 },
      { type: "google-calendar-day", x: 6, y: 0, w: 3, h: 4 },
      { type: "photo", x: 9, y: 0, w: 3, h: 3 },
      { type: "weather", x: 0, y: 2, w: 3, h: 3 },
    ],
  },
  Weekend: {
    icon: "IconCalendarWeek",
    widgets: [
      { type: "clock", x: 0, y: 0 },
      { type: "google-calendar-month", x: 3, y: 0, w: 5, h: 5 },
      { type: "todo", x: 8, y: 0, w: 4, h: 4 },
      { type: "weather", x: 0, y: 2, w: 3, h: 3 },
      { type: "news", x: 8, y: 4, w: 4, h: 3 },
    ],
  },
};

function createPresetWidget(spec: WidgetSpec): WidgetInstance | null {
  const entry = getWidgetByType(spec.type);
  if (!entry) return null;
  return {
    id: uuidv4(),
    type: entry.type,
    title: entry.name,
    config: structuredClone(entry.defaultConfig) as Record<string, unknown>,
    layout: {
      x: spec.x,
      y: spec.y,
      w: spec.w ?? entry.defaultLayout.w,
      h: spec.h ?? entry.defaultLayout.h,
      minW: entry.defaultLayout.minW,
      minH: entry.defaultLayout.minH,
      maxW: entry.defaultLayout.maxW,
      maxH: entry.defaultLayout.maxH,
    },
  };
}

/**
 * Builds a ready-to-add preset view from the registered widget defaults.
 * Widget types that are not registered (for example a custom registry without
 * the built-ins) are skipped, so the view is always valid.
 */
export function createPresetView(name: PresetViewName): View {
  const spec = PRESET_VIEW_SPECS[name];
  return {
    id: uuidv4(),
    name,
    icon: spec.icon,
    columns: 12,
    rowHeight: 80,
    widgets: spec.widgets
      .map(createPresetWidget)
      .filter((widget): widget is WidgetInstance => widget !== null),
  };
}

/** Preset names the document does not already have (case-insensitive). */
export function missingPresetViews(document: DisplayDocument): PresetViewName[] {
  const existing = new Set(document.views.map((view) => view.name.trim().toLowerCase()));
  return PRESET_VIEW_NAMES.filter((name) => !existing.has(name.toLowerCase()));
}

/**
 * Appends a view for each missing preset (Morning, Evening, Weekend). Returns
 * the document unchanged when every preset is already present.
 */
export function addPresetViews(document: DisplayDocument): DisplayDocument {
  return missingPresetViews(document).reduce(
    (next, name) => addView(next, createPresetView(name)),
    document,
  );
}
