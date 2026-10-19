import { describe, expect, it } from "vite-plus/test";
import {
  lawnMowerIsActive,
  lawnMowerStateLabel,
  type HomeAssistantLawnMower,
} from "./homeAssistantLawnMower";

const mower = (overrides: Partial<HomeAssistantLawnMower>): HomeAssistantLawnMower => ({
  entityId: "lawn_mower.x",
  name: "X",
  state: "docked",
  available: true,
  ...overrides,
});

describe("lawnMowerStateLabel", () => {
  it("reads the lawn mower states", () => {
    expect(lawnMowerStateLabel(mower({ state: "mowing" }))).toBe("Mowing");
    expect(lawnMowerStateLabel(mower({ state: "paused" }))).toBe("Paused");
    expect(lawnMowerStateLabel(mower({ state: "docked" }))).toBe("Docked");
    expect(lawnMowerStateLabel(mower({ state: "returning" }))).toBe("Returning");
    expect(lawnMowerStateLabel(mower({ state: "error" }))).toBe("Error");
  });

  it("falls back and handles unavailable", () => {
    expect(lawnMowerStateLabel(mower({ state: "weird" }))).toBe("weird");
    expect(lawnMowerStateLabel(mower({ available: false }))).toBe("Unavailable");
  });
});

describe("lawnMowerIsActive", () => {
  it("treats mowing and returning as active", () => {
    expect(lawnMowerIsActive(mower({ state: "mowing" }))).toBe(true);
    expect(lawnMowerIsActive(mower({ state: "returning" }))).toBe(true);
    expect(lawnMowerIsActive(mower({ state: "docked" }))).toBe(false);
  });
});
