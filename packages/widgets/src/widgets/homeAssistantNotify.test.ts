import { describe, expect, it } from "vite-plus/test";
import {
  buildNotifyPayload,
  buildTtsPayload,
  notifyService,
  notifyTargetId,
} from "./homeAssistantNotify";

describe("buildNotifyPayload", () => {
  it("trims the message and includes an optional title", () => {
    expect(buildNotifyPayload("  Dinner is ready  ", " Kitchen ")).toEqual({
      message: "Dinner is ready",
      title: "Kitchen",
    });
    expect(buildNotifyPayload("Dinner", "")).toEqual({ message: "Dinner" });
  });

  it("returns null for an empty message", () => {
    expect(buildNotifyPayload("   ", "Kitchen")).toBeNull();
  });
});

describe("buildTtsPayload", () => {
  it("requires a message and a media player", () => {
    expect(buildTtsPayload(" Welcome home ", "media_player.kitchen")).toEqual({
      message: "Welcome home",
      media_player_entity_id: "media_player.kitchen",
    });
    expect(buildTtsPayload("Hello", "")).toBeNull();
    expect(buildTtsPayload("", "media_player.kitchen")).toBeNull();
  });
});

describe("notify target helpers", () => {
  it("selects the target and service for each mode", () => {
    expect(notifyTargetId("notify", "notify.kitchen", "tts.home")).toBe("notify.kitchen");
    expect(notifyTargetId("tts", "notify.kitchen", "tts.home")).toBe("tts.home");
    expect(notifyService("notify")).toBe("send_message");
    expect(notifyService("tts")).toBe("speak");
  });
});
