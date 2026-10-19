import { randomUUID } from "node:crypto";
import { Hono } from "hono";

/**
 * A small, stateful mock of the Home Assistant REST API.
 *
 * It covers every domain the homeslate widgets know about, mutates state on
 * service calls, and answers the `return_response` reads used by the Weather,
 * Calendar, and To-Do widgets. Point the reference server at it with:
 *
 *   HOMEASSISTANT_BASE_URL=http://127.0.0.1:8125
 *   HOMEASSISTANT_TOKEN=mock-token
 */
export type MockEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
};

export type MockTodoItem = {
  uid: string;
  summary: string;
  status: "needs_action" | "completed";
};

export type MockHomeAssistant = {
  app: Hono;
  /** Restore every entity and to-do item to its seeded state. */
  reset(): void;
};

export type MockHomeAssistantOptions = {
  /** Bearer token to require. Defaults to `mock-token`; pass `null` to disable auth. */
  token?: string | null;
};

const DEFAULT_TOKEN = "mock-token";

function timestamp(): string {
  return new Date().toISOString();
}

function entity(
  entityId: string,
  state: string,
  attributes: Record<string, unknown> = {},
): MockEntity {
  const now = timestamp();
  return {
    entity_id: entityId,
    state,
    attributes: { friendly_name: entityId, ...attributes },
    last_changed: now,
    last_updated: now,
  };
}

