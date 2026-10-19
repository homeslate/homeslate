import { describe, expect, it } from "vite-plus/test";
import {
  clampWaterHeaterTemperature,
  getWaterHeaterSizeTier,
  waterHeaterModeLabel,
  waterHeaterStateLabel,
  waterHeaterTemperatureLabel,
  type HomeAssistantWaterHeater,
} from "./homeAssistantWaterHeater";

const waterHeater = (overrides: Partial<HomeAssistantWaterHeater>): HomeAssistantWaterHeater => ({
  entityId: "water_heater.x",
  name: "X",
  state: "off",
  isOn: false,
  currentTemperature: null,
  targetTemperature: null,
  minTemp: 30,
  maxTemp: 60,
  step: 1,
  unit: "°C",
  operationMode: null,
  operationModes: [],
  available: true,
  ...overrides,
});

describe("waterHeaterStateLabel", () => {
  it("reads the operation mode, off, and unavailable", () => {
    expect(waterHeaterStateLabel(waterHeater({ isOn: true, operationMode: "heat_pump" }))).toBe(
      "Heat pump",
    );
    expect(waterHeaterStateLabel(waterHeater({ isOn: true }))).toBe("On");
    expect(waterHeaterStateLabel(waterHeater({ isOn: false }))).toBe("Off");
    expect(waterHeaterStateLabel(waterHeater({ available: false }))).toBe("Unavailable");
  });
});

describe("waterHeaterModeLabel", () => {
  it("title-cases mode slugs", () => {
    expect(waterHeaterModeLabel("eco")).toBe("Eco");
    expect(waterHeaterModeLabel("heat_pump")).toBe("Heat pump");
  });
});

describe("waterHeaterTemperatureLabel", () => {
  it("formats the target with its unit", () => {
    expect(waterHeaterTemperatureLabel(waterHeater({ targetTemperature: 52 }))).toBe("52°C");
    expect(waterHeaterTemperatureLabel(waterHeater({ targetTemperature: null }))).toBe("—");
  });
});

describe("clampWaterHeaterTemperature", () => {
  it("clamps to the configured bounds", () => {
    expect(clampWaterHeaterTemperature(52, 30, 60)).toBe(52);
    expect(clampWaterHeaterTemperature(10, 30, 60)).toBe(30);
    expect(clampWaterHeaterTemperature(90, 30, 60)).toBe(60);
  });
});

describe("getWaterHeaterSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getWaterHeaterSizeTier(2, 2)).toBe("compact");
    expect(getWaterHeaterSizeTier(3, 3)).toBe("medium");
    expect(getWaterHeaterSizeTier(4, 4)).toBe("full");
  });
});
