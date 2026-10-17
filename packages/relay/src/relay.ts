import { createRelayCore, type RelayCore } from "./core";
import { createAgentRegistry, type AgentRegistry } from "./registry";
import {
  createRelaySession,
  type HelloAuthenticator,
  type RelaySession,
  type RelaySocket,
} from "./session";
import { createRelayHomeAssistantTransport, type RelayHomeAssistantTransport } from "./transport";

export type HomeAssistantRelayOptions = {
  /** Resolve a `hello` to its account binding, or `null` to reject. */
  authenticate: HelloAuthenticator;
  requestTimeoutMs?: number;
  maxInFlightPerAccount?: number;
  heartbeatMs?: number;
  newRequestId?: () => string;
};

export type HomeAssistantRelay = {
  registry: AgentRegistry;
  core: RelayCore;
  /** Handle a freshly upgraded socket. The runtime binding calls this. */
  accept(socket: RelaySocket): RelaySession;
  /** A transport for one account, to hand to `createHomeslateServer`. */
  transport(accountId: string): RelayHomeAssistantTransport;
  isConnected(accountId: string): boolean;
  close(): void;
};

/**
 * The cloud side of the bridge: presence + request correlation for LAN agents.
 *
 * This is deliberately runtime-agnostic — it never touches a WebSocket library.
 * A host wires its own upgrade handler to `accept()` (see the Node binding), so
 * the same relay works under Node, a Durable Object, or anything else.
 */
export function createHomeAssistantRelay(options: HomeAssistantRelayOptions): HomeAssistantRelay {
  const registry = createAgentRegistry();
  const core = createRelayCore({
    registry,
    requestTimeoutMs: options.requestTimeoutMs,
    maxInFlightPerAccount: options.maxInFlightPerAccount,
    newRequestId: options.newRequestId,
  });
  const sessions = new Set<RelaySession>();

  return {
    registry,
    core,
    accept(socket) {
      const session = createRelaySession({
        socket,
        authenticate: options.authenticate,
        registry,
        core,
        heartbeatMs: options.heartbeatMs,
      });
      sessions.add(session);
      return session;
    },
    transport(accountId) {
      return createRelayHomeAssistantTransport(core, accountId);
    },
    isConnected(accountId) {
      return core.connected(accountId);
    },
    close() {
      for (const session of sessions) session.close();
      sessions.clear();
    },
  };
}
