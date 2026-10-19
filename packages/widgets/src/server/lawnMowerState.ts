import type { HomeAssistantLawnMower } from "../widgets/homeAssistantLawnMower";

/** Entity-id shape for the `lawn_mower` domain. */
export const LAWN_MOWER_ENTITY_ID = /^lawn_mower\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Map a raw `lawn_mower` state, or `null`. */
export function mapLawnMowerEntity(raw: unknown): HomeAssistantLawnMower | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!LAWN_MOWER_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    available: state !== "unavailable" && state !== "unknown",
  };
}
