import { validateDisplayDocument, type DisplayDocument } from "@homeslate/schema";
import { describe, expect, it } from "vite-plus/test";
import {
  duplicateDocument,
  duplicateView,
  exportDocument,
  parseImportedDocument,
} from "./documentTools";

function document(): DisplayDocument {
  return {
    schemaVersion: 1,
    name: "Kitchen",
    views: [
      {
        id: "view-main",
        name: "Main",
        columns: 12,
        rowHeight: 80,
        widgets: [
          {
            id: "widget-clock",
            type: "clock-test",
            title: "Clock",
            config: { showDate: true },
            layout: { x: 0, y: 0, w: 3, h: 2 },
          },
        ],
        notes: [{ id: "note-1", text: "Milk", x: 1, y: 1, color: "#fff3bf" }],
      },
      {
        id: "view-evening",
        name: "Evening",
        columns: 12,
        rowHeight: 80,
        widgets: [],
      },
    ],
    activeViewId: "view-main",
    rotation: { enabled: false, intervalMs: 30000 },
    themes: [],
    activeThemeId: null,
    settings: {},
    household: { members: [] },
  };
}

describe("documentTools", () => {
  it("duplicateView assigns new ids and keeps the layout inside 12 columns", () => {
    const source = document();
    const next = duplicateView(source, "view-main");
    expect(next).not.toBe(source);
    expect(next.views).toHaveLength(3);
    expect(next.activeViewId).toBe("view-main");

    const copy = next.views[2];
    expect(copy.name).toBe("Main copy");
    expect(copy.id).not.toBe("view-main");
    expect(copy.widgets[0].id).not.toBe("widget-clock");
    expect(copy.widgets[0].layout).toEqual({ x: 0, y: 0, w: 3, h: 2 });
    expect(copy.widgets[0].layout.x + copy.widgets[0].layout.w).toBeLessThanOrEqual(copy.columns);
    expect(copy.notes?.[0].id).not.toBe("note-1");
    expect(copy.notes?.[0].text).toBe("Milk");
    expect(source.views[0].widgets[0].config).toEqual({ showDate: true });

    copy.widgets[0].config.showDate = false;
    expect(source.views[0].widgets[0].config).toEqual({ showDate: true });
  });

  it("duplicateView returns the same document when the view is missing", () => {
    const source = document();
    expect(duplicateView(source, "missing")).toBe(source);
  });

  it("duplicateView uses an explicit name", () => {
    expect(duplicateView(document(), "view-evening", " Late ").views[2].name).toBe("Late");
  });

  it("duplicateDocument is an independent, valid display named with copy", () => {
    const source = document();
    const copy = duplicateDocument(source);
    expect(copy.name).toBe("Kitchen copy");
    expect(copy.views.map((view) => view.id)).not.toEqual(source.views.map((view) => view.id));
    expect(copy.views[0].widgets[0].id).not.toBe(source.views[0].widgets[0].id);
    expect(copy.activeViewId).toBe(copy.views[0].id);
    expect(
      copy.views[0].widgets[0].layout.x + copy.views[0].widgets[0].layout.w,
    ).toBeLessThanOrEqual(12);

    const validated = validateDisplayDocument(copy);
    expect(validated.ok).toBe(true);

    copy.views[0].widgets[0].title = "Changed";
    expect(source.views[0].widgets[0].title).toBe("Clock");
  });

  it("round-trips export and import", () => {
    const source = document();
    const json = exportDocument(source);
    expect(json.endsWith("\n")).toBe(true);
    expect(json).toContain('\n  "name": "Kitchen"');

    const parsed = parseImportedDocument(json);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.document).toEqual(source);
  });

  it("reports invalid JSON and schema errors", () => {
    expect(parseImportedDocument("{")).toEqual({
      ok: false,
      errors: [{ path: "$", message: "Invalid JSON" }],
    });

    const invalid = parseImportedDocument(JSON.stringify({ schemaVersion: 1, name: "" }));
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.errors.length).toBeGreaterThan(0);
  });

  it("duplicateDocument name override replaces the copy suffix", () => {
    expect(duplicateDocument(document(), "Hall").name).toBe("Hall");
  });
});
