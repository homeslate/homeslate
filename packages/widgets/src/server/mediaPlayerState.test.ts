import { describe, expect, it } from "vite-plus/test";
import { mapMediaPlayerEntity } from "./mediaPlayerState";

describe("mapMediaPlayerEntity", () => {
  it("maps now-playing metadata and controls", () => {
    expect(
      mapMediaPlayerEntity({
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: {
          friendly_name: "Kitchen Speaker",
          media_title: "Song",
          media_artist: "Artist",
          media_album_name: "Album",
          entity_picture: "/api/media_player_proxy/media_player.kitchen?token=abc",
          volume_level: 0.42,
          is_volume_muted: true,
          source: "Spotify",
          source_list: ["Spotify", "Radio"],
          media_duration: 245,
          media_position: 30,
          supported_features: 200895,
        },
      }),
    ).toEqual({
      entityId: "media_player.kitchen",
      name: "Kitchen Speaker",
      state: "playing",
      title: "Song",
      artist: "Artist",
      album: "Album",
      entityPicture: "/api/media_player_proxy/media_player.kitchen?token=abc",
      volumeLevel: 0.42,
      isMuted: true,
      source: "Spotify",
      sourceList: ["Spotify", "Radio"],
      mediaDuration: 245,
      mediaPosition: 30,
      supportedFeatures: 200895,
      available: true,
    });
  });

  it("falls back to nulls when a player is off", () => {
    expect(
      mapMediaPlayerEntity({ entity_id: "media_player.tv", state: "off", attributes: {} }),
    ).toMatchObject({
      name: "media_player.tv",
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
      available: true,
    });
  });

  it("flags unavailable players and rejects other domains", () => {
    expect(
      mapMediaPlayerEntity({ entity_id: "media_player.tv", state: "unavailable", attributes: {} }),
    ).toMatchObject({ available: false });
    expect(
      mapMediaPlayerEntity({ entity_id: "fan.bedroom", state: "on", attributes: {} }),
    ).toBeNull();
    expect(mapMediaPlayerEntity(null)).toBeNull();
  });
});
