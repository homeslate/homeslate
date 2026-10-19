import {
  buildClimateServicePayload,
  buildTodoServicePayload,
  isValidClimateEntityId,
  isValidTodoEntityId,
  mapClimateEntity,
  mapTodoItems,
  type HomeAssistantEntitySummary,
  type HomeAssistantTodoItem,
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
  /** Sorted `todo` entities for the widget settings picker. */
  listTodoEntities(): Promise<HomeAssistantEntitySummary[]>;
  /** `null` when Home Assistant has no such entity. */
  getClimateState(entityId: string): Promise<ThermostatState | null>;
  /** Rejects with a `400` `HomeAssistantError` when the call is invalid. */
  callClimateService(
    service: string,
    entityId: string,
    data: Record<string, unknown>,
  ): Promise<void>;
  /** Items for a `todo` entity, normalized and in Home Assistant order. */
  getTodoItems(entityId: string): Promise<HomeAssistantTodoItem[]>;
  /** Rejects with a `400` `HomeAssistantError` when the call is invalid. */
  callTodoService(service: string, entityId: string, data: Record<string, unknown>): Promise<void>;
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

  async function listEntities(
    domain: string,
    isValidEntityId: (id: string) => boolean,
  ): Promise<HomeAssistantEntitySummary[]> {
    const response = await request("/api/states");
    if (!response.ok) {
      throw new HomeAssistantError(response.status, "Home Assistant request failed");
    }
    const states = await response.json().catch(() => null);
    if (!Array.isArray(states)) return [];
    const prefix = `${domain}.`;
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
      if (typeof entityId !== "string" || !entityId.startsWith(prefix)) return [];
      if (!isValidEntityId(entityId)) return [];
      const attrs =
        attributes && typeof attributes === "object" ? (attributes as Record<string, unknown>) : {};
      const name =
        typeof attrs.friendly_name === "string" && attrs.friendly_name
          ? attrs.friendly_name
          : entityId;
      return [{ entityId, name, state: typeof state === "string" ? state : "unknown" }];
    });
    return entities.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    listClimateEntities: () => listEntities("climate", isValidClimateEntityId),
    listTodoEntities: () => listEntities("todo", isValidTodoEntityId),

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

    async getTodoItems(entityId) {
      if (!isValidTodoEntityId(entityId)) return [];
      const response = await request("/api/services/todo/get_items?return_response", {
        method: "POST",
        body: JSON.stringify({ entity_id: entityId }),
      });
      if (response.status === 404) return [];
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
      return mapTodoItems(await response.json().catch(() => null), entityId);
    },

    async callTodoService(service, entityId, data) {
      const payload = buildTodoServicePayload(service, entityId, data);
      if (!payload) {
        throw new HomeAssistantError(400, "Invalid todo service call");
      }
      const response = await request(`/api/services/todo/${service}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
    },
  };
}
