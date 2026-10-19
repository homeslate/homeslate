import { describe, expect, it } from "vite-plus/test";
import {
  clampHumidity,
  getHumidifierSizeTier,
  humidifierModeLabel,
  humidifierStateLabel,
  type HomeAssistantHumidifier,
} from "./homeAssistantHumidifier";

const humidifier = (overrides: Partial<HomeAssistantHumidifier>): HomeAssistantHumidifier => ({
  entityId: "humidifier.x",
  name: "X",
  state: "off",
  isOn: false,
  currentHumidity: null,
  targetHumidity: null,
  minHumidity: 0,
  maxHumidity: 100,
  mode: null,
  availableModes: [],
  available: true,
  ...overrides,
});

describe("humidifierStateLabel", () => {
  it("reads on with target, off, and unavailable", () => {
    expect(humidifierStateLabel(humidifier({ isOn: true, targetHumidity: 45 }))).toBe("On · 45%");
    expect(humidifierStateLabel(humidifier({ isOn: true }))).toBe("On");
    expect(humidifierStateLabel(humidifier({ isOn: false }))).toBe("Off");
    expect(humidifierStateLabel(humidifier({ available: false }))).toBe("Unavailable");
  });
});

describe("clampHumidity", () => {
  it("rounds and clamps to the configured bounds", () => {
    expect(clampHumidity(45.6, 30, 70)).toBe(46);
    expect(clampHumidity(10, 30, 70)).toBe(30);
    expect(clampHumidity(90, 30, 70)).toBe(70);
  });
});

describe("humidifierModeLabel", () => {
  it("title-cases mode slugs", () => {
    expect(humidifierModeLabel("auto")).toBe("Auto");
    expect(humidifierModeLabel("sleep_mode")).toBe("Sleep mode");
  });
});

describe("getHumidifierSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getHumidifierSizeTier(2, 2)).toBe("compact");
    expect(getHumidifierSizeTier(3, 3)).toBe("medium");
    expect(getHumidifierSizeTier(4, 4)).toBe("full");
  });
});
