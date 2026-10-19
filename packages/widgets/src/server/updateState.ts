import type { HomeAssistantUpdate } from "../widgets/homeAssistantUpdate";

/** Entity-id shape for the `update` domain. */
export const UPDATE_ENTITY_ID = /^update\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Map a raw `update` state, or `null`. */
export function mapUpdateEntity(raw: unknown): HomeAssistantUpdate | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!UPDATE_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    installedVersion: stringOrNull(attributes.installed_version),
    latestVersion: stringOrNull(attributes.latest_version),
    inProgress: attributes.in_progress === true,
    updatePercentage: finiteNumberOrNull(attributes.update_percentage),
    available: state !== "unavailable" && state !== "unknown",
  };
}
