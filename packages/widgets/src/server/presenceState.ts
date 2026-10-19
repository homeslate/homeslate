import type { HomeAssistantPresence } from "../widgets/homeAssistantPresence";

/** Per-domain entity-id shapes for the presence family. */
export const PRESENCE_DOMAIN_ENTITY_IDS = {
  person: /^person\.[a-z0-9_]+$/,
  device_tracker: /^device_tracker\.[a-z0-9_]+$/,
  zone: /^zone\.[a-z0-9_]+$/,
} as const;

const PRESENCE_ENTITY_ID = /^(person|device_tracker|zone)\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Map a raw `person` / `device_tracker` / `zone` state, or `null`. */
export function mapPresenceEntity(raw: unknown): HomeAssistantPresence | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!PRESENCE_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  const isHome = state === "home";
  const zoneName = state === "home" || state === "not_home" ? null : state;

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    isHome,
    zoneName,
    entityPicture: stringOrNull(attributes.entity_picture),
  };
}
