import { describe, expect, it } from "vite-plus/test";
import {
  MEDIA_PLAYER_FEATURE,
  formatMediaTime,
  getMediaPlayerSizeTier,
  homeAssistantImageProxyUrl,
  mediaPlayerIsPlaying,
  mediaPlayerStateLabel,
  mediaPlayerSubtitle,
  mediaPlayerSupports,
  mediaPlayerTitle,
  mediaProgressPct,
  type HomeAssistantMediaPlayer,
} from "./homeAssistantMediaPlayer";

const player = (overrides: Partial<HomeAssistantMediaPlayer>): HomeAssistantMediaPlayer => ({
  entityId: "media_player.x",
  name: "X",
  state: "playing",
  title: null,
  artist: null,
  album: null,
  entityPicture: null,
  volumeLevel: null,
  isMuted: false,
  source: null,
  sourceList: [],
  mediaDuration: null,
  mediaPosition: null,
  supportedFeatures: 0,
  available: true,
  ...overrides,
});

describe("mediaPlayerSupports", () => {
  it("reads feature bits", () => {
    const p = player({
      supportedFeatures: MEDIA_PLAYER_FEATURE.pause | MEDIA_PLAYER_FEATURE.nextTrack,
    });
    expect(mediaPlayerSupports(p, MEDIA_PLAYER_FEATURE.pause)).toBe(true);
    expect(mediaPlayerSupports(p, MEDIA_PLAYER_FEATURE.nextTrack)).toBe(true);
    expect(mediaPlayerSupports(p, MEDIA_PLAYER_FEATURE.volumeSet)).toBe(false);
  });
});

describe("metadata helpers", () => {
  it("falls back to the entity name and joins artist/album", () => {
    expect(mediaPlayerTitle(player({ title: null }))).toBe("X");
    expect(mediaPlayerTitle(player({ title: "Song" }))).toBe("Song");
    expect(mediaPlayerSubtitle(player({ artist: "Artist", album: "Album" }))).toBe(
      "Artist · Album",
    );
    expect(mediaPlayerSubtitle(player({ artist: "Artist" }))).toBe("Artist");
    expect(mediaPlayerSubtitle(player({}))).toBeNull();
  });

  it("reads playing and other states", () => {
    expect(mediaPlayerIsPlaying(player({ state: "playing" }))).toBe(true);
    expect(mediaPlayerIsPlaying(player({ state: "paused" }))).toBe(false);
    expect(mediaPlayerStateLabel(player({ state: "paused" }))).toBe("Paused");
    expect(mediaPlayerStateLabel(player({ available: false }))).toBe("Unavailable");
  });
});

describe("timeline helpers", () => {
  it("computes progress only with a duration", () => {
    expect(mediaProgressPct(player({ mediaPosition: 30, mediaDuration: 120 }))).toBe(25);
    expect(mediaProgressPct(player({ mediaPosition: 30, mediaDuration: 0 }))).toBeNull();
    expect(mediaProgressPct(player({ mediaPosition: 30, mediaDuration: null }))).toBeNull();
  });

  it("formats media time", () => {
    expect(formatMediaTime(0)).toBe("0:00");
    expect(formatMediaTime(65)).toBe("1:05");
    expect(formatMediaTime(3665)).toBe("1:01:05");
    expect(formatMediaTime(null)).toBe("0:00");
  });
});

describe("getMediaPlayerSizeTier", () => {
  it("steps compact → medium → full with size", () => {
    expect(getMediaPlayerSizeTier(2, 2)).toBe("compact");
    expect(getMediaPlayerSizeTier(3, 3)).toBe("medium");
    expect(getMediaPlayerSizeTier(4, 4)).toBe("full");
  });
});

describe("homeAssistantImageProxyUrl", () => {
  it("encodes the host-relative path", () => {
    expect(homeAssistantImageProxyUrl("/api/media_player_proxy/x?token=a")).toBe(
      "/api/homeassistant/image?path=%2Fapi%2Fmedia_player_proxy%2Fx%3Ftoken%3Da",
    );
    expect(homeAssistantImageProxyUrl(null)).toBeNull();
  });
});
