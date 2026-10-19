import { describe, expect, it } from "vite-plus/test";
import { mapLockEntity } from "./lockState";

describe("mapLockEntity", () => {
  it("maps a locked lock and its open feature bit", () => {
    expect(
      mapLockEntity({
        entity_id: "lock.front_door",
        state: "locked",
        attributes: { friendly_name: "Front Door", supported_features: 1 },
      }),
    ).toEqual({
      kind: "lock",
      entityId: "lock.front_door",
      name: "Front Door",
      state: "locked",
      isLocked: true,
      supportsOpen: true,
      available: true,
    });
  });

  it("maps mid-unlock and unavailable states", () => {
    expect(
      mapLockEntity({ entity_id: "lock.front_door", state: "unlocking", attributes: {} }),
    ).toMatchObject({ isLocked: false, available: true, name: "lock.front_door" });
    expect(
      mapLockEntity({ entity_id: "lock.front_door", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false });
  });

  it("rejects other domains and malformed input", () => {
    expect(mapLockEntity({ entity_id: "light.kitchen", state: "on", attributes: {} })).toBeNull();
    expect(mapLockEntity({ entity_id: "lock.Bad", state: "locked", attributes: {} })).toBeNull();
    expect(mapLockEntity(null)).toBeNull();
  });
});
