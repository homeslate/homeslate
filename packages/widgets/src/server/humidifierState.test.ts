import { describe, expect, it } from "vite-plus/test";
import { mapHumidifierEntity } from "./humidifierState";

describe("mapHumidifierEntity", () => {
  it("maps humidity, mode, and bounds", () => {
    expect(
      mapHumidifierEntity({
        entity_id: "humidifier.bedroom",
        state: "on",
        attributes: {
          friendly_name: "Bedroom Humidifier",
          current_humidity: 38,
          humidity: 45,
          min_humidity: 30,
          max_humidity: 70,
          mode: "auto",
          available_modes: ["auto", "sleep"],
        },
      }),
    ).toEqual({
      entityId: "humidifier.bedroom",
      name: "Bedroom Humidifier",
      state: "on",
      isOn: true,
      currentHumidity: 38,
      targetHumidity: 45,
      minHumidity: 30,
      maxHumidity: 70,
      mode: "auto",
      availableModes: ["auto", "sleep"],
      available: true,
    });
  });

  it("defaults humidity bounds", () => {
    expect(
      mapHumidifierEntity({ entity_id: "humidifier.bedroom", state: "off", attributes: {} }),
    ).toMatchObject({
      isOn: false,
      currentHumidity: null,
      targetHumidity: null,
      minHumidity: 0,
      maxHumidity: 100,
      available: true,
    });
  });

  it("flags unavailable humidifiers and rejects other domains", () => {
    expect(
      mapHumidifierEntity({
        entity_id: "humidifier.bedroom",
        state: "unavailable",
        attributes: {},
      }),
    ).toMatchObject({ available: false });
    expect(
      mapHumidifierEntity({ entity_id: "fan.bedroom", state: "on", attributes: {} }),
    ).toBeNull();
    expect(mapHumidifierEntity(null)).toBeNull();
  });
});
