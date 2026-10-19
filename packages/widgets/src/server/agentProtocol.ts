import { entityDomain, isAllowedService, isKnownDomain, isValidEntityId } from "./domains";

/**
 * Version of the agent ⇄ relay wire protocol. A mismatch is a clean reject on
 * both ends, so the two can ship independently.
 *
 * v2 replaced the per-domain methods (`climate.*`) with a generic entity +
 * service rail, and added the agent's supported-domain capability list to the
 * `hello`.
 */
export const AGENT_PROTOCOL_VERSION = 2;

/**
 * Methods a relay may forward to a LAN agent. Deliberately narrow: one generic
 * list/read/call trio, gated by the domain registry on both ends.
 */
export const AGENT_METHODS = ["entities.list", "entity.get", "service.call"] as const;

export type AgentMethod = (typeof AGENT_METHODS)[number];

export function isAgentMethod(value: unknown): value is AgentMethod {
  return typeof value === "string" && (AGENT_METHODS as readonly string[]).includes(value);
}

/** What the agent reports about itself: version, HA origin, and domain support. */
export type AgentCapabilities = {
  version: string;
  haBaseUrl: string;
  /** Domains this agent can serve (from its domain registry). */
  domains: string[];
};

/** Agent → relay, the first frame after the socket opens. */
export type AgentHelloMessage = {
  type: "hello";
  protocol: number;
  accountId: string;
  agentId: string;
  token: string;
  agent: AgentCapabilities;
};

/** Relay → agent, once the hello is accepted. */
export type AgentWelcomeMessage = {
  type: "welcome";
  protocol: number;
  heartbeatMs: number;
};

/** Relay → agent, a forwarded call. */
export type AgentRequestMessage = {
  type: "request";
  id: string;
  method: AgentMethod;
  params: Record<string, unknown>;
};

/** Agent → relay, the reply to a `request`. */
export type AgentResponseMessage =
  | { type: "response"; id: string; ok: true; result: unknown }
  | { type: "response"; id: string; ok: false; status: number; error: string };

export type AgentPingMessage = { type: "ping" };
export type AgentPongMessage = { type: "pong" };

export type AgentMessage =
  | AgentHelloMessage
  | AgentWelcomeMessage
  | AgentRequestMessage
  | AgentResponseMessage
  | AgentPingMessage
  | AgentPongMessage;

export function encodeAgentMessage(message: AgentMessage): string {
  return JSON.stringify(message);
}

/**
 * Parse and shape-check a wire message. Accepts a raw string or an already
 * parsed value. Returns `null` for anything unknown, malformed, or from a
 * different protocol version — callers treat `null` as "drop/close".
 */
export function decodeAgentMessage(raw: string | unknown): AgentMessage | null {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return normalizeAgentMessage(value);
}

function normalizeAgentMessage(value: unknown): AgentMessage | null {
  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;

  switch (message.type) {
    case "hello": {
      if (message.protocol !== AGENT_PROTOCOL_VERSION) return null;
      if (typeof message.accountId !== "string" || !message.accountId) return null;
      if (typeof message.agentId !== "string" || !message.agentId) return null;
      if (typeof message.token !== "string" || !message.token) return null;
      const agent =
        message.agent && typeof message.agent === "object"
          ? (message.agent as Record<string, unknown>)
          : {};
      return {
        type: "hello",
        protocol: AGENT_PROTOCOL_VERSION,
        accountId: message.accountId,
        agentId: message.agentId,
        token: message.token,
        agent: {
          version: typeof agent.version === "string" ? agent.version : "",
          haBaseUrl: typeof agent.haBaseUrl === "string" ? agent.haBaseUrl : "",
          domains: Array.isArray(agent.domains)
            ? agent.domains.filter((domain): domain is string => typeof domain === "string")
            : [],
        },
      };
    }
    case "welcome": {
      if (message.protocol !== AGENT_PROTOCOL_VERSION) return null;
      return {
        type: "welcome",
        protocol: AGENT_PROTOCOL_VERSION,
        heartbeatMs: typeof message.heartbeatMs === "number" ? message.heartbeatMs : 0,
      };
    }
    case "request": {
      if (typeof message.id !== "string" || !message.id) return null;
      if (!isAgentMethod(message.method)) return null;
      if (!message.params || typeof message.params !== "object") return null;
      return {
        type: "request",
        id: message.id,
        method: message.method,
        params: message.params as Record<string, unknown>,
      };
    }
    case "response": {
      if (typeof message.id !== "string" || !message.id) return null;
      if (message.ok === true) {
        return { type: "response", id: message.id, ok: true, result: message.result };
      }
      if (message.ok === false) {
        return {
          type: "response",
          id: message.id,
          ok: false,
          status: typeof message.status === "number" ? message.status : 502,
          error: typeof message.error === "string" ? message.error : "Agent request failed",
        };
      }
      return null;
    }
    case "ping":
      return { type: "ping" };
    case "pong":
      return { type: "pong" };
    default:
      return null;
  }
}

/**
 * Shape-check a request's params. Run on both the relay (before forwarding) and
 * the agent (before acting), so a malformed or out-of-scope call never reaches
 * Home Assistant. Reuses the same domain registry as the HTTP routes.
 */
export function validateAgentRequestParams(
  method: AgentMethod,
  params: unknown,
): { ok: true } | { ok: false; error: string } {
  if (!params || typeof params !== "object") return { ok: false, error: "Invalid params" };
  const values = params as Record<string, unknown>;

  switch (method) {
    case "entities.list": {
      const domain = values.domain;
      if (typeof domain !== "string" || !isKnownDomain(domain)) {
        return { ok: false, error: "Unsupported domain" };
      }
      return { ok: true };
    }
    case "entity.get": {
      const entityId = values.entityId;
      const domain = typeof entityId === "string" ? entityDomain(entityId) : null;
      if (!domain || !isKnownDomain(domain) || !isValidEntityId(domain, entityId as string)) {
        return { ok: false, error: "Invalid entity id" };
      }
      return { ok: true };
    }
    case "service.call": {
      const domain = values.domain;
      if (typeof domain !== "string" || !isKnownDomain(domain)) {
        return { ok: false, error: "Unsupported domain" };
      }
      const entityId = values.entityId;
      if (typeof entityId !== "string" || !isValidEntityId(domain, entityId)) {
        return { ok: false, error: "Invalid entity id" };
      }
      if (typeof values.service !== "string" || !isAllowedService(domain, values.service)) {
        return { ok: false, error: "Unsupported service" };
      }
      if (values.data !== undefined && (!values.data || typeof values.data !== "object")) {
        return { ok: false, error: "Invalid service data" };
      }
      if (values.returnResponse !== undefined && typeof values.returnResponse !== "boolean") {
        return { ok: false, error: "Invalid service data" };
      }
      return { ok: true };
    }
  }
}
