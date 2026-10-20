/** Normalized Home Assistant `media_player` state. */
export interface HomeAssistantMediaPlayer {
  entityId: string;
  name: string;
  /** `playing | paused | idle | off | on | unavailable | …`. */
  state: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  /** Host-relative HA image path, e.g. `/api/media_player_proxy/…`. */
  entityPicture: string | null;
  /** 0–1. */
  volumeLevel: number | null;
  isMuted: boolean;
  source: string | null;
  sourceList: string[];
  mediaDuration: number | null;
  mediaPosition: number | null;
  supportedFeatures: number;
  available: boolean;
}

export const MEDIA_PLAYER_EMPTY_COPY = "Pick a media player in settings.";
export const MEDIA_PLAYER_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Home Assistant media-player feature bits. */
export const MEDIA_PLAYER_FEATURE = {
  pause: 1,
  seek: 2,
  volumeSet: 4,
  volumeMute: 8,
  previousTrack: 16,
  nextTrack: 32,
  turnOn: 128,
  turnOff: 256,
  playMedia: 512,
  volumeStep: 1024,
  selectSource: 2048,
  stop: 4096,
  clearPlaylist: 8192,
  play: 16384,
  shuffleSet: 32768,
  selectSoundMode: 65536,
  browseMedia: 131072,
  repeatSet: 262144,
  grouping: 524288,
  mediaAnnounce: 1048576,
  mediaEnqueue: 2097152,
} as const;

export function mediaPlayerSupports(
  mediaPlayer: HomeAssistantMediaPlayer,
  feature: number,
): boolean {
  return (mediaPlayer.supportedFeatures & feature) !== 0;
}

export function mediaPlayerIsPlaying(mediaPlayer: HomeAssistantMediaPlayer): boolean {
  return mediaPlayer.state === "playing";
}

export function mediaPlayerTitle(mediaPlayer: HomeAssistantMediaPlayer): string {
  return mediaPlayer.title ?? mediaPlayer.name;
}

export function mediaPlayerSubtitle(mediaPlayer: HomeAssistantMediaPlayer): string | null {
  if (mediaPlayer.artist && mediaPlayer.album)
    return `${mediaPlayer.artist} · ${mediaPlayer.album}`;
  return mediaPlayer.artist ?? mediaPlayer.album;
}

/** Progress as 0–100 when the player reports both position and duration. */
export function mediaProgressPct(mediaPlayer: HomeAssistantMediaPlayer): number | null {
  const { mediaPosition, mediaDuration } = mediaPlayer;
  if (mediaPosition === null || mediaDuration === null || mediaDuration <= 0) return null;
  return Math.min(100, Math.max(0, (mediaPosition / mediaDuration) * 100));
}

/** `m:ss` or `h:mm:ss`; `null` when the player has no timeline. */
export function formatMediaTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0)
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function mediaPlayerStateLabel(mediaPlayer: HomeAssistantMediaPlayer): string {
  if (!mediaPlayer.available) return "Unavailable";
  switch (mediaPlayer.state) {
    case "playing":
      return "Playing";
    case "paused":
      return "Paused";
    case "idle":
      return "Idle";
    case "off":
      return "Off";
    case "on":
      return "On";
    default:
      return mediaPlayer.state;
  }
}

export type MediaPlayerSizeTier = "compact" | "medium" | "full";

export function getMediaPlayerSizeTier(width: number, height: number): MediaPlayerSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}

/**
 * Same-origin proxy URL for a host-relative Home Assistant image path.
 * Shared by media artwork, camera snapshots, and presence avatars.
 */
export function homeAssistantImageProxyUrl(path: string | null): string | null {
  return path ? `/api/homeassistant/image?path=${encodeURIComponent(path)}` : null;
}
