import { describe, expect, it } from "vite-plus/test";
import { getRegisteredCss } from "typestyles";
import { wrapper } from "./WidgetWrapper.styles";

describe("WidgetWrapper styles", () => {
  it("uses widget component tokens for wrapper border width and radius", () => {
    void wrapper;
    const css = getRegisteredCss();
    expect(css).toContain("--var-ui-widget-borderWidth");
    expect(css).toContain("--var-ui-widget-borderColor");
    expect(css).toContain("--var-ui-widget-radius");
  });
});
