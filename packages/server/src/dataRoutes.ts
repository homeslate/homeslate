import { LEAGUES, STOCKS_MISSING_KEY_COPY } from "@homeslate/widgets/server";
import { Hono } from "hono";
import { freshCacheControl } from "./cacheControl";
import { UpstreamError, readPublicResource } from "./upstream";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";

function cache(
  freshSeconds: number,
  staleSeconds: number,
  visibility: "public" | "private" = "public",
): string {
  return freshCacheControl(freshSeconds, staleSeconds, visibility);
}

function providerError(error: unknown): { body: { error: string }; status: 400 | 502 } {
  if (error instanceof UpstreamError && error.status === 400) {
    return { body: { error: "URL is not allowed" }, status: 400 };
  }
  return { body: { error: "Provider failed" }, status: 502 };
}

async function readJson(url: string, headers?: HeadersInit): Promise<unknown> {
  const result = await readPublicResource(url, { headers });
  try {
    return JSON.parse(new TextDecoder().decode(result.body)) as unknown;
  } catch {
    throw new UpstreamError(502, "Provider response was not JSON");
  }
}

function parseLatLon(latRaw: string | undefined, lonRaw: string | undefined) {
  const latitude = Number(latRaw);
  const longitude = Number(lonRaw);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function forecastUrl(latitude: number, longitude: number, units: "imperial" | "metric"): string {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ].join(","),
  );
  url.searchParams.set("hourly", ["temperature_2m", "weather_code", "is_day"].join(","));
  if (units === "imperial") {
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
  }
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  return url.toString();
}

export function registerDataRoutes(app: Hono, finnhubApiKey?: string): void {
  app.get("/api/weather/forecast", async (c) => {
    const point = parseLatLon(c.req.query("latitude"), c.req.query("longitude"));
    if (!point) return c.json({ error: "Invalid latitude or longitude" }, 400);
    const units = c.req.query("units") === "metric" ? "metric" : "imperial";
    try {
      const payload = await readJson(forecastUrl(point.latitude, point.longitude, units));
      c.header("Cache-Control", cache(600, 6 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/weather/geocode", async (c) => {
    const name = c.req.query("name")?.trim() ?? "";
    if (name.length < 2 || name.length > 80) return c.json({ error: "Invalid place name" }, 400);
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", name);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    try {
      const payload = await readJson(url.toString());
      c.header("Cache-Control", cache(24 * 60 * 60, 7 * 24 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/weather/air", async (c) => {
    const point = parseLatLon(c.req.query("latitude"), c.req.query("longitude"));
    if (!point) return c.json({ error: "Invalid latitude or longitude" }, 400);
    const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    url.searchParams.set("latitude", String(point.latitude));
    url.searchParams.set("longitude", String(point.longitude));
    url.searchParams.set("current", "us_aqi");
    try {
      const payload = await readJson(url.toString());
      c.header("Cache-Control", cache(600, 6 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/stocks/quote", async (c) => {
    const apiKey = finnhubApiKey?.trim() ?? "";
    if (!apiKey) return c.json({ error: STOCKS_MISSING_KEY_COPY }, 501);
    const symbol = c.req.query("symbol")?.trim().toUpperCase() ?? "";
    if (!/^[A-Z0-9.]{1,12}$/.test(symbol)) return c.json({ error: "Invalid symbol" }, 400);
    const url = new URL("https://finnhub.io/api/v1/quote");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("token", apiKey);
    try {
      const payload = await readJson(url.toString());
      c.header("Cache-Control", cache(60, 6 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/stocks/search", async (c) => {
    const apiKey = finnhubApiKey?.trim() ?? "";
    if (!apiKey) return c.json({ error: STOCKS_MISSING_KEY_COPY }, 501);
    const query = c.req.query("q")?.trim() ?? "";
    if (
      query.length < 1 ||
      query.length > 40 ||
      [...query].some((char) => char.charCodeAt(0) < 32)
    ) {
      return c.json({ error: "Invalid query" }, 400);
    }
    const url = new URL("https://finnhub.io/api/v1/search");
    url.searchParams.set("q", query);
    url.searchParams.set("token", apiKey);
    try {
      const payload = await readJson(url.toString());
      c.header("Cache-Control", cache(60 * 60, 24 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/news", async (c) => {
    const feedUrl = c.req.query("url") ?? "";
    try {
      const result = await readPublicResource(feedUrl, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
      });
      c.header("Cache-Control", cache(300, 24 * 60 * 60, "private"));
      return c.body(result.body, 200, { "Content-Type": "text/plain; charset=utf-8" });
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/calendar/ical", async (c) => {
    const icalUrl = c.req.query("url") ?? "";
    try {
      const result = await readPublicResource(icalUrl, {
        headers: { Accept: "text/calendar, text/plain, */*" },
      });
      c.header("Cache-Control", cache(300, 24 * 60 * 60, "private"));
      return c.body(result.body, 200, { "Content-Type": "text/plain; charset=utf-8" });
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/sports/scoreboard", async (c) => {
    const league = LEAGUES.find((entry) => entry.id === c.req.query("league"));
    if (!league) return c.json({ error: "Unknown league" }, 400);
    const dates = c.req.query("dates");
    if (dates !== undefined && !/^\d{8}$/.test(dates))
      return c.json({ error: "Invalid date" }, 400);
    const url = new URL(`${ESPN_BASE}/${league.sport}/${league.id}/scoreboard`);
    if (dates) url.searchParams.set("dates", dates);
    try {
      const payload = await readJson(url.toString());
      c.header("Cache-Control", cache(120, 6 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });

  app.get("/api/sports/teams", async (c) => {
    const league = LEAGUES.find((entry) => entry.id === c.req.query("league"));
    if (!league) return c.json({ error: "Unknown league" }, 400);
    const url = `${ESPN_BASE}/${league.sport}/${league.id}/teams?limit=200`;
    try {
      const payload = await readJson(url);
      c.header("Cache-Control", cache(60 * 60, 7 * 24 * 60 * 60));
      return c.json(payload);
    } catch (error) {
      const failure = providerError(error);
      return c.json(failure.body, failure.status);
    }
  });
}
