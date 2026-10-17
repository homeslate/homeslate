import { describe, expect, it } from "vite-plus/test";
import {
  THERMOSTAT_EMPTY_COPY,
  THERMOSTAT_MISSING_CONFIG_COPY,
  THERMOSTAT_UNAVAILABLE_COPY,
  clampSetpoint,
  formatTemperature,
  getThermostatSizeTier,
  homeAssistantEntitiesUrl,
  homeAssistantServiceUrl,
  hvacActionLabel,
  hvacModeLabel,
  isDualSetpoint,
  stepSetpoint,
  thermostatApiUrl,
} from "./homeAssistant";

describe("thermostat copy", () => {
  it("matches the spec strings", () => {
    expect(THERMOSTAT_EMPTY_COPY).toBe("Pick a thermostat in settings.");
    expect(THERMOSTAT_MISSING_CONFIG_COPY).toBe(
      "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.",
    );
    expect(THERMOSTAT_UNAVAILABLE_COPY).toBe("Unavailable");
  });
});

describe("home assistant api urls", () => {
  it("builds same-origin state, entity, and service urls", () => {
    expect(thermostatApiUrl("climate.living_room")).toBe(
      "/api/homeassistant/states/climate.living_room",
    );
    expect(homeAssistantEntitiesUrl("climate")).toBe("/api/homeassistant/entities?domain=climate");
    expect(homeAssistantServiceUrl("climate", "set_temperature")).toBe(
      "/api/homeassistant/services/climate/set_temperature",
    );
  });
});

describe("formatTemperature", () => {
  it("rounds to one decimal and appends the unit", () => {
    expect(formatTemperature(21.5, "°C")).toBe("21.5°C");
    expect(formatTemperature(70, "°F")).toBe("70°F");
    expect(formatTemperature(21.46, "°C")).toBe("21.5°C");
  });
});

describe("hvacActionLabel", () => {
  it("maps known actions and title-cases unknown ones", () => {
    expect(hvacActionLabel("heating")).toBe("Heating");
    expect(hvacActionLabel("cooling")).toBe("Cooling");
    expect(hvacActionLabel(null)).toBeNull();
    expect(hvacActionLabel("preheating")).toBe("Preheating");
    expect(hvacActionLabel("some_new_action")).toBe("Some new action");
  });
});

describe("hvac labels and dual setpoint", () => {
  it("labels known hvac modes and title-cases unknown ones", () => {
    expect(hvacModeLabel("heat_cool")).toBe("Heat / Cool");
    expect(hvacModeLabel("fan_only")).toBe("Fan only");
    expect(hvacModeLabel("off")).toBe("Off");
    expect(hvacModeLabel("boost")).toBe("Boost");
  });

  it("detects a dual setpoint by mode or by populated range", () => {
    expect(
      isDualSetpoint({
        hvacMode: "heat_cool",
        targetTemperatureLow: null,
        targetTemperatureHigh: null,
      }),
    ).toBe(true);
    expect(
      isDualSetpoint({ hvacMode: "auto", targetTemperatureLow: null, targetTemperatureHigh: null }),
    ).toBe(true);
    expect(
      isDualSetpoint({ hvacMode: "heat", targetTemperatureLow: 18, targetTemperatureHigh: 24 }),
    ).toBe(true);
    expect(
      isDualSetpoint({ hvacMode: "heat", targetTemperatureLow: null, targetTemperatureHigh: null }),
    ).toBe(false);
  });
});

describe("getThermostatSizeTier", () => {
  it("classifies compact, medium, and full layouts", () => {
    expect(getThermostatSizeTier(3, 2)).toBe("compact");
    expect(getThermostatSizeTier(2, 5)).toBe("compact");
    expect(getThermostatSizeTier(3, 3)).toBe("medium");
    expect(getThermostatSizeTier(6, 3)).toBe("medium");
    expect(getThermostatSizeTier(4, 4)).toBe("full");
  });
});

describe("setpoint helpers", () => {
  it("clamps to the min/max range", () => {
    expect(clampSetpoint(5, 10, 30)).toBe(10);
    expect(clampSetpoint(40, 10, 30)).toBe(30);
    expect(clampSetpoint(20, 10, 30)).toBe(20);
  });

  it("steps in increments and stays clamped", () => {
    expect(stepSetpoint(20, 0.5, 7, 35, 0.5)).toBe(20.5);
    expect(stepSetpoint(34.8, 0.5, 7, 35, 0.5)).toBe(35);
    expect(stepSetpoint(7.2, -0.5, 7, 35, 0.5)).toBe(7);
  });

  it("snaps to the step without float noise", () => {
    expect(stepSetpoint(21, 0.1, 5, 40, 0.1)).toBe(21.1);
  });
});
