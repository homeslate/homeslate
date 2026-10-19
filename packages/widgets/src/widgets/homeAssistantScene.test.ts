import { describe, expect, it } from "vite-plus/test";
import { sceneLabel, sceneService } from "./homeAssistantScene";

describe("sceneService", () => {
  it("maps each fireable domain to its allowlisted service", () => {
    expect(sceneService("scene.movie")).toEqual({ domain: "scene", service: "turn_on" });
    expect(sceneService("script.bedtime")).toEqual({ domain: "script", service: "turn_on" });
    expect(sceneService("button.doorbell")).toEqual({ domain: "button", service: "press" });
    expect(sceneService("input_button.reset")).toEqual({
      domain: "input_button",
      service: "press",
    });
  });

  it("returns null for other domains and malformed ids", () => {
    expect(sceneService("light.kitchen")).toBeNull();
    expect(sceneService("nope")).toBeNull();
  });
});

describe("sceneLabel", () => {
  it("prefers a trimmed configured label", () => {
    expect(sceneLabel({ entityId: "scene.movie", label: "  Movie Night  " })).toBe("Movie Night");
  });

  it("falls back to the object id with spaces", () => {
    expect(sceneLabel({ entityId: "scene.movie_night" })).toBe("movie night");
  });
});
