import { describe, expect, it } from "vite-plus/test";
import { mapWeatherEntity, mapWeatherForecast } from "./weatherState";

describe("mapWeatherEntity", () => {
  it("maps a weather entity with its unit and current conditions", () => {
    expect(
      mapWeatherEntity({
        entity_id: "weather.home",
        state: "sunny",
        attributes: {
          friendly_name: "Home",
          temperature: 21,
          temperature_unit: "°F",
          humidity: 40,
          wind_speed: 5,
          wind_bearing: 180,
        },
      }),
    ).toEqual({
      entityId: "weather.home",
      name: "Home",
      state: "sunny",
      condition: "sunny",
      temperature: 21,
      unit: "imperial",
      humidity: 40,
      pressure: null,
      windSpeed: 5,
      windBearing: 180,
      apparentTemperature: null,
      isDay: true,
    });
  });

  it("flags clear-night as night", () => {
    expect(
      mapWeatherEntity({
        entity_id: "weather.home",
        state: "clear-night",
        attributes: { condition: "clear-night" },
      }),
    ).toMatchObject({ isDay: false });
  });

  it("rejects other domains and malformed input", () => {
    expect(mapWeatherEntity({ entity_id: "sensor.a", state: "x", attributes: {} })).toBeNull();
    expect(mapWeatherEntity({})).toBeNull();
  });
});

describe("mapWeatherForecast", () => {
  it("maps the REST shape and skips entries without a datetime", () => {
    expect(
      mapWeatherForecast(
        {
          "weather.home": {
            forecast: [
              {
                datetime: "2026-10-19T12:00:00+00:00",
                condition: "rainy",
                temperature: 17,
                templow: 11,
                precipitation_probability: 80,
              },
              { condition: "sunny" },
            ],
          },
        },
        "weather.home",
      ),
    ).toEqual([
      {
        datetime: "2026-10-19T12:00:00+00:00",
        condition: "rainy",
        temperature: 17,
        templow: 11,
        precipitationProbability: 80,
        isDay: true,
      },
    ]);
  });

  it("accepts the websocket wrapper and a bare forecast", () => {
    const entry = { datetime: "2026-10-19T12:00:00Z", condition: "cloudy" };
    expect(
      mapWeatherForecast({ service_response: { forecast: [entry] } }, "weather.home"),
    ).toHaveLength(1);
    expect(mapWeatherForecast({ forecast: [entry] }, "weather.home")).toHaveLength(1);
    expect(mapWeatherForecast({}, "weather.home")).toEqual([]);
  });
});
