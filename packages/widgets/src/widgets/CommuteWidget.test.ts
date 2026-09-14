import { describe, expect, it } from "vite-plus/test";
import { getWidgetByType } from "@homeslate/widgets";
import { COMMUTE_EMPTY_COPY, COMMUTE_MISSING_KEY_COPY } from "./commute";

describe("commute widget", () => {
  it("registers commute defaults", () => {
    expect(getWidgetByType("commute")).toMatchObject({
      type: "commute",
      name: "Commute",
      defaultConfig: { routes: [], units: "imperial", transparentBackground: false },
      defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 },
    });
  });

  it("keeps empty and 501 copy aligned with the spec", () => {
    expect(COMMUTE_EMPTY_COPY).toBe("Add a route in settings.");
    expect(COMMUTE_MISSING_KEY_COPY).toBe("Set OPENROUTESERVICE_API_KEY on the server.");
  });
});
