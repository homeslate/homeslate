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
});
