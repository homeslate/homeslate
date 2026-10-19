import { describe, expect, it } from "vite-plus/test";
import { mapLawnMowerEntity } from "./lawnMowerState";

describe("mapLawnMowerEntity", () => {
  it("maps a lawn mower and its state", () => {
    expect(
      mapLawnMowerEntity({
        entity_id: "lawn_mower.back_yard",
        state: "mowing",
        attributes: { friendly_name: "Back Yard" },
      }),
    ).toEqual({
      entityId: "lawn_mower.back_yard",
      name: "Back Yard",
      state: "mowing",
      available: true,
    });
  });

  it("flags unavailable mowers and rejects other domains", () => {
    expect(
      mapLawnMowerEntity({
        entity_id: "lawn_mower.back_yard",
        state: "unavailable",
        attributes: {},
      }),
    ).toMatchObject({ available: false, name: "lawn_mower.back_yard" });
    expect(
      mapLawnMowerEntity({ entity_id: "vacuum.downstairs", state: "docked", attributes: {} }),
    ).toBeNull();
    expect(mapLawnMowerEntity(null)).toBeNull();
  });
});
