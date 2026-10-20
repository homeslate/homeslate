import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { OfflineBanner, offlineBannerMessage } from "./OfflineBanner";

describe("OfflineBanner", () => {
  it("chooses offline, reconnecting, and saved copy", () => {
    expect(offlineBannerMessage({ online: false, loadFailed: false, showingSaved: true })).toBe(
      "Offline — showing last saved data",
    );
    expect(offlineBannerMessage({ online: true, loadFailed: true, showingSaved: true })).toBe(
      "Reconnecting…",
    );
    expect(offlineBannerMessage({ online: true, loadFailed: false, showingSaved: true })).toBe(
      "Showing saved version",
    );
    expect(
      offlineBannerMessage({ online: true, loadFailed: false, showingSaved: false }),
    ).toBeNull();
  });

  it("renders a status banner and hides when there is nothing to say", () => {
    const visible = renderToStaticMarkup(
      createElement(OfflineBanner, { online: false, loadFailed: false, showingSaved: true }),
    );
    expect(visible).toContain('role="status"');
    expect(visible).toContain("Offline — showing last saved data");

    const hidden = renderToStaticMarkup(
      createElement(OfflineBanner, { online: true, loadFailed: false, showingSaved: false }),
    );
    expect(hidden).toBe("");
  });
});
