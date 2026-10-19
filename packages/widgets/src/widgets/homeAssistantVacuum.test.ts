import { describe, expect, it } from "vite-plus/test";
import {
  VACUUM_FEATURE,
  getVacuumSizeTier,
  vacuumBatteryLabel,
  vacuumStateLabel,
  vacuumSupports,
  type HomeAssistantVacuum,
} from "./homeAssistantVacuum";

const vacuum = (overrides: Partial<HomeAssistantVacuum>): HomeAssistantVacuum => ({
  entityId: "vacuum.x",
  name: "X",
  state: "docked",
  batteryLevel: null,
  fanSpeed: null,
  fanSpeedList: [],
  supportedFeatures: 0,
  available: true,
  ...overrides,
});

describe("vacuumStateLabel", () => {
  it("reads the common vacuum states", () => {
    expect(vacuumStateLabel(vacuum({ state: "cleaning" }))).toBe("Cleaning");
    expect(vacuumStateLabel(vacuum({ state: "docked" }))).toBe("Docked");
    expect(vacuumStateLabel(vacuum({ state: "returning" }))).toBe("Returning");
    expect(vacuumStateLabel(vacuum({ state: "error" }))).toBe("Error");
  });

  it("falls back and handles unavailable", () => {
    expect(vacuumStateLabel(vacuum({ state: "weird" }))).toBe("weird");
    expect(vacuumStateLabel(vacuum({ available: false }))).toBe("Unavailable");
  });
});

describe("vacuumBatteryLabel", () => {
  it("rounds a battery percentage", () => {
    expect(vacuumBatteryLabel(vacuum({ batteryLevel: 72.4 }))).toBe("72%");
    expect(vacuumBatteryLabel(vacuum({ batteryLevel: null }))).toBeNull();
  });
});

describe("vacuumSupports", () => {
  it("reads feature bits", () => {
    const v = vacuum({
      supportedFeatures: VACUUM_FEATURE.pause | VACUUM_FEATURE.returnHome,
    });
    expect(vacuumSupports(v, VACUUM_FEATURE.pause)).toBe(true);
    expect(vacuumSupports(v, VACUUM_FEATURE.returnHome)).toBe(true);
    expect(vacuumSupports(v, VACUUM_FEATURE.locate)).toBe(false);
  });
});

describe("getVacuumSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getVacuumSizeTier(2, 2)).toBe("compact");
    expect(getVacuumSizeTier(3, 3)).toBe("medium");
    expect(getVacuumSizeTier(4, 4)).toBe("full");
  });
});
