import {
  CLIMATE_ENTITY_ID,
  CLIMATE_SERVICE_KEYS,
  buildClimateServicePayload,
  mapClimateEntity,
} from "./climateState";
import { CALENDAR_ENTITY_ID } from "./calendarState";
import { COVER_ENTITY_ID, mapCoverEntity } from "./coverState";
import { DEVICE_DOMAIN_ENTITY_IDS, mapDeviceEntity } from "./deviceState";
import { ALARM_ENTITY_ID, mapAlarmEntity } from "./alarmState";
import { CAMERA_ENTITY_ID, mapCameraEntity } from "./cameraState";
import { FAN_ENTITY_ID, mapFanEntity } from "./fanState";
import { HUMIDIFIER_ENTITY_ID, mapHumidifierEntity } from "./humidifierState";
import { LAWN_MOWER_ENTITY_ID, mapLawnMowerEntity } from "./lawnMowerState";
import { LOCK_ENTITY_ID, mapLockEntity } from "./lockState";
import { MEDIA_PLAYER_ENTITY_ID, mapMediaPlayerEntity } from "./mediaPlayerState";
import { UPDATE_ENTITY_ID, mapUpdateEntity } from "./updateState";
import { VACUUM_ENTITY_ID, mapVacuumEntity } from "./vacuumState";
import { WATER_HEATER_ENTITY_ID, mapWaterHeaterEntity } from "./waterHeaterState";
import { mapHomeAssistantEntity } from "./homeAssistantEntity";
import { PRESENCE_DOMAIN_ENTITY_IDS, mapPresenceEntity } from "./presenceState";
import { SENSOR_DOMAIN_ENTITY_IDS, mapSensorEntity } from "./sensorState";
import { TODO_ENTITY_ID, TODO_SERVICE_KEYS, buildTodoServicePayload } from "./todoState";
import { WEATHER_ENTITY_ID, mapWeatherEntity } from "./weatherState";

/**
 * One Home Assistant domain, described once and shared by every layer: the
 * server routes, the agent, the relay, and the widget settings pickers.
 *
 * A spec is the whole allowlist for a domain: which entity ids are valid, which
 * services may be called, which data keys each service accepts, and how to shape
 * an outgoing service payload or an incoming state.
 */
export type DomainSpec = {
  domain: string;
  /** Entity-id shape, e.g. `/^light\.[a-z0-9_]+$/`. */
  entityId: RegExp;
  /** Service name → the data keys that service accepts. */
  services: Record<string, readonly string[]>;
  /**
   * Build the exact upstream payload for a service call, or `null` to reject.
   * Omit for services that only need an `entity_id` plus allowlisted scalar keys.
   */
  buildPayload?: (
    service: string,
    entityId: string,
    data: Record<string, unknown>,
  ) => Record<string, unknown> | null;
  /** Normalize a raw state into the widget-facing shape. Omit for the generic projection. */
  map?: (raw: unknown) => unknown | null;
};

const registry = new Map<string, DomainSpec>();

/** Register (or replace) a domain. Production seeds climate + todo below. */
export function registerDomainSpec(spec: DomainSpec): void {
  registry.set(spec.domain, spec);
}

export function getDomainSpec(domain: string): DomainSpec | null {
  return registry.get(domain) ?? null;
}

/** Domains the proxy knows about. Grows as widgets are added. */
export function isKnownDomain(domain: string): boolean {
  return registry.has(domain);
}

export function knownDomains(): string[] {
  return [...registry.keys()];
}

const DOMAIN_SLUG = /^[a-z0-9_]+$/;

/** The domain part of an entity id (`light.kitchen` → `light`), or `null`. */
export function entityDomain(entityId: string): string | null {
  const dot = entityId.indexOf(".");
  if (dot <= 0 || dot === entityId.length - 1) return null;
  const domain = entityId.slice(0, dot);
  return DOMAIN_SLUG.test(domain) ? domain : null;
}

