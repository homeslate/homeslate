import { HomeAssistantTransportError } from "@homeslate/server";
import {
  HA_AGENT_BUSY_COPY,
  HA_AGENT_OFFLINE_COPY,
  HA_AGENT_TIMEOUT_COPY,
  type AgentMethod,
  type AgentResponseMessage,
} from "@homeslate/widgets/server";
import type { AgentRegistry } from "./registry";

export type RelayCoreOptions = {
  registry: AgentRegistry;
  /** Per-request timeout before the relay gives up. Defaults to 10s. */
  requestTimeoutMs?: number;
  /** Concurrent in-flight requests allowed per account. Defaults to 8. */
  maxInFlightPerAccount?: number;
  /** Id generator, injectable for tests. */
  newRequestId?: () => string;
};

type Pending = {
  accountId: string;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
};

/**
 * Request correlation in front of the registry: forwards a method to the
 * account's live agent, awaits the matching response, and enforces a timeout and
 * an in-flight cap. Knows nothing about WebSockets.
 */
export type RelayCore = {
  request(
    accountId: string,
    method: AgentMethod,
    params: Record<string, unknown>,
  ): Promise<unknown>;
  handleResponse(accountId: string, message: AgentResponseMessage): void;
  connected(accountId: string): boolean;
  inFlight(accountId: string): number;
  /** Reject every pending request for an account (agent went away). */
  rejectAll(accountId: string, error: Error): void;
};

let sequence = 0;

export function createRelayCore(options: RelayCoreOptions): RelayCore {
  const timeoutMs = options.requestTimeoutMs ?? 10_000;
  const maxInFlight = options.maxInFlightPerAccount ?? 8;
  const newRequestId = options.newRequestId ?? (() => `req-${++sequence}-${Date.now()}`);
  const pending = new Map<string, Pending>();
  const inFlightByAccount = new Map<string, number>();

  function decrement(accountId: string): void {
    const next = (inFlightByAccount.get(accountId) ?? 1) - 1;
    if (next <= 0) inFlightByAccount.delete(accountId);
    else inFlightByAccount.set(accountId, next);
  }

  function settle(id: string): Pending | null {
    const entry = pending.get(id);
    if (!entry) return null;
    pending.delete(id);
    clearTimeout(entry.timer);
    decrement(entry.accountId);
    return entry;
  }

  return {
    connected(accountId) {
      const handle = options.registry.get(accountId);
      return Boolean(handle && handle.isOpen());
    },

    inFlight(accountId) {
      return inFlightByAccount.get(accountId) ?? 0;
    },

    request(accountId, method, params) {
      const handle = options.registry.get(accountId);
      if (!handle || !handle.isOpen()) {
        return Promise.reject(new HomeAssistantTransportError(503, HA_AGENT_OFFLINE_COPY));
      }
      if ((inFlightByAccount.get(accountId) ?? 0) >= maxInFlight) {
        return Promise.reject(new HomeAssistantTransportError(503, HA_AGENT_BUSY_COPY));
      }

      const id = newRequestId();
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          settle(id);
          reject(new HomeAssistantTransportError(504, HA_AGENT_TIMEOUT_COPY));
        }, timeoutMs);
        pending.set(id, { accountId, resolve, reject, timer });
        inFlightByAccount.set(accountId, (inFlightByAccount.get(accountId) ?? 0) + 1);
        handle.send({ type: "request", id, method, params });
      });
    },

    handleResponse(accountId, message) {
      const entry = pending.get(message.id);
      if (!entry || entry.accountId !== accountId) return;
      settle(message.id);
      if (message.ok) entry.resolve(message.result);
      else entry.reject(new HomeAssistantTransportError(message.status, message.error));
    },

    rejectAll(accountId, error) {
      for (const id of pending.keys()) {
        const entry = pending.get(id);
        if (!entry || entry.accountId !== accountId) continue;
        settle(id);
        entry.reject(error);
      }
    },
  };
}
