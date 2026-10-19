import { describe, expect, it } from "vite-plus/test";
import {
  calculateEnergyCost,
  formatCost,
  formatEnergy,
  formatPower,
  normalizeEnergyKwh,
  normalizePowerKw,
} from "./energy";

describe("normalizePowerKw", () => {
  it("converts W and MW to kW", () => {
    expect(normalizePowerKw(1500, "W")).toBe(1.5);
    expect(normalizePowerKw(2.5, "kW")).toBe(2.5);
    expect(normalizePowerKw(0.002, "MW")).toBe(2);
    expect(normalizePowerKw(null, "W")).toBeNull();
  });
});

describe("formatPower", () => {
  it("formats recognized power units in kW", () => {
    expect(formatPower(1500, "W")).toBe("1.50 kW");
    expect(formatPower(2.5, "kW")).toBe("2.50 kW");
    expect(formatPower(null, "W")).toBe("—");
  });

  it("falls back to the raw unit", () => {
    expect(formatPower(3, "VA")).toBe("3.0 VA");
  });
});

describe("normalizeEnergyKwh", () => {
  it("converts Wh and MWh to kWh", () => {
    expect(normalizeEnergyKwh(1500, "Wh")).toBe(1.5);
    expect(normalizeEnergyKwh(1.5, "kWh")).toBe(1.5);
    expect(normalizeEnergyKwh(2, "MWh")).toBe(2000);
    expect(normalizeEnergyKwh(null, "kWh")).toBeNull();
  });
});

describe("formatEnergy", () => {
  it("formats recognized energy units in kWh", () => {
    expect(formatEnergy(1500, "Wh")).toBe("1.50 kWh");
    expect(formatEnergy(2.5, "kWh")).toBe("2.50 kWh");
    expect(formatEnergy(null, "kWh")).toBe("—");
  });

  it("falls back to the raw unit", () => {
    expect(formatEnergy(3, "J")).toBe("3.00 J");
  });
});

describe("energy cost", () => {
  it("multiplies kWh by the rate", () => {
    expect(calculateEnergyCost(10, 0.25)).toBe(2.5);
    expect(calculateEnergyCost(null, 0.25)).toBeNull();
    expect(calculateEnergyCost(10, 0)).toBeNull();
  });

  it("formats dollars", () => {
    expect(formatCost(2.5)).toBe("$2.50");
    expect(formatCost(null)).toBe("—");
  });
});
