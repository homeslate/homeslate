import type { DeviceDomain, HomeAssistantDevice } from "../widgets/homeAssistantDevice";

/** Entity-id shape for the device domains; also seeded into the registry. */
export const DEVICE_DOMAIN_ENTITY_IDS = {
  light: /^light\.[a-z0-9_]+$/,
  switch: /^switch\.[a-z0-9_]+$/,
  input_boolean: /^input_boolean\.[a-z0-9_]+$/,
  fan: /^fan\.[a-z0-9_]+$/,
} as const;

const DEVICE_ENTITY_ID = /^(light|switch|input_boolean|fan)\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Convert HA's 0–255 light brightness scale to 0–100. */
function brightnessToPct(brightness: number): number {
  return Math.round((Math.min(255, Math.max(0, brightness)) * 100) / 255);
}

/** Map a raw `light` / `switch` / `input_boolean` / `fan` state, or `null`. */
export function mapDeviceEntity(raw: unknown): HomeAssistantDevice | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  const match = DEVICE_ENTITY_ID.exec(entityId);
  if (!match) return null;
  const domain = match[1] as DeviceDomain;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  const isOn = state === "on";
  const brightness = finiteNumberOrNull(attributes.brightness);
  const percentage = finiteNumberOrNull(attributes.percentage);

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    domain,
    isOn,
    brightnessPct: domain === "light" && brightness !== null ? brightnessToPct(brightness) : null,
    percentage: domain === "fan" && percentage !== null ? percentage : null,
    supportedFeatures: finiteNumberOrNull(attributes.supported_features) ?? 0,
    control: domain === "light" ? "brightness" : "toggle",
    available: state !== "unavailable" && state !== "unknown",
  };
}

export type { DeviceDomain };
