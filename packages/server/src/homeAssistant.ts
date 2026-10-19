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

/**
 * A transport failure that already knows its own HTTP status and a safe,
 * user-facing message. A relay transport throws this to report `503` (agent
 * offline) and `504` (timeout) without the routes knowing what a relay is.
 */
export class HomeAssistantTransportError extends Error {
  constructor(
    readonly status: number,
    readonly userMessage: string,
  ) {
    super(userMessage);
    this.name = "HomeAssistantTransportError";
  }
}

/**
 * Everything the `/api/homeassistant/*` routes need from Home Assistant. The
 * direct LAN client and the hosted relay transport both implement this, so the
 * routes never care which one is wired up.
 */
export type HomeAssistantTransport = {
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

/**
 * Optional capability for transports that can read and write Home Assistant
 * `todo` lists. The direct LAN client implements it; the relay transport does
 * not yet, so the routes report an explicit "unsupported" error instead of
 * pretending the calls work.
 */
export type HomeAssistantTodoTransport = {
  /** Sorted `todo` entities for the widget settings picker. */
  listTodoEntities(): Promise<HomeAssistantEntitySummary[]>;
  /** Items for a `todo` entity, normalized and in Home Assistant order. */
  getTodoItems(entityId: string): Promise<HomeAssistantTodoItem[]>;
  /** Rejects with a `400` `HomeAssistantError` when the call is invalid. */
  callTodoService(service: string, entityId: string, data: Record<string, unknown>): Promise<void>;
};

/** Narrows a transport to one that supports Home Assistant `todo` lists. */
export function hasTodoSupport(
  transport: HomeAssistantTransport,
): transport is HomeAssistantTransport & HomeAssistantTodoTransport {
  return typeof (transport as { listTodoEntities?: unknown }).listTodoEntities === "function";
}

/** @deprecated Use {@link HomeAssistantTransport}. */
export type HomeAssistantClient = HomeAssistantTransport;

/** Health of the configured transport, surfaced by `GET /api/homeassistant/status`. */
export type HomeAssistantStatus = {
  configured: boolean;
  transport: "direct" | "relay" | null;
  connected: boolean;
  haReachable: boolean | null;
};

/** A transport that can report its own liveness (the relay transport does). */
export type HomeAssistantStatusProvider = {
  status(): Promise<Partial<HomeAssistantStatus>> | Partial<HomeAssistantStatus>;
};

export function hasStatus(
  transport: HomeAssistantTransport,
): transport is HomeAssistantTransport & HomeAssistantStatusProvider {
  return typeof (transport as { status?: unknown }).status === "function";
}

export function createHomeAssistantClient(
  options: HomeAssistantClientOptions,
): HomeAssistantTransport & HomeAssistantTodoTransport {
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
