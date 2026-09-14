import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { getRegisteredCss } from "typestyles";
import {
  colorSourceActions,
  colorValueRow,
  editorTabsList,
  paletteBrowserGrid,
  paletteShadeButton,
} from "./ThemeEditor.styles";

const source = readFileSync(new URL("./ThemeEditor.tsx", import.meta.url), "utf8");

describe("ThemeEditor markup", () => {
  it("does not render the dirty badge inside a paragraph", () => {
    expect(source).toMatch(
      /<Text\s+size="sm"\s+tone="secondary"\s+as="div">[\s\S]*?<Badge[\s\S]*?tone="warning"/,
    );
  });

  it("exposes GUI token tabs and keeps JSON available as an advanced editor", () => {
    expect(source).toContain("Widget tokens");
    expect(source).toContain("All tokens");
    expect(source).toContain("Theme JSON");
  });

  it("organizes the primary editor around widget token wayfinding", () => {
    expect(source).toContain("Search token, CSS variable, or value");
    expect(source).toContain("widgetTokenSections");
    expect(source).toContain("getWidgetTokenSections");
    expect(source).toContain("Widget-related");
  });

  it("keeps the widget token header compact", () => {
    expect(source).not.toContain("Tokens that drive widget styles");
    expect(source).not.toContain("Search exact paths or CSS variables");
    expect(source).toContain('label="Filter widget tokens"');
  });

  it("keeps editor tabs sticky while token lists scroll", () => {
    expect(source).toContain("className={classes.editorTabsList}");
    void editorTabsList;
    const css = getRegisteredCss();
    expect(css).toMatch(/position:\s*sticky/);
    expect(css).toMatch(/top:\s*0/);
    expect(css).toMatch(/z-index:\s*1/);
  });

  it("shows generated CSS variable names for token controls", () => {
    expect(source).toContain("tokenCssVarName(entry.referencePath)");
    expect(source).toContain("CSS var");
    expect(source).toContain("Font family");
    expect(source).toContain("Dimension");
  });

  it("keeps inline color swatches compact and exposes a full palette browser", () => {
    expect(source).toContain("TAILWIND_COMPACT_COLOR_SWATCHES");
    expect(source).toContain("Browse palettes");
    expect(source).toContain("Search palettes, shades, paths, or OKLCH");
    expect(source).toContain("foundation.color.${name}.${step}");
    expect(paletteBrowserGrid).toEqual(expect.any(String));
    expect(paletteShadeButton).toEqual(expect.any(String));
  });

  it("presents color picking as one value field with inline source actions", () => {
    expect(source).toContain("className={classes.colorValueRow}");
    expect(colorValueRow).toEqual(expect.any(String));
    expect(colorSourceActions).toEqual(expect.any(String));
    expect(source).toContain('aria-label="Browse palettes"');
    expect(source).toContain('aria-label="Reference another token"');
    expect(source).toContain('aria-label="Pick custom color"');
    expect(source).toContain("Search token references");
  });

  it("uses the real dashboard surface for draft theme preview", () => {
    expect(source).toContain("DocumentCanvas");
    expect(source).toContain("previewViews");
    expect(source).toContain("previewViewId");
  });

  it("does not show explanatory page copy above the editor shell", () => {
    expect(source).not.toContain("Edit a draft theme while previewing the selected view");
  });

  it("opens the editor when selecting a theme row", () => {
    expect(source).toMatch(/onClick=\{\(\) => beginEdit\(doc\.id\)\}/);
  });

  it("uses the active theme as the initial editor target", () => {
    expect(source).toContain("getInitialThemeId");
    expect(source).toContain("activeThemeDocumentId");
    expect(source).toMatch(/useState<string \| null>\(initialThemeId\)/);
  });

  it("previews a draft theme through a nested DesignSystemProvider and live replace", () => {
    expect(source).toMatch(/from ["']@var-ui\/react["']/);
    expect(source).toContain("DesignSystemProvider");
    expect(source).toContain("useDebouncedValue");
    expect(source).toContain("createDisplayTheme");
    expect(source).toMatch(/customTheme=\{previewTheme\}/);
    expect(source).toContain("createInactivePreviewThemeDispose");
    expect(source).toContain("activeIdRef");
    expect(source).not.toContain("themeDocumentToPreviewVars");
    expect(source).not.toMatch(/applyToDocument/);
    expect(source).not.toMatch(/document\.documentElement/);
  });
});
