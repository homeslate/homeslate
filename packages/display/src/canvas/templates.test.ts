import { validateDisplayDocument } from "@homeslate/schema";
import { getWidgetByType } from "@homeslate/widgets";
import { describe, expect, it } from "vite-plus/test";
import {
  DOCUMENT_TEMPLATES,
  createBlankDocument,
  documentForNewDisplay,
  type DocumentTemplateId,
} from "./templates";

const TEMPLATE_IDS: DocumentTemplateId[] = ["family-hub", "kitchen", "home-control", "photo-frame"];

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

describe("display templates", () => {
  it("offers blank plus the four starter layouts", () => {
    expect(DOCUMENT_TEMPLATES.map((template) => template.id)).toEqual(TEMPLATE_IDS);
    expect(documentForNewDisplay("blank").views[0].widgets).toEqual([]);
    expect(createBlankDocument("Hall").name).toBe("Hall");
  });

  it("validates every template with unique ids and a 12-column layout", () => {
    for (const template of DOCUMENT_TEMPLATES) {
      const document = template.create();
      const validated = validateDisplayDocument(document);
      expect(validated.ok, template.id).toBe(true);
      expect(document.name).toBe(template.name);
      expect(document.views).toHaveLength(1);

      const view = document.views[0];
      expect(view.columns).toBe(12);
      expect(view.widgets.length).toBeGreaterThan(0);

      const ids = [view.id, ...view.widgets.map((widget) => widget.id)];
      expect(new Set(ids).size).toBe(ids.length);

      view.widgets.forEach((widget, index) => {
        expect(getWidgetByType(widget.type), widget.type).toBeDefined();
        expect(widget.type.startsWith("google-")).toBe(false);
        expect(widget.layout.x).toBeGreaterThanOrEqual(0);
        expect(widget.layout.y).toBeGreaterThanOrEqual(0);
        expect(widget.layout.w).toBeGreaterThan(0);
        expect(widget.layout.h).toBeGreaterThan(0);
        expect(widget.layout.x + widget.layout.w).toBeLessThanOrEqual(view.columns);
        view.widgets.slice(index + 1).forEach((other) => {
          expect(
            overlaps(widget.layout, other.layout),
            `${widget.type} overlaps ${other.type}`,
          ).toBe(false);
        });
      });
    }
  });

  it("creates a new document on every call", () => {
    const first = documentForNewDisplay("kitchen");
    const second = documentForNewDisplay("kitchen");
    expect(first.views[0].id).not.toBe(second.views[0].id);
    expect(first).not.toBe(second);
  });
});
