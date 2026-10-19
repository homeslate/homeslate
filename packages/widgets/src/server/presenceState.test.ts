import { describe, expect, it } from "vite-plus/test";
import { mapPresenceEntity } from "./presenceState";

describe("mapPresenceEntity", () => {
  it("maps a person who is home", () => {
    expect(
      mapPresenceEntity({
        entity_id: "person.dan",
        state: "home",
        attributes: { friendly_name: "Dan", entity_picture: "/api/image/1" },
      }),
    ).toEqual({
      entityId: "person.dan",
      name: "Dan",
      state: "home",
      isHome: true,
      zoneName: null,
      entityPicture: "/api/image/1",
    });
  });

  it("maps a person away and in a named zone", () => {
    expect(
      mapPresenceEntity({ entity_id: "person.dan", state: "not_home", attributes: {} }),
    ).toMatchObject({ isHome: false, zoneName: null });
    expect(
      mapPresenceEntity({ entity_id: "device_tracker.phone", state: "Work", attributes: {} }),
    ).toMatchObject({ isHome: false, zoneName: "Work" });
  });

  it("rejects other domains and malformed input", () => {
    expect(mapPresenceEntity({ entity_id: "sensor.a", state: "home", attributes: {} })).toBeNull();
    expect(mapPresenceEntity(undefined)).toBeNull();
  });
});
