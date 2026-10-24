import { HomeAssistantTransportError } from "@homeslate/server";
import {
  AGENT_PROTOCOL_VERSION,
  HA_AGENT_OFFLINE_COPY,
  decodeAgentMessage,
  encodeAgentMessage,
  type AgentHelloMessage,
  type AgentMessage,
} from "@homeslate/widgets/server";
import type { RelayCore } from "./core";
import type { AgentHandle, AgentRegistry } from "./registry";

/** The minimal socket surface a session sends to and closes. */
export type RelaySocket = {
  send(data: string): void;
  close(code?: number, reason?: string): void;
};

/** What the relay learns about an agent after a successful `hello`. */
export type AgentBinding = { accountId: string; agentId: string };

/** Resolve a `hello` to its account binding, or `null` to reject. */
export type HelloAuthenticator = (
  hello: AgentHelloMessage,
) => AgentBinding | null | Promise<AgentBinding | null>;

export type RelaySessionOptions = {
  socket: RelaySocket;
  authenticate: HelloAuthenticator;
  registry: AgentRegistry;
  core: RelayCore;
  /** Ping interval. A socket that misses two is closed. Defaults to 20s. */
  heartbeatMs?: number;
};

export type RelaySessionState = "pending" | "authenticated" | "closed";

export type RelaySession = {
  handleMessage(raw: unknown): void;
  close(): void;
  state(): RelaySessionState;
};

const CLOSE_UNAUTHORIZED = 4001;

/**
 * Validate the first frame and resolve the agent's account. Pure and async so it
 * can be tested without a socket. Returns `null` for anything that isn't a
 * well-formed, authenticable `hello`, including a token/account mismatch.
 */
export async function authorizeHello(
  authenticate: HelloAuthenticator,
  raw: unknown,
): Promise<{ binding: AgentBinding; hello: AgentHelloMessage } | null> {
  const message = decodeAgentMessage(raw);
  if (!message || message.type !== "hello") return null;
  const binding = await authenticate(message);
  if (!binding || binding.accountId !== message.accountId) return null;
  return { binding, hello: message };
}

/**
 * One agent connection. Handles the hello handshake, routes responses into the
 * relay core, and tears down (rejecting pending work) when the socket ends.
 */
export function createRelaySession(options: RelaySessionOptions): RelaySession {
  const heartbeatMs = options.heartbeatMs ?? 20_000;
  let current: RelaySessionState = "pending";
  let handle: AgentHandle | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let missed = 0;

  // A function call, so TypeScript does not narrow `current` across an await (close() can run meanwhile).
  const isClosed = (): boolean => current === "closed";

  function send(message: AgentMessage): void {
    if (current === "closed") return;
    try {
      options.socket.send(encodeAgentMessage(message));
    } catch {
      close();
    }
  }

  function close(): void {
    if (current === "closed") return;
    current = "closed";
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    if (handle) {
      // Only reject pending work if this handle is still the account's current
      // one; a reconnect has already replaced it and owns the account's queue.
      const isCurrent = options.registry.get(handle.accountId) === handle;
      options.registry.remove(handle.accountId, handle);
      if (isCurrent) {
        options.core.rejectAll(
          handle.accountId,
          new HomeAssistantTransportError(503, HA_AGENT_OFFLINE_COPY),
        );
      }
      handle = null;
    }
    options.socket.close();
  }

  function startHeartbeat(): void {
    heartbeat = setInterval(() => {
      if (missed >= 2) {
        close();
        return;
      }
      missed += 1;
      send({ type: "ping" });
    }, heartbeatMs);
  }

  return {
    state: () => current,

    async handleMessage(raw) {
      if (current === "closed") return;
      missed = 0;

      if (current === "pending") {
        const authorized = await authorizeHello(options.authenticate, raw);
        if (!authorized) {
          current = "closed";
          options.socket.close(CLOSE_UNAUTHORIZED, "unauthorized");
          return;
        }
        if (isClosed()) return;
        handle = {
          accountId: authorized.binding.accountId,
          agentId: authorized.binding.agentId,
          send: (message) => send(message),
          isOpen: () => current === "authenticated",
          close: () => close(),
        };
        current = "authenticated";
        options.registry.bind(handle);
        send({ type: "welcome", protocol: AGENT_PROTOCOL_VERSION, heartbeatMs });
        startHeartbeat();
        return;
      }

      const message = decodeAgentMessage(raw);
      if (!message) return;
      if (message.type === "response" && handle) {
        options.core.handleResponse(handle.accountId, message);
      } else if (message.type === "ping") {
        send({ type: "pong" });
      }
    },

    close,
  };
}
