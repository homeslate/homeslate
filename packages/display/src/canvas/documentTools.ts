import { v4 as uuidv4 } from "uuid";
import {
  validateDisplayDocument,
  type DisplayDocument,
  type DisplayValidationResult,
  type View,
} from "@homeslate/schema";
import { addView } from "./patchDocument";

function cloneView(view: View, name: string): View {
  const copy = structuredClone(view);
  copy.id = uuidv4();
  copy.name = name;
  copy.widgets = copy.widgets.map((widget) => ({ ...widget, id: uuidv4() }));
  if (copy.notes) {
    copy.notes = copy.notes.map((note) => ({ ...note, id: uuidv4() }));
  }
  return copy;
}

/**
 * Appends an independent copy of a view. Widget and note ids are new so the
 * copy can be edited without changing the original. Returns the same document
 * when `viewId` is missing.
 */
export function duplicateView(
  document: DisplayDocument,
  viewId: string,
  name?: string,
): DisplayDocument {
  const view = document.views.find((item) => item.id === viewId);
  if (!view) return document;
  const trimmed = name?.trim();
  return addView(document, cloneView(view, trimmed || `${view.name} copy`));
}

/**
 * A display copy with new view and widget ids. The duplicate is safe to save
 * as its own display; theme and household ids stay so widget config that
 * points at them still resolves.
 */
export function duplicateDocument(document: DisplayDocument, name?: string): DisplayDocument {
  const views = document.views.map((view) => cloneView(view, view.name));
  const activeIndex = document.views.findIndex((view) => view.id === document.activeViewId);
  const trimmed = name?.trim();
  return {
    ...structuredClone(document),
    name: trimmed || `${document.name} copy`,
    views,
    activeViewId: activeIndex >= 0 ? views[activeIndex].id : null,
  };
}

/** Pretty-printed document JSON for download and round-trip import. */
export function exportDocument(document: DisplayDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

/** Parse and validate an imported document. Invalid JSON is a single error. */
export function parseImportedDocument(json: string): DisplayValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, errors: [{ path: "$", message: "Invalid JSON" }] };
  }
  return validateDisplayDocument(raw);
}
