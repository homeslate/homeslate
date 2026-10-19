import { describe, expect, it } from "vite-plus/test";
import { mapFanEntity } from "./fanState";

describe("mapFanEntity", () => {
  it("extends the device shape with fan controls", () => {
    expect(
      mapFanEntity({
        entity_id: "fan.bedroom",
        state: "on",
        attributes: {
          friendly_name: "Bedroom Fan",
          percentage: 66,
          preset_mode: "sleep",
          preset_modes: ["normal", "sleep"],
          oscillating: true,
          supported_features: 11,
        },
      }),
    ).toMatchObject({
      entityId: "fan.bedroom",
      name: "Bedroom Fan",
      domain: "fan",
      isOn: true,
      percentage: 66,
      brightnessPct: null,
      presetMode: "sleep",
      presetModes: ["normal", "sleep"],
      oscillating: true,
      supportedFeatures: 11,
      available: true,
    });
  });

  it("defaults optional fan attributes", () => {
    expect(mapFanEntity({ entity_id: "fan.bedroom", state: "off", attributes: {} })).toMatchObject({
      presetMode: null,
      presetModes: [],
      oscillating: null,
    });
  });

  it("rejects non-fan domains and malformed input", () => {
    expect(mapFanEntity({ entity_id: "light.kitchen", state: "on", attributes: {} })).toBeNull();
    expect(mapFanEntity({ entity_id: "fan.Bad", state: "on", attributes: {} })).toBeNull();
    expect(mapFanEntity(null)).toBeNull();
  });
});
