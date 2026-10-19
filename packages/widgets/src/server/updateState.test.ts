import { describe, expect, it } from "vite-plus/test";
import { mapUpdateEntity } from "./updateState";

describe("mapUpdateEntity", () => {
  it("maps an available update with versions", () => {
    expect(
      mapUpdateEntity({
        entity_id: "update.hacs",
        state: "on",
        attributes: {
          friendly_name: "HACS",
          installed_version: "1.0.0",
          latest_version: "1.1.0",
          in_progress: false,
          update_percentage: null,
        },
      }),
    ).toEqual({
      entityId: "update.hacs",
      name: "HACS",
      state: "on",
      installedVersion: "1.0.0",
      latestVersion: "1.1.0",
      inProgress: false,
      updatePercentage: null,
      available: true,
    });
  });

  it("maps an in-progress install", () => {
    expect(
      mapUpdateEntity({
        entity_id: "update.hacs",
        state: "on",
        attributes: { in_progress: true, update_percentage: 42.5 },
      }),
    ).toMatchObject({ inProgress: true, updatePercentage: 42.5, name: "update.hacs" });
  });

  it("maps up-to-date and unavailable entities", () => {
    expect(
      mapUpdateEntity({ entity_id: "update.hacs", state: "off", attributes: {} }),
    ).toMatchObject({ state: "off", available: true, installedVersion: null });
    expect(
      mapUpdateEntity({ entity_id: "update.hacs", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false });
  });

  it("rejects other domains and malformed input", () => {
    expect(
      mapUpdateEntity({ entity_id: "camera.front", state: "idle", attributes: {} }),
    ).toBeNull();
    expect(mapUpdateEntity({ entity_id: "update.Bad", state: "on", attributes: {} })).toBeNull();
    expect(mapUpdateEntity(undefined)).toBeNull();
  });
});
