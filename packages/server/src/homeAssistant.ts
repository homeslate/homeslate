import {
  buildServicePayload,
  isKnownDomain,
  isValidEntityId,
  mapHomeAssistantState,
  type HomeAssistantEntitySummary,
  type HomeAssistantState,
} from "@homeslate/widgets/server";
import {
  HOME_ASSISTANT_IMAGE_MAX_BYTES,
  normalizeHomeAssistantImagePath,
  type HomeAssistantImage,
} from "./homeAssistantImage";

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

/** Options for a service call that returns a response body (`return_response`). */
export type HomeAssistantServiceOptions = {
  /**
   * Home Assistant's `?return_response`: the service response body is returned
   * instead of being discarded. Required by reads implemented as services
   * (`weather.get_forecasts`, `todo.get_items`, …).
   */
  returnResponse?: boolean;
};

/**
 * Everything the `/api/homeassistant/*` routes need from Home Assistant. The
 * direct LAN client and the hosted relay transport both implement this one
 * generic seam — a domain allowlist lives in `@homeslate/widgets/server`, so
 * adding a widget never means adding a transport method.
 */
export type HomeAssistantTransport = {
  /** Sorted entity summaries for one allowlisted domain, for settings pickers. */
  listEntities(domain: string): Promise<HomeAssistantEntitySummary[]>;
  /** Raw-ish state for one entity, or `null` when Home Assistant has none. */
  getEntity(entityId: string): Promise<HomeAssistantState | null>;
  /**
   * Call a service. Rejects with a `400` `HomeAssistantError` when the domain,
   * service, entity id, or data are not allowed by the domain registry.
   */
  callService(
    domain: string,
    service: string,
    entityId: string,
    data: Record<string, unknown>,
    options?: HomeAssistantServiceOptions,
  ): Promise<unknown>;
  /**
   * Fetch an allowlisted Home Assistant image proxy path (media artwork or a
   * camera snapshot). Direct LAN transports implement this; relay transports
   * may add it later.
   */
  fetchImage?(path: string): Promise<HomeAssistantImage>;
};

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
): HomeAssistantTransport {
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
    async listEntities(domain) {
      if (!isKnownDomain(domain)) return [];
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
        if (!isValidEntityId(domain, entityId)) return [];
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

    async getEntity(entityId) {
      const domain = entityId.slice(0, entityId.indexOf("."));
      if (!isKnownDomain(domain) || !isValidEntityId(domain, entityId)) return null;
      const response = await request(`/api/states/${entityId}`);
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
      return mapHomeAssistantState(await response.json().catch(() => null));
    },

    async callService(domain, service, entityId, data, callOptions) {
      const payload = buildServicePayload(domain, service, entityId, data);
      if (!payload) {
        throw new HomeAssistantError(400, "Invalid service call");
      }
      const suffix = callOptions?.returnResponse ? "?return_response" : "";
      const response = await request(`/api/services/${domain}/${service}${suffix}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant request failed");
      }
      if (!callOptions?.returnResponse) return undefined;
      return response.json().catch(() => null);
    },

    async fetchImage(path) {
      const normalized = normalizeHomeAssistantImagePath(path);
      if (!normalized) throw new HomeAssistantError(400, "Invalid image path");
      const response = await fetchImpl(`${baseUrl}${normalized}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new HomeAssistantError(response.status, "Home Assistant image request failed");
      }
      const length = Number(response.headers.get("content-length") ?? "");
      if (Number.isFinite(length) && length > HOME_ASSISTANT_IMAGE_MAX_BYTES) {
        throw new HomeAssistantError(502, "Home Assistant image is too large");
      }
      return {
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
        body: await response.arrayBuffer(),
      };
    },
  };
}
