import { describe, expect, it } from "vite-plus/test";
import { mapVacuumEntity } from "./vacuumState";

describe("mapVacuumEntity", () => {
  it("maps state, battery, and fan speeds", () => {
    expect(
      mapVacuumEntity({
        entity_id: "vacuum.downstairs",
        state: "cleaning",
        attributes: {
          friendly_name: "Downstairs",
          battery_level: 72,
          fan_speed: "turbo",
          fan_speed_list: ["quiet", "turbo"],
          supported_features: 2047,
        },
      }),
    ).toEqual({
      entityId: "vacuum.downstairs",
      name: "Downstairs",
      state: "cleaning",
      batteryLevel: 72,
      fanSpeed: "turbo",
      fanSpeedList: ["quiet", "turbo"],
      supportedFeatures: 2047,
      available: true,
    });
  });

  it("defaults optional telemetry", () => {
    expect(
      mapVacuumEntity({ entity_id: "vacuum.downstairs", state: "docked", attributes: {} }),
    ).toMatchObject({
      name: "vacuum.downstairs",
      batteryLevel: null,
      fanSpeed: null,
      fanSpeedList: [],
      available: true,
    });
  });

  it("flags unavailable vacuums and rejects other domains", () => {
    expect(
      mapVacuumEntity({ entity_id: "vacuum.downstairs", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false });
    expect(mapVacuumEntity({ entity_id: "fan.bedroom", state: "on", attributes: {} })).toBeNull();
    expect(mapVacuumEntity(undefined)).toBeNull();
  });
});
