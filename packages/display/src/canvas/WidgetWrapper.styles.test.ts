import { describe, expect, it } from "vite-plus/test";
import { getRegisteredCss } from "typestyles";
import { wrapper } from "./WidgetWrapper.styles";

describe("WidgetWrapper styles", () => {
  it("uses widget component tokens for wrapper border width and radius", () => {
    void wrapper;
    const css = getRegisteredCss();
    expect(css).toContain("--token-widget-border-width");
    expect(css).toContain("--token-widget-border-color");
    expect(css).toContain("--token-widget-radius");
  });
});
