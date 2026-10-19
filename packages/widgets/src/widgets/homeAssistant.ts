export type ThermostatUnit = "°C" | "°F";

/**
 * Normalized Home Assistant `climate` entity. Produced by `mapClimateEntity`
 * on the host and consumed by the Thermostat widget.
 */
export interface ThermostatState {
  entityId: string;
  name: string;
  /** Entity `state`: `off | heat | cool | heat_cool | auto | dry | fan_only | …`. */
  hvacMode: string;
  /** Entity `hvac_action`: `heating | cooling | idle | fan | drying | off | …`. */
  action: string | null;
  currentTemperature: number | null;
  currentHumidity: number | null;
  /** Single setpoint. */
  targetTemperature: number | null;
  /** Range setpoint (heat_cool / auto). */
  targetTemperatureLow: number | null;
  targetTemperatureHigh: number | null;
  unit: ThermostatUnit;
  hvacModes: string[];
  fanModes: string[];
  fanMode: string | null;
  presetModes: string[];
  presetMode: string | null;
  swingModes: string[];
  swingMode: string | null;
  minTemp: number;
  maxTemp: number;
  step: number;
}

/** A row in the widget settings entity picker. */
export interface HomeAssistantEntitySummary {
  entityId: string;
  name: string;
  state: string;
}

export const THERMOSTAT_EMPTY_COPY = "Pick a thermostat in settings.";
export const THERMOSTAT_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";
export const THERMOSTAT_UNAVAILABLE_COPY = "Unavailable";
/** Generic copy for an unmapped domain when Home Assistant is unconfigured. */
export const HA_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Relay configured, but no LAN agent is connected to it. */
export const HA_AGENT_OFFLINE_COPY =
  "Your Home Assistant agent is offline. Check that it's running and connected.";
/** The relay is at its per-account in-flight cap. */
export const HA_AGENT_BUSY_COPY = "Home Assistant is busy. Try again in a moment.";
/** The agent accepted the call but did not answer in time. */
export const HA_AGENT_TIMEOUT_COPY = "Home Assistant did not respond in time.";

export function thermostatApiUrl(entityId: string): string {
  return `/api/homeassistant/states/${encodeURIComponent(entityId)}`;
}

export function homeAssistantEntitiesUrl(domain: string): string {
  return `/api/homeassistant/entities?domain=${encodeURIComponent(domain)}`;
}

export function homeAssistantServiceUrl(domain: string, service: string): string {
  return `/api/homeassistant/services/${encodeURIComponent(domain)}/${encodeURIComponent(service)}`;
}

export function homeAssistantStatusUrl(): string {
  return "/api/homeassistant/status";
}

/**
 * Health of the host's Home Assistant transport, from
 * `GET /api/homeassistant/status`. `transport: "relay"` with `connected: false`
 * means a LAN agent is not connected.
 */
export interface HomeAssistantStatusSummary {
  configured: boolean;
  transport: "direct" | "relay" | null;
  connected: boolean;
  haReachable: boolean | null;
}

const HVAC_ACTION_LABELS: Record<string, string> = {
  heating: "Heating",
  cooling: "Cooling",
  idle: "Idle",
  fan: "Fan",
  drying: "Drying",
  off: "Off",
  preheating: "Preheating",
  defrosting: "Defrosting",
};

export function hvacActionLabel(action: string | null): string | null {
  if (!action) return null;
  const known = HVAC_ACTION_LABELS[action];
  if (known) return known;
  const spaced = action.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const HVAC_MODE_LABELS: Record<string, string> = {
  off: "Off",
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat / Cool",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only",
};

export function hvacModeLabel(mode: string): string {
  const known = HVAC_MODE_LABELS[mode];
  if (known) return known;
  const spaced = mode.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** True when the entity exposes a heat/cool range rather than one setpoint. */
export function isDualSetpoint(
  state: Pick<ThermostatState, "hvacMode" | "targetTemperatureLow" | "targetTemperatureHigh">,
): boolean {
  if (state.hvacMode === "heat_cool" || state.hvacMode === "auto") return true;
  return state.targetTemperatureLow !== null && state.targetTemperatureHigh !== null;
}

export function formatTemperature(value: number, unit: ThermostatUnit): string {
  return `${Math.round(value * 10) / 10}${unit}`;
}

export function clampSetpoint(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Move a setpoint by `delta` in `step` increments, clamped to `[min, max]`. */
export function stepSetpoint(
  current: number,
  delta: number,
  min: number,
  max: number,
  step: number,
): number {
  const safeStep = step > 0 ? step : 0.5;
  const next = clampSetpoint(current + delta, min, max);
  const snapped = Math.round(next / safeStep) * safeStep;
  return clampSetpoint(Number(snapped.toFixed(6)), min, max);
}

export type ThermostatSizeTier = "compact" | "medium" | "full";

export function getThermostatSizeTier(w: number, h: number): ThermostatSizeTier {
  if (h <= 2 || w <= 2) return "compact";
  if (h <= 3 || w <= 3) return "medium";
  return "full";
}
