import { describe, expect, it } from "vite-plus/test";
import { getRegisteredCss } from "typestyles";
import { clock } from "./ClockWidget.styles";

describe("ClockWidget styles", () => {
  it("renders the clock time with plain text color", () => {
    void clock().time;
    const css = getRegisteredCss();
    expect(css).toContain("var(--var-ui-color-text-primary)");
    expect(css).not.toContain("-webkit-text-fill-color: transparent");
    expect(css).not.toContain("background-clip: text");
  });
});
