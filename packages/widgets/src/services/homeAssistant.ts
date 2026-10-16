import {
  homeAssistantEntitiesUrl,
  homeAssistantServiceUrl,
  thermostatApiUrl,
  type HomeAssistantEntitySummary,
  type ThermostatState,
} from "../widgets/homeAssistant";

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

export async function fetchClimateEntities(
  domain = "climate",
): Promise<HomeAssistantEntitySummary[]> {
  const response = await fetch(homeAssistantEntitiesUrl(domain));
  if (!response.ok) {
    throw new HomeAssistantHttpError(
      response.status,
      await readError(response, "Failed to load thermostats"),
    );
  }
  const body = (await response.json()) as { entities?: unknown };
  if (!Array.isArray(body.entities)) return [];
  return body.entities as HomeAssistantEntitySummary[];
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
