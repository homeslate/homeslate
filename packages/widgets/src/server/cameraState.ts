import type { HomeAssistantCamera } from "../widgets/homeAssistantCamera";

/** Entity-id shape for the `camera` domain. */
export const CAMERA_ENTITY_ID = /^camera\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Map a raw `camera` state, or `null`. */
export function mapCameraEntity(raw: unknown): HomeAssistantCamera | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!CAMERA_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    entityPicture: stringOrNull(attributes.entity_picture),
    available: state !== "unavailable" && state !== "unknown",
  };
}