/** True when `id` is a valid entity id for a known `domain`. */
export function isValidEntityId(domain: string, id: string): boolean {
  const spec = registry.get(domain);
  return Boolean(spec && spec.entityId.test(id));
}

/** True when `service` is on the allowlist for a known `domain`. */
export function isAllowedService(domain: string, service: string): boolean {
  const spec = registry.get(domain);
  return Boolean(spec && Object.prototype.hasOwnProperty.call(spec.services, service));
}

/**
 * Build the exact payload Home Assistant expects, or `null` when the domain,
 * service, entity id, or data are not allowed. Unknown keys are dropped.
 */
export function buildServicePayload(
  domain: string,
  service: string,
  entityId: string,
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  const spec = registry.get(domain);
  if (!spec) return null;
  if (!Object.prototype.hasOwnProperty.call(spec.services, service)) return null;
  if (!spec.entityId.test(entityId)) return null;

  if (spec.buildPayload) return spec.buildPayload(service, entityId, data);

  const payload: Record<string, unknown> = { entity_id: entityId };
  for (const key of spec.services[service] ?? []) {
    const value = data[key];
    if (value === undefined) continue;
    if (typeof value === "string" && value.length > 0) payload[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) payload[key] = value;
    else if (typeof value === "boolean") payload[key] = value;
  }
  return payload;
}

/** Normalize a raw state: the domain's mapper when present, else the generic entity. */
export function mapEntity(domain: string, raw: unknown): unknown | null {
  const spec = registry.get(domain);
  if (spec?.map) return spec.map(raw);
  return mapHomeAssistantEntity(raw);
}

registerDomainSpec({
  domain: "climate",
  entityId: CLIMATE_ENTITY_ID,
  services: CLIMATE_SERVICE_KEYS,
  buildPayload: buildClimateServicePayload,
  map: mapClimateEntity,
});

registerDomainSpec({
  domain: "todo",
  entityId: TODO_ENTITY_ID,
  services: TODO_SERVICE_KEYS,
  buildPayload: buildTodoServicePayload,
});

/** Read-only sensor family (Sensors widget). */
for (const domain of ["sensor", "binary_sensor", "number", "input_number"] as const) {
  registerDomainSpec({
    domain,
    entityId: SENSOR_DOMAIN_ENTITY_IDS[domain],
    services: {},
    map: mapSensorEntity,
  });
}

/** Fire-and-forget scenes, scripts, and buttons (Scenes & Scripts widget). */
registerDomainSpec({
  domain: "scene",
  entityId: /^scene\.[a-z0-9_]+$/,
  services: { turn_on: ["transition"] },
});

registerDomainSpec({
  domain: "script",
  entityId: /^script\.[a-z0-9_]+$/,
  services: { turn_on: [], toggle: [] },
});

registerDomainSpec({
  domain: "button",
  entityId: /^button\.[a-z0-9_]+$/,
  services: { press: [] },
});

registerDomainSpec({
  domain: "input_button",
  entityId: /^input_button\.[a-z0-9_]+$/,
  services: { press: [] },
});

/** Read-only presence family (Presence widget). */
for (const domain of ["person", "device_tracker", "zone"] as const) {
  registerDomainSpec({
    domain,
    entityId: PRESENCE_DOMAIN_ENTITY_IDS[domain],
    services: {},
    map: mapPresenceEntity,
  });
}

/** Weather and calendar are read through `return_response` service calls. */
registerDomainSpec({
  domain: "weather",
  entityId: WEATHER_ENTITY_ID,
  services: { get_forecasts: ["type"] },
  map: mapWeatherEntity,
});

registerDomainSpec({
  domain: "calendar",
  entityId: CALENDAR_ENTITY_ID,
  services: { get_events: ["start_date_time", "end_date_time", "duration"] },
});

/** On/off device family (Devices widget). */
registerDomainSpec({
  domain: "light",
  entityId: DEVICE_DOMAIN_ENTITY_IDS.light,
  services: {
    turn_on: ["brightness_pct", "transition"],
    turn_off: ["transition"],
    toggle: [],
  },
  map: mapDeviceEntity,
});

