import { describe, expect, it } from "vite-plus/test";
import { mapWaterHeaterEntity } from "./waterHeaterState";

describe("mapWaterHeaterEntity", () => {
  it("maps temperatures, unit, and operation modes", () => {
    expect(
      mapWaterHeaterEntity({
        entity_id: "water_heater.basement",
        state: "eco",
        attributes: {
          friendly_name: "Basement Heater",
          current_temperature: 48,
          temperature: 52,
          min_temp: 30,
          max_temp: 60,
          target_temp_step: 0.5,
          temperature_unit: "C",
          operation_mode: "eco",
          operation_list: ["eco", "performance"],
        },
      }),
    ).toEqual({
      entityId: "water_heater.basement",
      name: "Basement Heater",
      state: "eco",
      isOn: true,
      currentTemperature: 48,
      targetTemperature: 52,
      minTemp: 30,
      maxTemp: 60,
      step: 0.5,
      unit: "°C",
      operationMode: "eco",
      operationModes: ["eco", "performance"],
      available: true,
    });
  });

  it("defaults bounds and treats off as off", () => {
    expect(
      mapWaterHeaterEntity({ entity_id: "water_heater.basement", state: "off", attributes: {} }),
    ).toMatchObject({
      isOn: false,
      minTemp: 86,
      maxTemp: 140,
      step: 1,
      unit: "°F",
      available: true,
    });
  });

  it("flags unavailable heaters and rejects other domains", () => {
    expect(
      mapWaterHeaterEntity({
        entity_id: "water_heater.basement",
        state: "unavailable",
        attributes: {},
      }),
    ).toMatchObject({ available: false });
    expect(
      mapWaterHeaterEntity({ entity_id: "humidifier.bedroom", state: "on", attributes: {} }),
    ).toBeNull();
    expect(mapWaterHeaterEntity(undefined)).toBeNull();
  });
});
