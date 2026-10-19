import { describe, expect, it } from "vite-plus/test";
import {
  binarySensorLabel,
  formatSensorValue,
  type HomeAssistantSensor,
} from "./homeAssistantSensor";

const sensor = (overrides: Partial<HomeAssistantSensor>): HomeAssistantSensor => ({
  entityId: "sensor.x",
  name: "X",
  state: "0",
  unit: null,
  deviceClass: null,
  icon: null,
  numericValue: null,
  isOn: false,
  ...overrides,
});

describe("binarySensorLabel", () => {
  it("reads door and moisture classes as open/wet", () => {
    expect(binarySensorLabel("door", true)).toBe("Open");
    expect(binarySensorLabel("door", false)).toBe("Closed");
    expect(binarySensorLabel("moisture", true)).toBe("Wet");
    expect(binarySensorLabel("moisture", false)).toBe("Dry");
  });

  it("reads motion and smoke classes as detected/clear", () => {
    expect(binarySensorLabel("motion", true)).toBe("Detected");
    expect(binarySensorLabel("smoke", false)).toBe("Clear");
  });

  it("falls back to on/off for unknown classes", () => {
    expect(binarySensorLabel(null, true)).toBe("On");
    expect(binarySensorLabel("plug", false)).toBe("Off");
  });
});

describe("formatSensorValue", () => {
  it("rounds numeric values and appends the unit", () => {
    expect(formatSensorValue(sensor({ numericValue: 21.46, unit: "°C" }))).toBe("21.5°C");
    expect(formatSensorValue(sensor({ numericValue: 12, unit: null }))).toBe("12");
  });

  it("falls back to the raw state", () => {
    expect(formatSensorValue(sensor({ state: "unavailable", unit: null }))).toBe("unavailable");
    expect(formatSensorValue(sensor({ state: "low", unit: "%" }))).toBe("low%");
  });
});
