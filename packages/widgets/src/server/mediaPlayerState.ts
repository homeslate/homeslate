import type { HomeAssistantMediaPlayer } from "../widgets/homeAssistantMediaPlayer";

/** Entity-id shape for the `media_player` domain. */
export const MEDIA_PLAYER_ENTITY_ID = /^media_player\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/** Map a raw `media_player` state, or `null`. */
export function mapMediaPlayerEntity(raw: unknown): HomeAssistantMediaPlayer | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!MEDIA_PLAYER_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    title: stringOrNull(attributes.media_title),
    artist: stringOrNull(attributes.media_artist),
    album: stringOrNull(attributes.media_album_name),
    entityPicture: stringOrNull(attributes.entity_picture),
    volumeLevel: finiteNumberOrNull(attributes.volume_level),
    isMuted: attributes.is_volume_muted === true,
    source: stringOrNull(attributes.source),
    sourceList: stringList(attributes.source_list),
    mediaDuration: finiteNumberOrNull(attributes.media_duration),
    mediaPosition: finiteNumberOrNull(attributes.media_position),
    supportedFeatures: finiteNumberOrNull(attributes.supported_features) ?? 0,
    available: state !== "unavailable" && state !== "unknown",
  };
}
