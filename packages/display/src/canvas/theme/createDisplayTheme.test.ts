import { describe, expect, it, beforeEach } from "vite-plus/test";
import { getRegisteredCss, reset } from "typestyles";
import { createDisplayTheme } from "./createDisplayTheme";
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
});
