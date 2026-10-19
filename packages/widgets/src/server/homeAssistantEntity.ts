/**
 * The generic, domain-agnostic Home Assistant shapes.
 *
 * `HomeAssistantState` is the raw-ish state object the transport reads from Home
 * Assistant (`GET /api/states/:entity_id`). It keeps the full attribute bag so
 * each domain's mapper (`mapClimateEntity`, …) can read what it needs.
 *
 * `HomeAssistantEntity` is the normalized fallback returned for domains that
 * have no dedicated mapper yet: a small, whitelisted projection that never leaks
 * the whole attribute bag to the browser.
 */

/** A Home Assistant state object, narrowed to the fields the proxy uses. */
export type HomeAssistantState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};

/** The generic projection returned for a domain without a dedicated mapper. */
export type HomeAssistantEntity = {
  entityId: string;
  name: string;
  state: string;
  unit: string | null;
  deviceClass: string | null;
  supportedFeatures: number | null;
  attributes: Record<string, unknown>;
};

/**
 * Attributes safe to hand the browser on the generic path. Domain mappers are
 * free to surface more; this is only the fallback so an unmapped domain still
 * returns something useful without a wholesale attribute dump.
 */
const GENERIC_ATTRIBUTE_KEYS = [
  "device_class",
  "unit_of_measurement",
  "supported_features",
  "icon",
  "entity_picture",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Narrow an arbitrary JSON value into a `HomeAssistantState`, or `null`. */
export function mapHomeAssistantState(raw: unknown): HomeAssistantState | null {
  if (!isRecord(raw)) return null;
  const entityId = raw.entity_id;
  if (typeof entityId !== "string" || entityId.length === 0) return null;
  return {
    entity_id: entityId,
    state: typeof raw.state === "string" ? raw.state : "unknown",
    attributes: isRecord(raw.attributes) ? raw.attributes : {},
  };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Project a state into the generic entity shape used by unmapped domains. */
export function mapHomeAssistantEntity(raw: unknown): HomeAssistantEntity | null {
  const state = mapHomeAssistantState(raw);
  if (!state) return null;

  const attributes = state.attributes;
  const name = stringOrNull(attributes.friendly_name) ?? state.entity_id;
  const projected: Record<string, unknown> = {};
  for (const key of GENERIC_ATTRIBUTE_KEYS) {
    if (attributes[key] !== undefined) projected[key] = attributes[key];
  }

  return {
    entityId: state.entity_id,
    name,
    state: state.state,
    unit: stringOrNull(attributes.unit_of_measurement),
    deviceClass: stringOrNull(attributes.device_class),
    supportedFeatures: finiteNumberOrNull(attributes.supported_features),
    attributes: projected,
  };
}
