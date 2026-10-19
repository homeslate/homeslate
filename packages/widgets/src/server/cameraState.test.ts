import { describe, expect, it } from "vite-plus/test";
import { mapCameraEntity } from "./cameraState";

describe("mapCameraEntity", () => {
  it("maps a camera and its entity picture", () => {
    expect(
      mapCameraEntity({
        entity_id: "camera.front_door",
        state: "idle",
        attributes: {
          friendly_name: "Front Door",
          entity_picture: "/api/camera_proxy/camera.front_door?token=abc",
        },
      }),
    ).toEqual({
      entityId: "camera.front_door",
      name: "Front Door",
      state: "idle",
      entityPicture: "/api/camera_proxy/camera.front_door?token=abc",
      available: true,
    });
  });

  it("flags unavailable cameras and rejects other domains", () => {
    expect(
      mapCameraEntity({ entity_id: "camera.front_door", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false, name: "camera.front_door" });
    expect(mapCameraEntity({ entity_id: "light.kitchen", state: "on", attributes: {} })).toBeNull();
    expect(mapCameraEntity(null)).toBeNull();
  });
});
