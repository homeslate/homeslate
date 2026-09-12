import { describe, expect, it } from "vite-plus/test";
import {
  COMMUTE_EMPTY_COPY,
  COMMUTE_MISSING_KEY_COPY,
  commuteApiUrl,
  formatCommuteDistance,
  formatCommuteDuration,
} from "./commute";

describe("formatCommuteDuration", () => {
  it("rounds under a minute down to <1 min", () => {
    expect(formatCommuteDuration(0)).toBe("<1 min");
    expect(formatCommuteDuration(59)).toBe("<1 min");
  });

  it("shows whole minutes under an hour", () => {
    expect(formatCommuteDuration(60)).toBe("1 min");
    expect(formatCommuteDuration(18 * 60 + 20)).toBe("18 min");
  });

  it("includes hours when duration is 60 minutes or more", () => {
    expect(formatCommuteDuration(60 * 60)).toBe("1 hr");
    expect(formatCommuteDuration(72 * 60)).toBe("1 hr 12 min");
  });
});

describe("formatCommuteDistance", () => {
  it("formats miles and kilometers to one decimal", () => {
    expect(formatCommuteDistance(9978, "imperial")).toBe("6.2 mi");
    expect(formatCommuteDistance(6200, "metric")).toBe("6.2 km");
  });
});

describe("commute copy and URL", () => {
  it("uses the spec empty and 501 strings", () => {
    expect(COMMUTE_EMPTY_COPY).toBe("Add a route in settings.");
    expect(COMMUTE_MISSING_KEY_COPY).toBe("Set OPENROUTESERVICE_API_KEY on the server.");
  });

  it("builds the same-origin commute URL", () => {
    expect(commuteApiUrl("Home", "School", "imperial")).toBe(
      "/api/commute?origin=Home&destination=School&units=imperial",
    );
  });
});
