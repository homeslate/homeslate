import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  commuteKey,
  googleCalendarKey,
  haHistoryKey,
  haTodoKey,
  newsKey,
  stocksKey,
  weatherKey,
} from "./cachePolicies";

describe("cache policies", () => {
  it("isolates keys by config and keeps secrets out of stock keys", () => {
    expect(weatherKey(1.234, 2.345, "imperial")).toBe("weather:1.23,2.35,imperial");
    expect(weatherKey(1.234, 2.345, "metric")).not.toBe(weatherKey(1.234, 2.345, "imperial"));
    expect(newsKey(["b", "a"])).toBe(newsKey(["a", "b"]));
    expect(stocksKey(["msft", "aapl"])).toBe("stocks:AAPL,MSFT");
    expect(stocksKey(["AAPL"])).not.toContain("secret-key");
    expect(commuteKey([{ origin: "home", destination: "work" }], "imperial")).toBe(
      "commute:home>work:imperial",
    );
    expect(haHistoryKey("sensor.temp", 24)).not.toBe(haHistoryKey("sensor.temp", 6));
    expect(haTodoKey("todo.groceries")).toBe("ha:todo:todo.groceries");
    expect(googleCalendarKey(["b", "a"], 7, 1)).toBe("google-calendar:a,b:7:1");
    expect(googleCalendarKey(["a"], 7, 1)).not.toBe(googleCalendarKey(["a"], 14, 1));
  });

  it("does not let service memory caches bypass the shared cache", () => {
    for (const name of ["news.ts", "calendar.ts", "weather.ts", "stocks.ts"]) {
      const source = readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), "utf8");
      expect(source).not.toMatch(/const \w*[Cc]ache\w* = new Map/);
    }
    const sports = readFileSync(fileURLToPath(new URL("./sports.ts", import.meta.url)), "utf8");
    expect(sports).not.toContain("scoreboardCache");
    expect(sports).not.toContain("teamsCache");
  });

  it("does not cache todo writes", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../hooks/useHomeAssistantTodo.ts", import.meta.url)),
      "utf8",
    );
    const runStart = source.indexOf("const run = useCallback");
    const runEnd = source.indexOf("const addItem", runStart);
    expect(source.slice(runStart, runEnd)).not.toContain("writeWidgetCache");
  });
});
