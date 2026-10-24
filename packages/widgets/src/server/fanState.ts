import type { HomeAssistantFan } from "../widgets/homeAssistantFan";
import { mapDeviceEntity } from "./deviceState";

/** Entity-id shape for the `fan` domain; also seeded into the registry. */
export const FAN_ENTITY_ID = /^fan\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/** Map a raw `fan` state, extending the normalized device shape. */
export function mapFanEntity(raw: unknown): HomeAssistantFan | null {
  const base = mapDeviceEntity(raw);
  if (!base || base.domain !== "fan") return null;

  const entity = raw as { attributes?: unknown };
  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};

  return {
    ...base,
    // The guard above narrows `base.domain`, but TypeScript does not carry that through the spread.
    domain: "fan",
    presetMode: stringOrNull(attributes.preset_mode),
    presetModes: stringList(attributes.preset_modes),
    oscillating: typeof attributes.oscillating === "boolean" ? attributes.oscillating : null,
  };
}
