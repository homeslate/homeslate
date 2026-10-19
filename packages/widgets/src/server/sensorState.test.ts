import { describe, expect, it } from "vite-plus/test";
import { mapSensorEntity } from "./sensorState";

describe("mapSensorEntity", () => {
  it("maps a numeric sensor with its unit and parsed value", () => {
    expect(
      mapSensorEntity({
        entity_id: "sensor.outdoor_temperature",
        state: "21.5",
        attributes: {
          friendly_name: "Outdoor Temperature",
          unit_of_measurement: "°C",
          device_class: "temperature",
          icon: "mdi:thermometer",
        },
      }),
    ).toEqual({
      entityId: "sensor.outdoor_temperature",
      name: "Outdoor Temperature",
      state: "21.5",
      unit: "°C",
      deviceClass: "temperature",
      icon: "mdi:thermometer",
      numericValue: 21.5,
      isOn: false,
    });
  });

  it("maps a binary sensor's on/off state", () => {
    expect(
      mapSensorEntity({
        entity_id: "binary_sensor.front_door",
        state: "on",
        attributes: { friendly_name: "Front Door", device_class: "door" },
      }),
    ).toMatchObject({ entityId: "binary_sensor.front_door", isOn: true, numericValue: null });
  });

  it("falls back to the entity id and nulls for missing attributes", () => {
    expect(
      mapSensorEntity({ entity_id: "input_number.target", state: "unavailable", attributes: {} }),
    ).toEqual({
      entityId: "input_number.target",
      name: "input_number.target",
      state: "unavailable",
      unit: null,
      deviceClass: null,
      icon: null,
      numericValue: null,
      isOn: false,
    });
  });

  it("rejects non-sensor domains and malformed input", () => {
    expect(mapSensorEntity({ entity_id: "light.kitchen", state: "on", attributes: {} })).toBeNull();
    expect(mapSensorEntity({ entity_id: "sensor.Bad", state: "1", attributes: {} })).toBeNull();
    expect(mapSensorEntity(null)).toBeNull();
  });
});
