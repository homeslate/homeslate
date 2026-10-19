import { describe, expect, it } from "vite-plus/test";
import {
  FAN_FEATURE_OSCILLATE,
  FAN_FEATURE_PRESET_MODE,
  FAN_FEATURE_SET_SPEED,
  fanStateLabel,
  fanSupports,
  getFanSizeTier,
  type HomeAssistantFan,
} from "./homeAssistantFan";

const fan = (overrides: Partial<HomeAssistantFan>): HomeAssistantFan => ({
  entityId: "fan.x",
  name: "X",
  domain: "fan",
  isOn: false,
  brightnessPct: null,
  percentage: null,
  supportedFeatures: 0,
  control: "toggle",
  available: true,
  presetMode: null,
  presetModes: [],
  oscillating: null,
  ...overrides,
});

describe("fanStateLabel", () => {
  it("reads off, on with speed, and unavailable", () => {
    expect(fanStateLabel(fan({ isOn: false }))).toBe("Off");
    expect(fanStateLabel(fan({ isOn: true, percentage: 66 }))).toBe("On · 66%");
    expect(fanStateLabel(fan({ isOn: true }))).toBe("On");
    expect(fanStateLabel(fan({ available: false }))).toBe("Unavailable");
  });
});

describe("fanSupports", () => {
  it("reads feature bits", () => {
    const f = fan({
      supportedFeatures: FAN_FEATURE_SET_SPEED | FAN_FEATURE_OSCILLATE,
    });
    expect(fanSupports(f, FAN_FEATURE_SET_SPEED)).toBe(true);
    expect(fanSupports(f, FAN_FEATURE_OSCILLATE)).toBe(true);
    expect(fanSupports(f, FAN_FEATURE_PRESET_MODE)).toBe(false);
  });
});

describe("getFanSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getFanSizeTier(2, 1)).toBe("compact");
    expect(getFanSizeTier(3, 3)).toBe("medium");
    expect(getFanSizeTier(4, 4)).toBe("full");
  });
});
