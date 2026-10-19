import {
  homeAssistantEntitiesUrl,
  homeAssistantServiceUrl,
  thermostatApiUrl,
  type HomeAssistantEntitySummary,
  type ThermostatState,
} from "../widgets/homeAssistant";
import {
  homeAssistantTodoItemsUrl,
  type HomeAssistantTodoItem,
} from "../widgets/homeAssistantTodo";

/** Thrown when a Home Assistant route responds with a non-OK status. */
export class HomeAssistantHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
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

export async function fetchHomeAssistantEntities(
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

export function fetchClimateEntities(domain = "climate"): Promise<HomeAssistantEntitySummary[]> {
  return fetchHomeAssistantEntities(domain, "Failed to load thermostats");
}

export function fetchTodoEntities(): Promise<HomeAssistantEntitySummary[]> {
  return fetchHomeAssistantEntities("todo", "Failed to load lists");
}

export async function fetchThermostat(entityId: string): Promise<ThermostatState> {
  const response = await fetch(thermostatApiUrl(entityId));
  if (!response.ok) {
    throw new HomeAssistantHttpError(
      response.status,
      await readError(response, "Failed to fetch thermostat"),
    );
  }
  return (await response.json()) as ThermostatState;
}

export async function callThermostatService(
  entityId: string,
  service: string,
  data: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(homeAssistantServiceUrl("climate", service), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity_id: entityId, ...data }),
  });
  if (!response.ok) {
    throw new HomeAssistantHttpError(
      response.status,
      await readError(response, "Failed to update thermostat"),
    );
  }
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

export async function callTodoService(
  entityId: string,
  service: string,
  data: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(homeAssistantServiceUrl("todo", service), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity_id: entityId, ...data }),
  });
  if (!response.ok) {
    throw new HomeAssistantHttpError(
      response.status,
      await readError(response, "Failed to update list"),
    );
  }
}
