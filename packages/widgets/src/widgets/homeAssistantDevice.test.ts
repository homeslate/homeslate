import { describe, expect, it } from "vite-plus/test";
import {
  deviceService,
  deviceStatusLabel,
  getDevicesSizeTier,
  type HomeAssistantDevice,
} from "./homeAssistantDevice";

const device = (overrides: Partial<HomeAssistantDevice>): HomeAssistantDevice => ({
  entityId: "light.x",
  name: "X",
  domain: "light",
  isOn: false,
  brightnessPct: null,
  percentage: null,
  supportedFeatures: 0,
  control: "toggle",
  available: true,
  ...overrides,
});

describe("deviceService", () => {
  it("picks turn_on / turn_off", () => {
    expect(deviceService("light", true)).toBe("turn_on");
    expect(deviceService("switch", false)).toBe("turn_off");
  });
});

describe("deviceStatusLabel", () => {
  it("reads on, off, and unavailable", () => {
    expect(deviceStatusLabel(device({ isOn: true }))).toBe("On");
    expect(deviceStatusLabel(device({ isOn: false }))).toBe("Off");
    expect(deviceStatusLabel(device({ available: false }))).toBe("Unavailable");
  });
});

describe("getDevicesSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getDevicesSizeTier(2, 2)).toBe("compact");
    expect(getDevicesSizeTier(3, 3)).toBe("medium");
    expect(getDevicesSizeTier(4, 4)).toBe("full");
  });
});
