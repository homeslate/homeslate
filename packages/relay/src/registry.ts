import type { AgentMessage } from "@homeslate/widgets/server";

/** One live agent connection, as seen by the relay. */
export type AgentHandle = {
  readonly accountId: string;
  readonly agentId: string;
  send(message: AgentMessage): void;
  isOpen(): boolean;
  close(): void;
};

/**
 * Tracks the single live agent per account. Rebinding an account replaces (and
 * closes) the previous handle, so a reconnect always wins.
 */
export type AgentRegistry = {
  /** Bind a handle; returns the handle it replaced, if any. */
  bind(handle: AgentHandle): AgentHandle | null;
  /** Remove `handle` only if it is still the account's current handle. */
  remove(accountId: string, handle: AgentHandle): void;
  get(accountId: string): AgentHandle | null;
  accounts(): string[];
  clear(): void;
};

export function createAgentRegistry(): AgentRegistry {
  const handles = new Map<string, AgentHandle>();
  return {
    bind(handle) {
      const previous = handles.get(handle.accountId) ?? null;
      handles.set(handle.accountId, handle);
      if (previous && previous !== handle) previous.close();
      return previous;
    },
    remove(accountId, handle) {
      if (handles.get(accountId) === handle) handles.delete(accountId);
    },
    get(accountId) {
      return handles.get(accountId) ?? null;
    },
    accounts() {
      return [...handles.keys()];
    },
    clear() {
      handles.clear();
    },
  };
}
