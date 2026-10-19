import type { HomeAssistantLock } from "../widgets/homeAssistantLock";

/** Entity-id shape for the `lock` domain; also seeded into the registry. */
export const LOCK_ENTITY_ID = /^lock\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Map a raw `lock` state, or `null`. */
export function mapLockEntity(raw: unknown): HomeAssistantLock | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!LOCK_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  const supportedFeatures = finiteNumberOrNull(attributes.supported_features) ?? 0;

  return {
    kind: "lock",
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    isLocked: state === "locked" || state === "locking",
    supportsOpen: (supportedFeatures & 1) !== 0,
    available: state !== "unavailable" && state !== "unknown",
  };
}
