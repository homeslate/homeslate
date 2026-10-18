import type { DisplayDocument, StickyNote, View, WidgetInstance } from "@homeslate/schema";

function mapView(
  document: DisplayDocument,
  viewId: string,
  fn: (view: View) => View | null,
): DisplayDocument {
  let found = false;
  let changed = false;
  const views = document.views.map((view) => {
    if (view.id !== viewId) return view;
    found = true;
    const next = fn(view);
    if (next === null) return view;
    changed = true;
    return next;
  });
  if (!found || !changed) return document;
  return { ...document, views };
}

export function patchView(
  document: DisplayDocument,
  viewId: string,
  patch: Partial<View>,
): DisplayDocument {
  return mapView(document, viewId, (view) => ({ ...view, ...patch }));
}

/**
 * Appends a view. Adopts it as the active view only when none is set, so a
 * display never loses its current selection by adding another view.
 */
export function addView(document: DisplayDocument, view: View): DisplayDocument {
  return {
    ...document,
    views: [...document.views, view],
    activeViewId: document.activeViewId ?? view.id,
  };
}

/**
 * Removes a view. When the removed view was active, the first remaining view
 * becomes active; removing the last view leaves `activeViewId` null.
 */
export function removeView(document: DisplayDocument, viewId: string): DisplayDocument {
  if (!document.views.some((view) => view.id === viewId)) return document;
  const views = document.views.filter((view) => view.id !== viewId);
  const activeViewId =
    document.activeViewId === viewId ? (views[0]?.id ?? null) : document.activeViewId;
  return { ...document, views, activeViewId };
}

/** Moves a view to `toIndex`, clamped to the visible bounds. */
export function moveView(
  document: DisplayDocument,
  viewId: string,
  toIndex: number,
): DisplayDocument {
  const from = document.views.findIndex((view) => view.id === viewId);
  if (from === -1) return document;
  const to = Math.max(0, Math.min(toIndex, document.views.length - 1));
  if (from === to) return document;
  const views = [...document.views];
  const [moved] = views.splice(from, 1);
  views.splice(to, 0, moved);
  return { ...document, views };
}

/** Records which view a host should open by default (kiosk ignores it). */
export function setActiveView(document: DisplayDocument, viewId: string): DisplayDocument {
  if (document.activeViewId === viewId) return document;
  return { ...document, activeViewId: viewId };
}

export function replaceViewWidgets(
  document: DisplayDocument,
  viewId: string,
  widgets: WidgetInstance[],
): DisplayDocument {
  return mapView(document, viewId, (view) => ({ ...view, widgets }));
}

export function patchWidgetConfig(
  document: DisplayDocument,
  viewId: string,
  widgetId: string,
  config: Record<string, unknown>,
): DisplayDocument {
  return mapView(document, viewId, (view) => {
    if (!view.widgets.some((widget) => widget.id === widgetId)) return null;
    return {
      ...view,
      widgets: view.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, config: { ...widget.config, ...config } } : widget,
      ),
    };
  });
}

export function removeWidget(
  document: DisplayDocument,
  viewId: string,
  widgetId: string,
): DisplayDocument {
  return mapView(document, viewId, (view) => {
    if (!view.widgets.some((widget) => widget.id === widgetId)) return null;
    return {
      ...view,
      widgets: view.widgets.filter((widget) => widget.id !== widgetId),
    };
  });
}

export function addWidget(
  document: DisplayDocument,
  viewId: string,
  widget: WidgetInstance,
): DisplayDocument {
  return mapView(document, viewId, (view) => ({
    ...view,
    widgets: [...view.widgets, widget],
  }));
}

const GRID_MAX_ROWS = 12;

export function findAvailablePosition(
  widgets: Array<{ layout: { x: number; y: number; w: number; h: number } }>,
  cols: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const grid: boolean[][] = [];
  for (let y = 0; y < GRID_MAX_ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = false;
    }
  }

  for (const widget of widgets) {
    const w = widget.layout.w;
    const h = widget.layout.h;
    const x = widget.layout.x;
    const y = widget.layout.y;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (y + dy < GRID_MAX_ROWS && x + dx < cols) {
          grid[y + dy][x + dx] = true;
        }
      }
    }
  }

  for (let y = 0; y <= GRID_MAX_ROWS - height; y++) {
    for (let x = 0; x <= cols - width; x++) {
      let fits = true;
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          if (grid[y + dy]?.[x + dx]) {
            fits = false;
            break;
          }
        }
        if (!fits) break;
      }
      if (fits) return { x, y };
    }
  }

  return { x: 0, y: 0 };
}

export function patchViewNotes(
  document: DisplayDocument,
  viewId: string,
  notes: StickyNote[],
): DisplayDocument {
  return mapView(document, viewId, (view) => ({ ...view, notes }));
}

export function applyWidgetLayouts(
  document: DisplayDocument,
  viewId: string,
  layouts: Array<{ i: string; x: number; y: number; w: number; h: number }>,
): DisplayDocument {
  return mapView(document, viewId, (view) => ({
    ...view,
    widgets: view.widgets.map((widget) => {
      const next = layouts.find((item) => item.i === widget.id);
      if (!next) return widget;
      return {
        ...widget,
        layout: { ...widget.layout, x: next.x, y: next.y, w: next.w, h: next.h },
      };
    }),
  }));
}
