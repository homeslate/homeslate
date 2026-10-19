import { describe, expect, it } from "vite-plus/test";
import {
  updateIsAvailable,
  updateProgressPct,
  updateStateLabel,
  updateVersionLabel,
  type HomeAssistantUpdate,
} from "./homeAssistantUpdate";

const update = (overrides: Partial<HomeAssistantUpdate>): HomeAssistantUpdate => ({
  entityId: "update.x",
  name: "X",
  state: "off",
  installedVersion: null,
  latestVersion: null,
  inProgress: false,
  updatePercentage: null,
  available: true,
  ...overrides,
});

describe("updateIsAvailable", () => {
  it("is true only for an available on state", () => {
    expect(updateIsAvailable(update({ state: "on" }))).toBe(true);
    expect(updateIsAvailable(update({ state: "off" }))).toBe(false);
    expect(updateIsAvailable(update({ state: "on", available: false }))).toBe(false);
  });
});

describe("updateStateLabel", () => {
  it("reads available, up-to-date, installing, and unavailable", () => {
    expect(updateStateLabel(update({ state: "on" }))).toBe("Update available");
    expect(updateStateLabel(update({ state: "off" }))).toBe("Up to date");
    expect(updateStateLabel(update({ state: "on", inProgress: true }))).toBe("Installing");
    expect(
      updateStateLabel(update({ state: "on", inProgress: true, updatePercentage: 42.4 })),
    ).toBe("Installing · 42%");
    expect(updateStateLabel(update({ available: false }))).toBe("Unavailable");
  });
});

describe("updateVersionLabel", () => {
  it("joins installed and latest versions", () => {
    expect(updateVersionLabel(update({ installedVersion: "1.0", latestVersion: "1.1" }))).toBe(
      "1.0 → 1.1",
    );
    expect(updateVersionLabel(update({ latestVersion: "1.1" }))).toBe("1.1");
    expect(updateVersionLabel(update({}))).toBeNull();
  });
});

describe("updateProgressPct", () => {
  it("only reports progress while installing", () => {
    expect(updateProgressPct(update({ inProgress: true, updatePercentage: 42 }))).toBe(42);
    expect(updateProgressPct(update({ inProgress: false, updatePercentage: 42 }))).toBeNull();
    expect(updateProgressPct(update({ inProgress: true, updatePercentage: null }))).toBeNull();
  });
});
