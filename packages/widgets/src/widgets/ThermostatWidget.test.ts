import { describe, expect, it } from "vite-plus/test";
import { getWidgetByType } from "@homeslate/widgets";
import { THERMOSTAT_EMPTY_COPY, THERMOSTAT_MISSING_CONFIG_COPY } from "./homeAssistant";

describe("thermostat widget", () => {
  it("registers thermostat defaults", () => {
    expect(getWidgetByType("thermostat")).toMatchObject({
      type: "thermostat",
      name: "Thermostat",
      defaultConfig: {
        entityId: "",
        showControls: true,
        showFanControl: true,
        showPresetControl: true,
        showSwingControl: false,
        showHumidity: true,
        transparentBackground: false,
      },
      defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 },
    });
  });

  it("keeps empty and missing-config copy aligned with the spec", () => {
    expect(THERMOSTAT_EMPTY_COPY).toBe("Pick a thermostat in settings.");
    expect(THERMOSTAT_MISSING_CONFIG_COPY).toBe(
      "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.",
    );
  });
});
