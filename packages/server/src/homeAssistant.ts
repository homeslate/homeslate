import {
  buildClimateServicePayload,
  isValidClimateEntityId,
  mapClimateEntity,
  type HomeAssistantEntitySummary,
  type ThermostatState,
} from "@homeslate/widgets/server";

const REQUEST_TIMEOUT_MS = 10_000;

export type HomeAssistantClientOptions = {
  /** Home Assistant origin, e.g. `http://homeassistant.local:8123`. */
  baseUrl: string;
  /** Long-lived access token. */
  token: string;
  /** Override the fetch implementation (tests). */
  fetchImpl?: typeof fetch;
};

/** Thrown when Home Assistant responds with a non-OK status. */
export class HomeAssistantError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HomeAssistantError";
  }
}

export type HomeAssistantClient = {
  /** Sorted climate entities for the widget settings picker. */
  listClimateEntities(): Promise<HomeAssistantEntitySummary[]>;
  /** `null` when Home Assistant has no such entity. */
  getClimateState(entityId: string): Promise<ThermostatState | null>;
  /** Rejects with a `400` `HomeAssistantError` when the call is invalid. */
  callClimateService(
    service: string,
    entityId: string,
    data: Record<string, unknown>,
  ): Promise<void>;
};

export function createHomeAssistantClient(
  options: HomeAssistantClientOptions,
): HomeAssistantClient {
  const baseUrl = options.baseUrl.trim().replace(/\/+$/, "");
  const token = options.token.trim();
  const fetchImpl = options.fetchImpl ?? fetch;

  async function request(path: string, init?: RequestInit): Promise<Response> {
    return fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }

  return {
    async listClimateEntities() {
      const response = await request("/api/states");
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
      const states = await response.json().catch(() => null);
      if (!Array.isArray(states)) return [];
      const entities = states.flatMap((raw): HomeAssistantEntitySummary[] => {
        if (!raw || typeof raw !== "object") return [];
        const {
          entity_id: entityId,
          state,
          attributes,
        } = raw as {
          entity_id?: unknown;
          state?: unknown;
          attributes?: unknown;
        };
        if (typeof entityId !== "string" || !isValidClimateEntityId(entityId)) return [];
        const attrs =
          attributes && typeof attributes === "object"
            ? (attributes as Record<string, unknown>)
            : {};
        const name =
          typeof attrs.friendly_name === "string" && attrs.friendly_name
            ? attrs.friendly_name
            : entityId;
        return [{ entityId, name, state: typeof state === "string" ? state : "unknown" }];
      });
      return entities.sort((a, b) => a.name.localeCompare(b.name));
    },

    async getClimateState(entityId) {
      if (!isValidClimateEntityId(entityId)) return null;
      const response = await request(`/api/states/${entityId}`);
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
      return mapClimateEntity(await response.json().catch(() => null));
    },

    async callClimateService(service, entityId, data) {
      const payload = buildClimateServicePayload(service, entityId, data);
      if (!payload) {
        throw new HomeAssistantError(400, "Invalid climate service call");
      }
      const response = await request(`/api/services/climate/${service}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
    },
  };
}