for (const domain of ["switch", "input_boolean"] as const) {
  registerDomainSpec({
    domain,
    entityId: DEVICE_DOMAIN_ENTITY_IDS[domain],
    services: { turn_on: [], turn_off: [], toggle: [] },
    map: mapDeviceEntity,
  });
}

/** Full fan control (Devices widget keeps the on/off subset). */
registerDomainSpec({
  domain: "fan",
  entityId: FAN_ENTITY_ID,
  services: {
    turn_on: [],
    turn_off: [],
    toggle: [],
    set_percentage: ["percentage"],
    set_preset_mode: ["preset_mode"],
    oscillate: ["oscillating"],
  },
  map: mapFanEntity,
});

/** Cover / garage family (Covers & Garage widget). */
registerDomainSpec({
  domain: "cover",
  entityId: COVER_ENTITY_ID,
  services: {
    open_cover: [],
    close_cover: [],
    stop_cover: [],
    set_cover_position: ["position"],
    toggle: [],
  },
  map: mapCoverEntity,
});

/** Security: locks and alarm panels. */
registerDomainSpec({
  domain: "lock",
  entityId: LOCK_ENTITY_ID,
  services: { lock: [], unlock: [], open: [] },
  map: mapLockEntity,
});

registerDomainSpec({
  domain: "alarm_control_panel",
  entityId: ALARM_ENTITY_ID,
  services: {
    alarm_arm_home: [],
    alarm_arm_away: [],
    alarm_arm_night: [],
    alarm_arm_vacation: [],
    alarm_disarm: [],
  },
  map: mapAlarmEntity,
});

/** Media player, with artwork served through the host image proxy. */
registerDomainSpec({
  domain: "media_player",
  entityId: MEDIA_PLAYER_ENTITY_ID,
  services: {
    media_play_pause: [],
    media_next_track: [],
    media_previous_track: [],
    volume_set: ["volume_level"],
    volume_mute: ["is_volume_muted"],
    select_source: ["source"],
    turn_on: [],
    turn_off: [],
  },
  map: mapMediaPlayerEntity,
});

/** Vacuum family. */
registerDomainSpec({
  domain: "vacuum",
  entityId: VACUUM_ENTITY_ID,
  services: {
    start: [],
    pause: [],
    stop: [],
    return_to_base: [],
    locate: [],
    clean_spot: [],
    set_fan_speed: ["fan_speed"],
  },
  map: mapVacuumEntity,
});

/** Humidifier and water heater controls. */
registerDomainSpec({
  domain: "humidifier",
  entityId: HUMIDIFIER_ENTITY_ID,
  services: {
    turn_on: [],
    turn_off: [],
    set_mode: ["mode"],
    set_humidity: ["humidity"],
  },
  map: mapHumidifierEntity,
});

registerDomainSpec({
  domain: "water_heater",
  entityId: WATER_HEATER_ENTITY_ID,
  services: {
    turn_on: [],
    turn_off: [],
    set_temperature: ["temperature"],
    set_operation_mode: ["operation_mode"],
  },
  map: mapWaterHeaterEntity,
});

/** Read-only camera state; snapshots ride the host image proxy. */
registerDomainSpec({
  domain: "camera",
  entityId: CAMERA_ENTITY_ID,
  services: {},
  map: mapCameraEntity,
});

/** Software updates (Updates widget). */
registerDomainSpec({
  domain: "update",
  entityId: UPDATE_ENTITY_ID,
  services: { install: [], skip: [] },
  map: mapUpdateEntity,
});

/** Lawn mowers (start/pause, dock, stop). */
registerDomainSpec({
  domain: "lawn_mower",
  entityId: LAWN_MOWER_ENTITY_ID,
  services: { start_pause: [], dock: [], stop: [] },
  map: mapLawnMowerEntity,
});