function setState(target: MockEntity, state: string): void {
  target.state = state;
  const now = timestamp();
  target.last_changed = now;
  target.last_updated = now;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function daysFromNow(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function seedEntities(): Map<string, MockEntity> {
  const entities = new Map<string, MockEntity>();
  const add = (id: string, state: string, attributes?: Record<string, unknown>) =>
    entities.set(id, entity(id, state, attributes));

  // Climate + to-do
  add("climate.living_room", "heat", {
    friendly_name: "Living Room",
    current_temperature: 19.4,
    current_humidity: 42,
    temperature: 21,
    temperature_unit: "C",
    target_temp_step: 0.5,
    min_temp: 7,
    max_temp: 35,
    hvac_action: "heating",
    hvac_modes: ["off", "heat", "cool", "auto"],
    fan_modes: ["auto", "low", "high"],
    fan_mode: "auto",
    preset_modes: ["home", "away", "sleep"],
    preset_mode: "home",
    swing_modes: ["off", "on"],
    swing_mode: "off",
  });
  add("todo.shopping_list", "3", { friendly_name: "Shopping List" });
  add("todo.chores", "1", { friendly_name: "Chores" });

  // Sensors and binary sensors
  add("sensor.outdoor_temperature", "21.5", {
    friendly_name: "Outdoor Temperature",
    unit_of_measurement: "°C",
    device_class: "temperature",
  });
  add("sensor.indoor_humidity", "40", {
    friendly_name: "Indoor Humidity",
    unit_of_measurement: "%",
    device_class: "humidity",
  });
  add("sensor.home_power", "1250", {
    friendly_name: "Home Power",
    unit_of_measurement: "W",
    device_class: "power",
  });
  add("sensor.home_energy_today", "12.4", {
    friendly_name: "Home Energy Today",
    unit_of_measurement: "kWh",
    device_class: "energy",
  });
  add("number.target_temperature", "21", { friendly_name: "Target Temperature", min: 7, max: 35 });
  add("input_number.guest_count", "2", { friendly_name: "Guest Count", min: 0, max: 10 });
  add("binary_sensor.front_door", "on", {
    friendly_name: "Front Door",
    device_class: "door",
  });
  add("binary_sensor.living_room_window", "off", {
    friendly_name: "Living Room Window",
    device_class: "window",
  });
  add("binary_sensor.hall_motion", "on", {
    friendly_name: "Hall Motion",
    device_class: "motion",
  });

  // Scenes, scripts, and buttons
  add("scene.movie_night", "unknown", { friendly_name: "Movie Night" });
  add("scene.good_night", "unknown", { friendly_name: "Good Night" });
  add("script.good_morning", "off", { friendly_name: "Good Morning" });
  add("button.doorbell", "unknown", { friendly_name: "Doorbell" });
  add("input_button.reset", timestamp(), { friendly_name: "Reset" });

  // Presence
  add("person.dan", "home", { friendly_name: "Dan" });
  add("person.alex", "not_home", { friendly_name: "Alex" });
  add("device_tracker.alex_phone", "Work", { friendly_name: "Alex's Phone" });
  add("zone.home", "0", { friendly_name: "Home" });

  // Weather and calendar
  add("weather.home", "sunny", {
    friendly_name: "Home Weather",
    temperature: 22,
    temperature_unit: "°C",
    humidity: 55,
    pressure: 1015,
    wind_speed: 12,
    wind_bearing: 180,
    apparent_temperature: 21,
  });
  add("calendar.family", "off", { friendly_name: "Family Calendar" });

  // On/off devices
  add("light.kitchen", "on", {
    friendly_name: "Kitchen Lights",
    brightness: 128,
    supported_features: 41,
  });
  add("light.hall", "off", {
    friendly_name: "Hall Light",
    brightness: 0,
    supported_features: 41,
  });
  add("light.lamp", "on", {
    friendly_name: "Lamp",
    brightness: 255,
    supported_features: 41,
  });
  add("switch.kettle", "off", { friendly_name: "Kettle" });
  add("switch.coffee_maker", "off", { friendly_name: "Coffee Maker" });
  add("input_boolean.guest_mode", "off", { friendly_name: "Guest Mode" });
  add("fan.bedroom", "on", {
    friendly_name: "Bedroom Fan",
    percentage: 66,
    preset_mode: "sleep",
    preset_modes: ["normal", "sleep"],
    oscillating: true,
    supported_features: 11,
  });
  add("fan.air_purifier", "off", {
    friendly_name: "Air Purifier",
    percentage: 0,
    preset_modes: [],
    oscillating: false,
    supported_features: 1,
  });

  // Covers, locks, and alarms
  add("cover.garage_door", "open", {
    friendly_name: "Garage Door",
    device_class: "garage",
    current_position: 62,
    supported_features: 15,
  });
  add("cover.living_room_blind", "closed", {
    friendly_name: "Living Room Blind",
    device_class: "blind",
    current_position: 0,
    supported_features: 15,
  });
  add("lock.front_door", "locked", { friendly_name: "Front Door", supported_features: 1 });
  add("lock.back_door", "unlocked", { friendly_name: "Back Door", supported_features: 0 });
  add("alarm_control_panel.home", "armed_away", {
    friendly_name: "Home Alarm",
    supported_features: 39,
  });

  // Media, vacuum, humidifier, water heater
  add("media_player.kitchen", "playing", {
    friendly_name: "Kitchen Speaker",
    media_title: "Midnight City",
    media_artist: "M83",
    media_album_name: "Hurry Up, We're Dreaming",
    entity_picture: "/api/media_player_proxy/media_player.kitchen?token=mock",
    volume_level: 0.42,
    is_volume_muted: false,
    source: "Spotify",
    source_list: ["Spotify", "Radio", "TV"],
    media_duration: 245,
    media_position: 30,
    supported_features: 22973,
  });
  add("vacuum.downstairs", "cleaning", {
    friendly_name: "Downstairs Vacuum",
    battery_level: 72,
    fan_speed: "turbo",
    fan_speed_list: ["quiet", "standard", "turbo"],
    supported_features: 2047,
  });
  add("humidifier.bedroom", "on", {
    friendly_name: "Bedroom Humidifier",
    current_humidity: 38,
    humidity: 45,
    min_humidity: 30,
    max_humidity: 70,
    mode: "auto",
    available_modes: ["auto", "sleep"],
  });
  add("water_heater.basement", "eco", {
    friendly_name: "Basement Water Heater",
    current_temperature: 48,
    temperature: 52,
    min_temp: 30,
    max_temp: 60,
    target_temp_step: 0.5,
    temperature_unit: "C",
    operation_mode: "eco",
    operation_list: ["eco", "performance", "heat_pump"],
  });

  // Camera, updates, lawn mower
  add("camera.front_door", "idle", {
    friendly_name: "Front Door Camera",
    entity_picture: "/api/camera_proxy/camera.front_door?token=mock",
  });
  add("update.hacs", "on", {
    friendly_name: "HACS",
    installed_version: "1.0.0",
    latest_version: "1.1.0",
    in_progress: false,
    update_percentage: null,
  });
  add("update.home_assistant", "off", {
    friendly_name: "Home Assistant",
    installed_version: "2026.10.1",
    latest_version: "2026.10.1",
    in_progress: false,
    update_percentage: null,
  });
  add("update.mock_service", "on", {
    friendly_name: "Mock Service",
    installed_version: "0.9.0",
    latest_version: "1.0.0",
    in_progress: true,
    update_percentage: 42,
  });
  add("lawn_mower.back_yard", "docked", { friendly_name: "Back Yard Mower" });

  return entities;
}

function seedTodoItems(): Map<string, MockTodoItem[]> {
  return new Map([
    [
      "todo.shopping_list",
      [
        { uid: randomUUID(), summary: "Milk", status: "needs_action" },
        { uid: randomUUID(), summary: "Eggs", status: "needs_action" },
        { uid: randomUUID(), summary: "Bread", status: "needs_action" },
      ],
    ],
    ["todo.chores", [{ uid: randomUUID(), summary: "Water plants", status: "needs_action" }]],
  ]);
}

function weatherForecast() {
  const conditions = ["sunny", "partlycloudy", "rainy", "cloudy", "sunny"];
  return conditions.map((condition, index) => ({
    datetime: daysFromNow(index),
    condition,
    temperature: 22 - index,
    templow: 14 - index,
    precipitation_probability: index === 2 ? 70 : 10,
  }));
}

function calendarEvents() {
  return [
    {
      uid: "mock-event-1",
      summary: "Team standup",
      start: { dateTime: daysFromNow(0, 9) },
      end: { dateTime: daysFromNow(0, 10) },
    },
    {
      uid: "mock-event-2",
      summary: "Dentist",
      start: { dateTime: daysFromNow(1, 14) },
      end: { dateTime: daysFromNow(1, 15) },
    },
    {
      uid: "mock-event-3",
      summary: "Holiday",
      start: { date: daysFromNow(3).slice(0, 10) },
      end: { date: daysFromNow(4).slice(0, 10) },
    },
  ];
}

function serviceResponse(
  domain: string,
  service: string,
  entityId: string,
  todoItems: Map<string, MockTodoItem[]>,
): Record<string, unknown> {
  if (domain === "weather" && service === "get_forecasts") {
    return { [entityId]: { forecast: weatherForecast() } };
  }
  if (domain === "calendar" && service === "get_events") {
    return { [entityId]: { events: calendarEvents() } };
  }
  if (domain === "todo" && service === "get_items") {
    return { [entityId]: { items: todoItems.get(entityId) ?? [] } };
  }
  return {};
}

function setBrightness(target: MockEntity, body: Record<string, unknown>): void {
  const pct = num(body.brightness_pct);
  if (pct !== null) {
    target.attributes.brightness = Math.round((clamp(pct, 0, 100) * 255) / 100);
  }
}

function applyService(
  domain: string,
  service: string,
  target: MockEntity,
  body: Record<string, unknown>,
  todoItems: Map<string, MockTodoItem[]>,
): boolean {
  switch (domain) {
    case "light":
    case "switch":
    case "input_boolean":
    case "fan": {
      if (service === "turn_on") {
        setState(target, "on");
        if (domain === "light") setBrightness(target, body);
        const percentage = num(body.percentage);
        if (domain === "fan" && percentage !== null) {
          target.attributes.percentage = clamp(percentage, 0, 100);
        }
        return true;
      }
      if (service === "turn_off") {
        setState(target, "off");
        if (domain === "light") target.attributes.brightness = 0;
        if (domain === "fan") target.attributes.percentage = 0;
        return true;
      }
      if (service === "toggle") {
        setState(target, target.state === "on" ? "off" : "on");
        return true;
      }
      if (domain === "fan" && service === "set_percentage") {
        const percentage = num(body.percentage);
        if (percentage === null) return false;
        target.attributes.percentage = clamp(percentage, 0, 100);
        setState(target, percentage > 0 ? "on" : "off");
        return true;
      }
      if (domain === "fan" && service === "set_preset_mode") {
        const preset = text(body.preset_mode);
        if (!preset) return false;
        target.attributes.preset_mode = preset;
        return true;
      }
      if (domain === "fan" && service === "oscillate") {
        if (typeof body.oscillating !== "boolean") return false;
        target.attributes.oscillating = body.oscillating;
        return true;
      }
      return false;
    }

    case "cover": {
      const position = num(body.position);
      if (service === "open_cover") {
        setState(target, "open");
        target.attributes.current_position = 100;
        return true;
      }
      if (service === "close_cover") {
        setState(target, "closed");
        target.attributes.current_position = 0;
        return true;
      }
      if (service === "stop_cover") {
        const current = num(target.attributes.current_position) ?? 0;
        setState(target, current >= 50 ? "open" : "closed");
        return true;
      }
      if (service === "set_cover_position") {
        if (position === null) return false;
        const next = clamp(position, 0, 100);
        target.attributes.current_position = next;
        setState(target, next > 0 ? "open" : "closed");
        return true;
      }
      if (service === "toggle") {
        setState(target, target.state === "open" ? "closed" : "open");
        target.attributes.current_position = target.state === "open" ? 100 : 0;
        return true;
      }
      return false;
    }

    case "lock": {
      if (service === "lock") {
        setState(target, "locked");
        return true;
      }
      if (service === "unlock") {
        setState(target, "unlocked");
        return true;
      }
      if (service === "open") {
        setState(target, "open");
        return true;
      }
      return false;
    }

    case "alarm_control_panel": {
      const states: Record<string, string> = {
        alarm_arm_home: "armed_home",
        alarm_arm_away: "armed_away",
        alarm_arm_night: "armed_night",
        alarm_arm_vacation: "armed_vacation",
        alarm_disarm: "disarmed",
      };
      const next = states[service];
      if (!next) return false;
      setState(target, next);
      return true;
    }

    case "climate": {
      if (service === "set_temperature") {
        const temperature = num(body.temperature);
        const low = num(body.target_temp_low);
        const high = num(body.target_temp_high);
        if (temperature !== null) target.attributes.temperature = temperature;
        if (low !== null) target.attributes.target_temp_low = low;
        if (high !== null) target.attributes.target_temp_high = high;
        return temperature !== null || low !== null || high !== null;
      }
      if (service === "set_hvac_mode") {
        const mode = text(body.hvac_mode);
        if (!mode) return false;
        setState(target, mode);
        return true;
      }
      if (service === "set_fan_mode") {
        const mode = text(body.fan_mode);
        if (!mode) return false;
        target.attributes.fan_mode = mode;
        return true;
      }
      if (service === "set_preset_mode") {
        const mode = text(body.preset_mode);
        if (!mode) return false;
        target.attributes.preset_mode = mode;
        return true;
      }
      if (service === "set_swing_mode") {
        const mode = text(body.swing_mode);
        if (!mode) return false;
        target.attributes.swing_mode = mode;
        return true;
      }
      if (service === "turn_on") {
        setState(target, "heat");
        return true;
      }
      if (service === "turn_off") {
        setState(target, "off");
        return true;
      }
      return false;
    }

    case "media_player": {
      if (service === "media_play_pause") {
        setState(target, target.state === "playing" ? "paused" : "playing");
        return true;
      }
      if (service === "media_next_track" || service === "media_previous_track") {
        target.attributes.media_position = 0;
        return true;
      }
      if (service === "volume_set") {
        const level = num(body.volume_level);
        if (level === null) return false;
        target.attributes.volume_level = clamp(level, 0, 1);
        return true;
      }
      if (service === "volume_mute") {
        if (typeof body.is_volume_muted !== "boolean") return false;
        target.attributes.is_volume_muted = body.is_volume_muted;
        return true;
      }
      if (service === "select_source") {
        const source = text(body.source);
        if (!source) return false;
        target.attributes.source = source;
        return true;
      }
      if (service === "turn_on") {
        setState(target, "on");
        return true;
      }
      if (service === "turn_off") {
        setState(target, "off");
        return true;
      }
      return false;
    }

    case "vacuum": {
      if (service === "start") {
        setState(target, "cleaning");
        return true;
      }
      if (service === "pause") {
        setState(target, "paused");
        return true;
      }
      if (service === "stop") {
        setState(target, "idle");
        return true;
      }
      if (service === "return_to_base") {
        setState(target, "returning");
        return true;
      }
      if (service === "clean_spot") {
        setState(target, "cleaning");
        return true;
      }
      if (service === "locate") return true;
      if (service === "set_fan_speed") {
        const speed = text(body.fan_speed);
        if (!speed) return false;
        target.attributes.fan_speed = speed;
        return true;
      }
      return false;
    }

    case "humidifier": {
      if (service === "turn_on") {
        setState(target, "on");
        return true;
      }
      if (service === "turn_off") {
        setState(target, "off");
        return true;
      }
      if (service === "set_mode") {
        const mode = text(body.mode);
        if (!mode) return false;
        target.attributes.mode = mode;
        return true;
      }
      if (service === "set_humidity") {
        const humidity = num(body.humidity);
        if (humidity === null) return false;
        target.attributes.humidity = clamp(humidity, 0, 100);
        return true;
      }
      return false;
    }

    case "water_heater": {
      if (service === "turn_on") {
        setState(target, text(target.attributes.operation_mode) ?? "eco");
        return true;
      }
      if (service === "turn_off") {
        setState(target, "off");
        return true;
      }
      if (service === "set_temperature") {
        const temperature = num(body.temperature);
        if (temperature === null) return false;
        target.attributes.temperature = temperature;
        return true;
      }
      if (service === "set_operation_mode") {
        const mode = text(body.operation_mode);
        if (!mode) return false;
        target.attributes.operation_mode = mode;
        setState(target, mode);
        return true;
      }
      return false;
    }

    case "todo": {
      const items = todoItems.get(target.entity_id) ?? [];
      const item = text(body.item);
      if (service === "get_items") return true;
      if (service === "add_item") {
        if (!item) return false;
        items.push({ uid: randomUUID(), summary: item, status: "needs_action" });
      } else if (service === "update_item") {
        if (!item) return false;
        const match = items.find((entry) => entry.uid === item || entry.summary === item);
        if (!match) return false;
        const status = body.status === "completed" ? "completed" : "needs_action";
        match.status = status;
        const summary = text(body.summary);
        if (summary) match.summary = summary;
      } else if (service === "remove_item") {
        if (!item) return false;
        const index = items.findIndex((entry) => entry.uid === item || entry.summary === item);
        if (index < 0) return false;
        items.splice(index, 1);
      } else {
        return false;
      }
      todoItems.set(target.entity_id, items);
      setState(target, String(items.filter((entry) => entry.status === "needs_action").length));
      return true;
    }

    case "weather":
      return service === "get_forecasts";
    case "calendar":
      return service === "get_events";

    case "scene":
      return service === "turn_on";
    case "script":
      return service === "turn_on" || service === "toggle";
    case "button":
    case "input_button":
      return service === "press";

    case "update": {
      if (service === "install") {
        const latest = text(target.attributes.latest_version);
        if (latest) target.attributes.installed_version = latest;
        target.attributes.in_progress = false;
        target.attributes.update_percentage = null;
        setState(target, "off");
        return true;
      }
      if (service === "skip") {
        setState(target, "off");
        return true;
      }
      return false;
    }

    case "lawn_mower": {
      if (service === "start_pause") {
        setState(target, target.state === "mowing" ? "paused" : "mowing");
        return true;
      }
      if (service === "dock") {
        setState(target, "returning");
        return true;
      }
      if (service === "stop") {
        setState(target, "paused");
        return true;
      }
      return false;
    }

    default:
      return false;
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function placeholderImage(label: string): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#111827"/>
  <rect x="16" y="16" width="608" height="328" rx="12" fill="#1f2937" stroke="#374151" stroke-width="2"/>
  <text x="320" y="168" fill="#9ca3af" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" text-anchor="middle">Mock Home Assistant</text>
  <text x="320" y="204" fill="#f9fafb" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24" text-anchor="middle">${escapeXml(label)}</text>
</svg>`;
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}

export function createMockHomeAssistant(options: MockHomeAssistantOptions = {}): MockHomeAssistant {
  const token = options.token === undefined ? DEFAULT_TOKEN : options.token;
  let entities = seedEntities();
  let todoItems = seedTodoItems();
  const app = new Hono();

  app.use("/api/*", async (c, next) => {
    if (!token) return next();
    const authorization = c.req.header("authorization") ?? "";
    if (authorization !== `Bearer ${token}`) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });

  app.get("/api/", (c) => c.json({ message: "Home Assistant mock" }));

  app.get("/api/states", (c) => c.json([...entities.values()]));

  app.get("/api/states/:entityId", (c) => {
    const target = entities.get(c.req.param("entityId"));
    return target ? c.json(target) : c.json({ error: "Entity not found" }, 404);
  });

  app.get("/api/media_player_proxy/:entityId", (c) =>
    placeholderImage(`Media · ${c.req.param("entityId")}`),
  );

  app.get("/api/camera_proxy/:entityId", (c) =>
    placeholderImage(`Camera · ${c.req.param("entityId")}`),
  );

  app.post("/api/services/:domain/:service", async (c) => {
    const domain = c.req.param("domain");
    const service = c.req.param("service");
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const entityId = typeof body.entity_id === "string" ? body.entity_id : "";
    const target = entities.get(entityId);
    if (!target) return c.json({ error: "Entity not found" }, 404);

    if (!applyService(domain, service, target, body, todoItems)) {
      return c.json({ error: `Unsupported mock service: ${domain}.${service}` }, 400);
    }

    if (c.req.query("return_response") !== undefined) {
      return c.json(serviceResponse(domain, service, entityId, todoItems));
    }
    return c.json([]);
  });

  return {
    app,
    reset() {
      entities = seedEntities();
      todoItems = seedTodoItems();
    },
  };
}
