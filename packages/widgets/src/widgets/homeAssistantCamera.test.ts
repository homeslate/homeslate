import { describe, expect, it } from "vite-plus/test";
import {
  CAMERA_MAX_REFRESH_SECONDS,
  CAMERA_MIN_REFRESH_SECONDS,
  cameraSnapshotUrl,
  cameraStateLabel,
  nextCameraRefreshMs,
  shouldLoadCameraSnapshot,
  type HomeAssistantCamera,
} from "./homeAssistantCamera";

const camera = (overrides: Partial<HomeAssistantCamera>): HomeAssistantCamera => ({
  entityId: "camera.front",
  name: "Front",
  state: "idle",
  entityPicture: null,
  available: true,
  ...overrides,
});

describe("cameraStateLabel", () => {
  it("reads the camera states", () => {
    expect(cameraStateLabel(camera({ state: "idle" }))).toBe("Idle");
    expect(cameraStateLabel(camera({ state: "recording" }))).toBe("Recording");
    expect(cameraStateLabel(camera({ state: "streaming" }))).toBe("Streaming");
    expect(cameraStateLabel(camera({ available: false }))).toBe("Unavailable");
  });
});

describe("cameraSnapshotUrl", () => {
  it("builds a same-origin proxy URL with a cache buster", () => {
    const url = cameraSnapshotUrl("camera.front", 1234);
    expect(url).toBe("/api/homeassistant/image?path=%2Fapi%2Fcamera_proxy%2Fcamera.front&t=1234");
    expect(url).not.toContain("http://");
    expect(url).not.toContain("token=");
  });

  it("omits the cache buster when not provided", () => {
    expect(cameraSnapshotUrl("camera.front")).toBe(
      "/api/homeassistant/image?path=%2Fapi%2Fcamera_proxy%2Fcamera.front",
    );
  });
});

describe("nextCameraRefreshMs", () => {
  it("converts seconds to ms and clamps the range", () => {
    expect(nextCameraRefreshMs(60)).toBe(60_000);
    expect(nextCameraRefreshMs(1)).toBe(CAMERA_MIN_REFRESH_SECONDS * 1000);
    expect(nextCameraRefreshMs(99999)).toBe(CAMERA_MAX_REFRESH_SECONDS * 1000);
  });

  it("disables refreshing for zero, negative, or invalid values", () => {
    expect(nextCameraRefreshMs(0)).toBeNull();
    expect(nextCameraRefreshMs(-5)).toBeNull();
    expect(nextCameraRefreshMs(Number.NaN)).toBeNull();
  });
});

describe("shouldLoadCameraSnapshot", () => {
  it("gates snapshots on privacy mode", () => {
    expect(shouldLoadCameraSnapshot(false)).toBe(true);
    expect(shouldLoadCameraSnapshot(true)).toBe(false);
  });
});
