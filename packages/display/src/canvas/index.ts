export const DISPLAY_CANVAS_ENTRY = "@homeslate/display/canvas";

export {
  DEFAULT_THEME_DOCUMENTS,
  THEME_PRESET_OPTIONS,
  getPresetById,
  pickActiveDocument,
} from "./theme/defaults";
export {
  createDisplayTheme,
  createInactivePreviewThemeDispose,
  displayThemeName,
  getCanvasBackgroundStyle,
  previewDisplayThemeName,
  useCompiledDisplayTheme,
} from "./theme/createDisplayTheme";
export { hexToRgb, getBackgroundStyle } from "./theme/utils";
export {
  TAILWIND_COLOR_PALETTES,
  TAILWIND_COMPACT_COLOR_SWATCHES,
  TAILWIND_PALETTE_NAMES,
  TAILWIND_PALETTE_STEPS,
  tailwindPaletteToTokenGroup,
} from "./theme/tailwindPalette";
export type { ColorMode } from "@homeslate/schema";
export {
  addView,
  addWidget,
  applyWidgetLayouts,
  findAvailablePosition,
  moveView,
  patchView,
  patchViewNotes,
  patchWidgetConfig,
  removeView,
  removeWidget,
  replaceViewWidgets,
  setActiveView,
} from "./patchDocument";
export {
  PRESET_VIEW_NAMES,
  addPresetViews,
  createPresetView,
  missingPresetViews,
} from "./presetViews";
export type { PresetViewName } from "./presetViews";
export { DocumentCanvas } from "./DocumentCanvas";
export type { WidgetRegistryApi } from "./WidgetWrapper";
export { WidgetWrapper } from "./WidgetWrapper";
export { StickyNote } from "./StickyNote";
export { BackgroundSlideshow } from "./BackgroundSlideshow";
