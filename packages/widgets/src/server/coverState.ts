import type { HomeAssistantCover } from "../widgets/homeAssistantCover";

/** Entity-id shape for the `cover` domain; also seeded into the registry. */
export const COVER_ENTITY_ID = /^cover\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Map a raw `cover` state into the normalized shape, or `null`. */
export function mapCoverEntity(raw: unknown): HomeAssistantCover | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!COVER_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  const deviceClass = stringOrNull(attributes.device_class);

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    position: finiteNumberOrNull(attributes.current_position),
    deviceClass,
    supportedFeatures: finiteNumberOrNull(attributes.supported_features) ?? 0,
    isGarage: deviceClass === "garage",
    available: state !== "unavailable" && state !== "unknown",
  };
}
