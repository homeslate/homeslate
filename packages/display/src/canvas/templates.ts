import { v4 as uuidv4 } from "uuid";
import { getWidgetByType } from "@homeslate/widgets";
import type { DisplayDocument, View, WidgetInstance } from "@homeslate/schema";

export type DocumentTemplateId = "family-hub" | "kitchen" | "home-control" | "photo-frame";

export type DocumentTemplate = {
  id: DocumentTemplateId;
  name: string;
  description: string;
  icon: string;
  create: () => DisplayDocument;
};

export type NewDisplayChoice = "blank" | DocumentTemplateId;

type WidgetSpec = { type: string; x: number; y: number; w: number; h: number };

type TemplateSpec = {
  id: DocumentTemplateId;
  name: string;
  description: string;
  icon: string;
  widgets: WidgetSpec[];
};

const TEMPLATE_SPECS: TemplateSpec[] = [
  {
    id: "family-hub",
    name: "Family Hub",
    description: "Clock, weather, calendar, grocery list, chores, and photos.",
    icon: "IconHome",
    widgets: [
      { type: "clock", x: 0, y: 0, w: 3, h: 2 },
      { type: "weather", x: 3, y: 0, w: 3, h: 3 },
      { type: "calendar", x: 6, y: 0, w: 6, h: 4 },
      { type: "grocery", x: 0, y: 3, w: 3, h: 4 },
      { type: "chores", x: 3, y: 3, w: 3, h: 4 },
      { type: "photo", x: 6, y: 4, w: 6, h: 3 },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Clock, weather, the day ahead, a grocery list, and a pinned note.",
    icon: "IconToolsKitchen2",
    widgets: [
      { type: "clock", x: 0, y: 0, w: 3, h: 2 },
      { type: "weather", x: 3, y: 0, w: 3, h: 3 },
      { type: "calendar", x: 6, y: 0, w: 6, h: 4 },
      { type: "grocery", x: 0, y: 4, w: 6, h: 4 },
      { type: "announcement", x: 6, y: 4, w: 6, h: 2 },
    ],
  },
  {
    id: "home-control",
    name: "Home Control",
    description: "Status, devices, security, media, sensors, and energy.",
    icon: "IconBulb",
    widgets: [
      { type: "home-status", x: 0, y: 0, w: 4, h: 3 },
      { type: "devices", x: 4, y: 0, w: 4, h: 3 },
      { type: "security", x: 8, y: 0, w: 4, h: 3 },
      { type: "media-player", x: 0, y: 3, w: 4, h: 3 },
      { type: "sensors", x: 4, y: 3, w: 4, h: 3 },
      { type: "energy", x: 8, y: 3, w: 4, h: 3 },
    ],
  },
  {
    id: "photo-frame",
    name: "Photo Frame",
    description: "A large photo with the time and weather beside it.",
    icon: "IconPhoto",
    widgets: [
      { type: "photo", x: 0, y: 0, w: 8, h: 6 },
      { type: "clock", x: 8, y: 0, w: 4, h: 2 },
      { type: "weather", x: 8, y: 2, w: 4, h: 4 },
    ],
  },
];

function createWidget(spec: WidgetSpec): WidgetInstance | null {
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
      w: spec.w,
      h: spec.h,
      minW: entry.defaultLayout.minW,
      minH: entry.defaultLayout.minH,
      maxW: entry.defaultLayout.maxW,
      maxH: entry.defaultLayout.maxH,
    },
  };
}

function createTemplateView(spec: TemplateSpec): View {
  return {
    id: uuidv4(),
    name: spec.name,
    icon: spec.icon,
    columns: 12,
    rowHeight: 80,
    widgets: spec.widgets
      .map(createWidget)
      .filter((widget): widget is WidgetInstance => widget !== null),
  };
}

function buildTemplate(spec: TemplateSpec): DisplayDocument {
  const view = createTemplateView(spec);
  return {
    schemaVersion: 1,
    name: spec.name,
    views: [view],
    activeViewId: view.id,
    rotation: { enabled: false, intervalMs: 30000 },
    themes: [],
    activeThemeId: null,
    settings: {},
    household: { members: [] },
  };
}

/** Starter layouts. Google-only widgets are omitted; missing types are skipped. */
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = TEMPLATE_SPECS.map((spec) => ({
  id: spec.id,
  name: spec.name,
  description: spec.description,
  icon: spec.icon,
  create: () => buildTemplate(spec),
}));

/** Empty display matching the server's blank document, with browser-safe ids. */
export function createBlankDocument(name = "Homeslate"): DisplayDocument {
  const viewId = uuidv4();
  return {
    schemaVersion: 1,
    name,
    views: [
      {
        id: viewId,
        name: "Main",
        columns: 12,
        rowHeight: 80,
        widgets: [],
      },
    ],
    activeViewId: viewId,
    rotation: { enabled: false, intervalMs: 30000 },
    themes: [],
    activeThemeId: null,
    settings: {},
    household: { members: [] },
  };
}

export function createTemplateDocument(id: DocumentTemplateId): DisplayDocument {
  const template = DOCUMENT_TEMPLATES.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown display template: ${id}`);
  return template.create();
}

/** Document created by the new-display picker. Never mutates an existing display. */
export function documentForNewDisplay(choice: NewDisplayChoice): DisplayDocument {
  if (choice === "blank") return createBlankDocument();
  return createTemplateDocument(choice);
}
