import { describe, expect, it } from "vite-plus/test";
import { mapHomeAssistantEntity, mapHomeAssistantState } from "./homeAssistantEntity";

describe("mapHomeAssistantState", () => {
  it("keeps the entity id, state, and attribute bag", () => {
    expect(
      mapHomeAssistantState({
        entity_id: "sensor.room",
        state: "21",
        attributes: { unit_of_measurement: "°C" },
      }),
    ).toEqual({
      entity_id: "sensor.room",
      state: "21",
      attributes: { unit_of_measurement: "°C" },
    });
  });

  it("defaults the state and attributes and rejects junk", () => {
    expect(mapHomeAssistantState({ entity_id: "sensor.room" })).toEqual({
      entity_id: "sensor.room",
      state: "unknown",
      attributes: {},
    });
    expect(mapHomeAssistantState(null)).toBeNull();
    expect(mapHomeAssistantState("sensor.room")).toBeNull();
    expect(mapHomeAssistantState({})).toBeNull();
    expect(mapHomeAssistantState({ entity_id: "" })).toBeNull();
  });
});

describe("mapHomeAssistantEntity", () => {
  it("promotes the common fields and whitelists attributes", () => {
    const entity = mapHomeAssistantEntity({
      entity_id: "sensor.room",
      state: "21.4",
      attributes: {
        friendly_name: "Room",
        unit_of_measurement: "°C",
        device_class: "temperature",
        supported_features: 0,
        icon: "mdi:thermometer",
        secret_token: "should-not-leak",
        battery_level: 90,
      },
    });
    expect(entity).toEqual({
      entityId: "sensor.room",
      name: "Room",
      state: "21.4",
      unit: "°C",
      deviceClass: "temperature",
      supportedFeatures: 0,
      attributes: {
        unit_of_measurement: "°C",
        device_class: "temperature",
        supported_features: 0,
        icon: "mdi:thermometer",
      },
    });
    expect(entity?.attributes).not.toHaveProperty("secret_token");
    expect(entity?.attributes).not.toHaveProperty("battery_level");
  });

  it("falls back to the entity id and nulls missing fields", () => {
    expect(mapHomeAssistantEntity({ entity_id: "sensor.room", state: "on" })).toEqual({
      entityId: "sensor.room",
      name: "sensor.room",
      state: "on",
      unit: null,
      deviceClass: null,
      supportedFeatures: null,
      attributes: {},
    });
  });

  it("ignores a non-numeric supported_features", () => {
    const entity = mapHomeAssistantEntity({
      entity_id: "light.kitchen",
      state: "on",
      attributes: { supported_features: "many" },
    });
    expect(entity?.supportedFeatures).toBeNull();
  });

  it("returns null for malformed states", () => {
    expect(mapHomeAssistantEntity(null)).toBeNull();
    expect(mapHomeAssistantEntity({})).toBeNull();
  });
});
