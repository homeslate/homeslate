import { describe, expect, it } from "vite-plus/test";
import { parseCommuteQuery, parseLatLon } from "./commuteQuery";

describe("parseLatLon", () => {
  it("parses lat,lon and rejects out-of-range values", () => {
    expect(parseLatLon("47.6062,-122.3321")).toEqual({ lat: 47.6062, lon: -122.3321 });
    expect(parseLatLon("91,0")).toBeNull();
    expect(parseLatLon("School")).toBeNull();
  });
});

describe("parseCommuteQuery", () => {
  it("requires origin and destination and defaults units to imperial", () => {
    expect(parseCommuteQuery({ origin: "A", destination: "B" })).toEqual({
      ok: true,
      origin: "A",
      destination: "B",
      units: "imperial",
    });
    expect(parseCommuteQuery({ origin: "", destination: "B" }).ok).toBe(false);
    expect(parseCommuteQuery({ origin: "A", destination: "B", units: "metric" })).toMatchObject({
      units: "metric",
    });
    expect(parseCommuteQuery({ origin: "A", destination: "B", units: "furlongs" }).ok).toBe(false);
  });
});
