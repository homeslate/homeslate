import { describe, expect, it } from "vite-plus/test";
import { getWidgetByType } from "@homeslate/widgets";
import {
  WEATHER_ALERTS_COVERAGE_COPY,
  WEATHER_ALERTS_EMPTY_COPY,
  WEATHER_ALERTS_NEED_LOCATION_COPY,
} from "./weatherAlerts";

describe("weather alerts widget", () => {
  it("registers weather-alerts defaults", () => {
    expect(getWidgetByType("weather-alerts")).toMatchObject({
      type: "weather-alerts",
      name: "Weather Alerts",
      defaultConfig: {
        location: "",
        latitude: null,
        longitude: null,
        maxAlerts: 5,
        transparentBackground: false,
      },
      defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 },
    });
  });

  it("keeps empty, coverage, and need-location copy aligned with the spec", () => {
    expect(WEATHER_ALERTS_NEED_LOCATION_COPY).toBe("Search for a location");
    expect(WEATHER_ALERTS_COVERAGE_COPY).toBe("Alerts are available for US locations.");
    expect(WEATHER_ALERTS_EMPTY_COPY).toBe("No active alerts");
  });
});
