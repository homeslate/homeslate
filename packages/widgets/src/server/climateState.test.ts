import { describe, expect, it } from "vite-plus/test";
import {
  CLIMATE_SERVICES,
  buildClimateServicePayload,
  isAllowedClimateService,
  isValidClimateEntityId,
  mapClimateEntity,
} from "./climateState";

const heatEntity = {
  entity_id: "climate.living_room",
  state: "heat",
  attributes: {
    friendly_name: "Living Room",
    current_temperature: 19.4,
    temperature: 21,
    target_temp_step: 0.5,
    temperature_unit: "C",
    min_temp: 7,
    max_temp: 35,
    hvac_action: "heating",
    hvac_modes: ["off", "heat", "cool"],
    current_humidity: 42,
  },
};

describe("isValidClimateEntityId", () => {
  it("accepts slug climate ids and rejects everything else", () => {
    expect(isValidClimateEntityId("climate.living_room")).toBe(true);
    expect(isValidClimateEntityId("climate.thermostat_2")).toBe(true);
    expect(isValidClimateEntityId("climate.Living Room")).toBe(false);
    expect(isValidClimateEntityId("light.kitchen")).toBe(false);
    expect(isValidClimateEntityId("climate../secrets")).toBe(false);
    expect(isValidClimateEntityId("climate.")).toBe(false);
    expect(isValidClimateEntityId("")).toBe(false);
  });
});

describe("isAllowedClimateService", () => {
  it("allows only the climate service allowlist", () => {
    expect(CLIMATE_SERVICES).toContain("set_temperature");
    expect(isAllowedClimateService("set_temperature")).toBe(true);
    expect(isAllowedClimateService("set_hvac_mode")).toBe(true);
    expect(isAllowedClimateService("reload")).toBe(false);
    expect(isAllowedClimateService("delete")).toBe(false);
    expect(isAllowedClimateService("")).toBe(false);
  });
});

describe("buildClimateServicePayload", () => {
  it("keeps only allowlisted keys and requires an entity id", () => {
    expect(
      buildClimateServicePayload("set_temperature", "climate.den", {
        temperature: 21,
        bogus: true,
      }),
    ).toEqual({ entity_id: "climate.den", temperature: 21 });
    expect(
      buildClimateServicePayload("set_temperature", "light.x", { temperature: 21 }),
    ).toBeNull();
    expect(buildClimateServicePayload("reload", "climate.den", {})).toBeNull();
  });

  it("drops non-numeric setpoints and rejects an empty set_temperature", () => {
    expect(
      buildClimateServicePayload("set_temperature", "climate.den", { temperature: "warm" }),
    ).toBeNull();
    expect(
      buildClimateServicePayload("set_temperature", "climate.den", {
        target_temp_low: 18,
        target_temp_high: 24,
      }),
    ).toEqual({ entity_id: "climate.den", target_temp_low: 18, target_temp_high: 24 });
  });

  it("passes mode strings and nothing for turn_on / turn_off", () => {
    expect(
      buildClimateServicePayload("set_hvac_mode", "climate.den", { hvac_mode: "cool" }),
    ).toEqual({ entity_id: "climate.den", hvac_mode: "cool" });
    expect(buildClimateServicePayload("turn_off", "climate.den", {})).toEqual({
      entity_id: "climate.den",
    });
    expect(buildClimateServicePayload("set_fan_mode", "climate.den", { fan_mode: "" })).toEqual({
      entity_id: "climate.den",
    });
  });
});

describe("mapClimateEntity", () => {
  it("maps the common attributes", () => {
    expect(mapClimateEntity(heatEntity)).toMatchObject({
      entityId: "climate.living_room",
      name: "Living Room",
      hvacMode: "heat",
      action: "heating",
      currentTemperature: 19.4,
      currentHumidity: 42,
      targetTemperature: 21,
      targetTemperatureLow: null,
      targetTemperatureHigh: null,
      unit: "°C",
      hvacModes: ["off", "heat", "cool"],
      minTemp: 7,
      maxTemp: 35,
      step: 0.5,
    });
  });

  it("captures a heat_cool dual setpoint", () => {
    const state = mapClimateEntity({
      entity_id: "climate.hall",
      state: "heat_cool",
      attributes: {
        target_temp_low: 18,
        target_temp_high: 24,
        hvac_modes: ["off", "heat_cool"],
        temperature_unit: "C",
      },
    });
    expect(state).toMatchObject({
      hvacMode: "heat_cool",
      targetTemperatureLow: 18,
      targetTemperatureHigh: 24,
    });
  });

  it("defaults unit bounds and step for Fahrenheit", () => {
    const state = mapClimateEntity({
      entity_id: "climate.us",
      state: "cool",
      attributes: { current_temperature: 72 },
    });
    expect(state).toMatchObject({ unit: "°F", minTemp: 45, maxTemp: 95, step: 0.5 });
  });

  it("keeps unavailable states but leaves readings null", () => {
    expect(mapClimateEntity({ entity_id: "climate.den", state: "unavailable" })).toMatchObject({
      hvacMode: "unavailable",
      currentTemperature: null,
      targetTemperature: null,
      hvacModes: [],
    });
  });

  it("ignores non-numeric readings", () => {
    const state = mapClimateEntity({
      entity_id: "climate.bad",
      state: "heat",
      attributes: { current_temperature: "warm", temperature: null },
    });
    expect(state).toMatchObject({ currentTemperature: null, targetTemperature: null });
  });

  it("returns null for non-climate or malformed states", () => {
    expect(mapClimateEntity(null)).toBeNull();
    expect(mapClimateEntity("climate.x")).toBeNull();
    expect(mapClimateEntity({ entity_id: "light.kitchen", state: "on" })).toBeNull();
  });
});
