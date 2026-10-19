import { describe, expect, it } from "vite-plus/test";
import { mapHistoryPoints } from "./historyState";

describe("mapHistoryPoints", () => {
  it("maps a nested history response, filters other entities and non-numeric states", () => {
    const raw = [
      [
        { entity_id: "sensor.outdoor", state: "20", last_changed: "2026-01-01T02:00:00Z" },
        { entity_id: "sensor.outdoor", state: "unavailable", last_changed: "2026-01-01T01:30:00Z" },
        { entity_id: "sensor.outdoor", state: "19", last_changed: "2026-01-01T01:00:00Z" },
        { entity_id: "sensor.other", state: "99", last_changed: "2026-01-01T01:00:00Z" },
      ],
    ];
    expect(mapHistoryPoints(raw, "sensor.outdoor")).toEqual([
      { at: "2026-01-01T01:00:00Z", value: 19 },
      { at: "2026-01-01T02:00:00Z", value: 20 },
    ]);
  });

  it("accepts a flat response and last_updated fallback", () => {
    expect(
      mapHistoryPoints(
        [
          { state: "1.5", last_updated: "2026-01-01T00:00:00Z" },
          { state: "2.5", last_updated: "2026-01-01T00:30:00Z" },
        ],
        "sensor.x",
      ),
    ).toEqual([
      { at: "2026-01-01T00:00:00Z", value: 1.5 },
      { at: "2026-01-01T00:30:00Z", value: 2.5 },
    ]);
  });

  it("rejects malformed input", () => {
    expect(mapHistoryPoints(null, "sensor.x")).toEqual([]);
    expect(mapHistoryPoints({}, "sensor.x")).toEqual([]);
    expect(mapHistoryPoints([null, 3, { state: "x" }], "sensor.x")).toEqual([]);
  });

  it("caps long series", () => {
    const long = Array.from({ length: 1000 }, (_, index) => ({
      entity_id: "sensor.x",
      state: String(index),
      last_changed: new Date(2026, 0, 1, 0, index).toISOString(),
    }));
    expect(mapHistoryPoints([long], "sensor.x").length).toBeLessThanOrEqual(241);
  });
});
