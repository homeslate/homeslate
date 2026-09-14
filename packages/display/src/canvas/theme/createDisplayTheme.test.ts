import { describe, expect, it, beforeEach } from "vite-plus/test";
import { getRegisteredCss, reset } from "typestyles";
import {
  createDisplayTheme,
  createInactivePreviewThemeDispose,
  getCanvasBackgroundStyle,
} from "./createDisplayTheme";
import { DEFAULT_THEME_DOCUMENTS } from "./defaults";

describe("createDisplayTheme", () => {
  beforeEach(() => {
    reset();
  });

  it("registers a VarUI surface from a preset", () => {
    const doc = DEFAULT_THEME_DOCUMENTS[0];
    const theme = createDisplayTheme(doc);
    expect(theme.className).toBe(`theme-var-ui-homeslate-${doc.id}`);
    const css = getRegisteredCss();
    expect(css).toContain(`.${theme.className}`);
    expect(css).toMatch(/--var-ui-color-background-app:\s*light-dark\(/);
  });

  it("keeps canvas gradients off color.background.app", () => {
    const doc = DEFAULT_THEME_DOCUMENTS[0];
    createDisplayTheme(doc);
    const css = getRegisteredCss();
    const appColorValues = [...css.matchAll(/--var-ui-color-background-app:\s*([^;]+);/g)].map(
      (match) => match[1],
    );
    expect(appColorValues.length).toBeGreaterThan(0);
    for (const value of appColorValues) {
      expect(value).not.toMatch(/gradient/i);
    }
    expect(doc.extend?.canvas).toEqual(
      expect.objectContaining({
        backgroundImage: expect.objectContaining({
          light: expect.stringMatching(/gradient/i),
          dark: expect.stringMatching(/gradient/i),
        }),
      }),
    );
  });

  it("paints mode-aware canvas gradients from extend.canvas.backgroundImage", () => {
    const cosmos = DEFAULT_THEME_DOCUMENTS[0];
    const dark = getCanvasBackgroundStyle(cosmos, "dark");
    const light = getCanvasBackgroundStyle(cosmos, "light");
    const canvas = cosmos.extend?.canvas as {
      backgroundImage: { light: string; dark: string };
    };

    expect(dark.backgroundImage).toBe(canvas.backgroundImage.dark);
    expect(light.backgroundImage).toBe(canvas.backgroundImage.light);
    expect(dark.backgroundImage).toMatch(/gradient/i);
  });

  it("omits canvas backgroundImage when the preset has no extend.canvas", () => {
    const paper = DEFAULT_THEME_DOCUMENTS.find((doc) => doc.id === "theme-paper");
    expect(paper).toBeDefined();
    expect(getCanvasBackgroundStyle(paper!, "dark")).toEqual({});
  });

  it("does not dispose preview CSS when that theme is activated before cleanup", () => {
    const doc = { ...DEFAULT_THEME_DOCUMENTS[0], id: "preview-b" };
    const theme = createDisplayTheme(doc);
    expect(getRegisteredCss()).toContain(`.${theme.className}`);

    const activeIdRef = { current: "theme-a" as string | null };
    const cleanup = createInactivePreviewThemeDispose(doc.id, activeIdRef);
    activeIdRef.current = doc.id;
    cleanup();

    expect(getRegisteredCss()).toContain(`.${theme.className}`);
  });

  it("disposes preview CSS when cleanup runs for a theme that is still inactive", () => {
    const doc = { ...DEFAULT_THEME_DOCUMENTS[0], id: "preview-b" };
    const theme = createDisplayTheme(doc);
    expect(getRegisteredCss()).toContain(`.${theme.className}`);

    const activeIdRef = { current: "theme-a" as string | null };
    createInactivePreviewThemeDispose(doc.id, activeIdRef)();

    expect(getRegisteredCss()).not.toContain(`.${theme.className}`);
  });
});
