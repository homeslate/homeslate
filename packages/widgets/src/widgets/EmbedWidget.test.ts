import { describe, expect, it } from "vite-plus/test";
import { getWidgetByType } from "@homeslate/widgets";
import { EMBED_EMPTY_COPY, EMBED_INVALID_COPY } from "./embedUrl";

describe("embed widget", () => {
  it("registers embed defaults", () => {
    expect(getWidgetByType("embed")).toMatchObject({
      type: "embed",
      name: "Embed",
      defaultConfig: {
        url: "",
        refreshSeconds: 0,
        allowInteraction: false,
        transparentBackground: false,
      },
      defaultLayout: { w: 4, h: 4, minW: 2, minH: 2 },
    });
  });

  it("keeps empty and invalid copy aligned with the spec", () => {
    expect(EMBED_EMPTY_COPY).toBe("Paste a page URL in settings.");
    expect(EMBED_INVALID_COPY).toBe("This URL cannot be embedded");
  });
});
