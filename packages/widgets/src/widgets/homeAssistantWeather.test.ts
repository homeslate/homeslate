import { describe, expect, it } from "vite-plus/test";
import { weatherConditionCode, weatherConditionIsDay } from "./homeAssistantWeather";

describe("weatherConditionCode", () => {
  it("maps Home Assistant conditions onto WMO-ish codes", () => {
    expect(weatherConditionCode("sunny")).toBe(0);
    expect(weatherConditionCode("clear-night")).toBe(0);
    expect(weatherConditionCode("partlycloudy")).toBe(2);
    expect(weatherConditionCode("cloudy")).toBe(3);
    expect(weatherConditionCode("fog")).toBe(45);
    expect(weatherConditionCode("rainy")).toBe(63);
    expect(weatherConditionCode("pouring")).toBe(63);
    expect(weatherConditionCode("snowy")).toBe(73);
    expect(weatherConditionCode("lightning-rainy")).toBe(95);
  });

  it("defaults unknown conditions to cloudy", () => {
    expect(weatherConditionCode("wat")).toBe(3);
  });
});

describe("weatherConditionIsDay", () => {
  it("only treats clear-night as night", () => {
    expect(weatherConditionIsDay("clear-night")).toBe(false);
    expect(weatherConditionIsDay("sunny")).toBe(true);
  });
});
