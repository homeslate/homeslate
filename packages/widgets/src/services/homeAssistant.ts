import {
  homeAssistantCalendarEventsUrl,
  homeAssistantEntitiesUrl,
  homeAssistantServiceUrl,
  homeAssistantWeatherForecastUrl,
  thermostatApiUrl,
  type HomeAssistantEntitySummary,
  type ThermostatState,
} from "../widgets/homeAssistant";
import type { HomeAssistantCalendarEvent } from "../widgets/homeAssistantCalendar";
import type { HomeAssistantHistoryPoint } from "../widgets/homeAssistantHistory";
import { historyApiUrl } from "../widgets/homeAssistantHistory";
import type { HomeAssistantWeatherForecast } from "../widgets/homeAssistantWeather";
import {
  homeAssistantTodoItemsUrl,
  type HomeAssistantTodoItem,
} from "../widgets/homeAssistantTodo";

/** Thrown when a Home Assistant route responds with a non-OK status. */
export class HomeAssistantHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HomeAssistantHttpError";
  }
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error) return body.error;
  } catch {
    // Keep the stable fallback when the server did not return JSON.
  }
  return fallback;
}

export async function fetchEntities(
  domain: string,
  failureCopy: string,
): Promise<HomeAssistantEntitySummary[]> {
  const response = await fetch(homeAssistantEntitiesUrl(domain));
  if (!response.ok) {
    throw new HomeAssistantHttpError(response.status, await readError(response, failureCopy));
  }
  const body = (await response.json()) as { entities?: unknown };
  if (!Array.isArray(body.entities)) return [];
  return body.entities as HomeAssistantEntitySummary[];
}

/** @deprecated Use {@link fetchEntities}. */
export function fetchHomeAssistantEntities(
  domain: string,
  failureCopy: string,
): Promise<HomeAssistantEntitySummary[]> {
  return fetchEntities(domain, failureCopy);
}

export function fetchClimateEntities(domain = "climate"): Promise<HomeAssistantEntitySummary[]> {
  return fetchEntities(domain, "Failed to load thermostats");
}

export function fetchTodoEntities(): Promise<HomeAssistantEntitySummary[]> {
  return fetchEntities("todo", "Failed to load lists");
}

/** Fetch one entity's mapped state. Works for any allowlisted domain. */
export async function fetchEntity<T>(entityId: string, failureCopy: string): Promise<T> {
  const response = await fetch(thermostatApiUrl(entityId));
  if (!response.ok) {
    throw new HomeAssistantHttpError(response.status, await readError(response, failureCopy));
  }
  return (await response.json()) as T;
}

export function fetchThermostat(entityId: string): Promise<ThermostatState> {
  return fetchEntity<ThermostatState>(entityId, "Failed to fetch thermostat");
}

/** Call an allowlisted service on any domain. */
export async function callHomeAssistantService(
  domain: string,
  service: string,
  entityId: string,
  data: Record<string, unknown>,
  failureCopy: string,
): Promise<void> {
  const response = await fetch(homeAssistantServiceUrl(domain, service), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity_id: entityId, ...data }),
  });
  if (!response.ok) {
    throw new HomeAssistantHttpError(response.status, await readError(response, failureCopy));
  }
}

export function callThermostatService(
  entityId: string,
  service: string,
  data: Record<string, unknown>,
): Promise<void> {
  return callHomeAssistantService(
    "climate",
    service,
    entityId,
    data,
    "Failed to update thermostat",
  );
}

export async function fetchTodoItems(entityId: string): Promise<HomeAssistantTodoItem[]> {
  const response = await fetch(homeAssistantTodoItemsUrl(entityId));
  if (!response.ok) {
    throw new HomeAssistantHttpError(
      response.status,
      await readError(response, "Failed to load list"),
    );
  }
  const body = (await response.json()) as { items?: unknown };
  if (!Array.isArray(body.items)) return [];
  return body.items as HomeAssistantTodoItem[];
}

export function callTodoService(
  entityId: string,
  service: string,
  data: Record<string, unknown>,
): Promise<void> {
  return callHomeAssistantService("todo", service, entityId, data, "Failed to update list");
}

/** Fetch a `weather.get_forecasts` result for one entity and forecast type. */
export async function fetchHomeAssistantWeatherForecast(
  entityId: string,
  type: "daily" | "hourly",
  failureCopy: string,
): Promise<HomeAssistantWeatherForecast[]> {
  const response = await fetch(homeAssistantWeatherForecastUrl(entityId, type));
  if (!response.ok) {
    throw new HomeAssistantHttpError(response.status, await readError(response, failureCopy));
  }
  const body = (await response.json()) as { forecast?: unknown };
  return Array.isArray(body.forecast) ? (body.forecast as HomeAssistantWeatherForecast[]) : [];
}

/** Fetch `calendar.get_events` results over the next `daysAhead` days. */
export async function fetchHomeAssistantCalendarEvents(
  entityId: string,
  daysAhead: number,
  failureCopy: string,
): Promise<HomeAssistantCalendarEvent[]> {
  const response = await fetch(homeAssistantCalendarEventsUrl(entityId, daysAhead));
  if (!response.ok) {
    throw new HomeAssistantHttpError(response.status, await readError(response, failureCopy));
  }
  const body = (await response.json()) as { events?: unknown };
  return Array.isArray(body.events) ? (body.events as HomeAssistantCalendarEvent[]) : [];
}

/** Fetch numeric history for one entity over the last `hours`. */
export async function fetchHomeAssistantHistory(
  entityId: string,
  hours: number,
  failureCopy: string,
): Promise<HomeAssistantHistoryPoint[]> {
  const response = await fetch(historyApiUrl(entityId, hours));
  if (!response.ok) {
    throw new HomeAssistantHttpError(response.status, await readError(response, failureCopy));
  }
  const body = (await response.json()) as { points?: unknown };
  return Array.isArray(body.points) ? (body.points as HomeAssistantHistoryPoint[]) : [];
}
