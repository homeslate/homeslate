import { describe, expect, it } from "vite-plus/test";
import { mapCoverEntity } from "./coverState";

describe("mapCoverEntity", () => {
  it("maps a garage door with a position and device class", () => {
    expect(
      mapCoverEntity({
        entity_id: "cover.garage_door",
        state: "open",
        attributes: {
          friendly_name: "Garage Door",
          device_class: "garage",
          current_position: 62,
          supported_features: 15,
        },
      }),
    ).toEqual({
      entityId: "cover.garage_door",
      name: "Garage Door",
      state: "open",
      position: 62,
      deviceClass: "garage",
      supportedFeatures: 15,
      isGarage: true,
      available: true,
    });
  });

  it("maps a blind without a position", () => {
    expect(
      mapCoverEntity({
        entity_id: "cover.living_room_blind",
        state: "closed",
        attributes: { device_class: "blind" },
      }),
    ).toMatchObject({
      entityId: "cover.living_room_blind",
      name: "cover.living_room_blind",
      position: null,
      isGarage: false,
      available: true,
    });
  });

  it("flags unavailable covers", () => {
    expect(
      mapCoverEntity({ entity_id: "cover.gate", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false });
  });

  it("rejects other domains and malformed input", () => {
    expect(mapCoverEntity({ entity_id: "light.kitchen", state: "on", attributes: {} })).toBeNull();
    expect(mapCoverEntity({ entity_id: "cover.Bad", state: "open", attributes: {} })).toBeNull();
    expect(mapCoverEntity(undefined)).toBeNull();
  });
});
