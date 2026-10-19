import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
  HA_AGENT_BUSY_COPY,
  HA_AGENT_OFFLINE_COPY,
  HA_AGENT_TIMEOUT_COPY,
  type AgentMessage,
  type AgentResponseMessage,
} from "@homeslate/widgets/server";
import { createRelayCore } from "./core";
import { createAgentRegistry, type AgentHandle } from "./registry";

function fakeHandle(accountId = "acct") {
  const sent: AgentMessage[] = [];
  let open = true;
  const handle: AgentHandle = {
    accountId,
    agentId: "agent-1",
    send: (message) => sent.push(message),
    isOpen: () => open,
    close: () => {
      open = false;
    },
  };
  return { handle, sent };
}

function requestOf(message: AgentMessage | undefined) {
  return message as Extract<AgentMessage, { type: "request" }>;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("relay core", () => {
  it("rejects when no agent is connected", async () => {
    const core = createRelayCore({ registry: createAgentRegistry() });
    await expect(core.request("acct", "entities.list", { domain: "climate" })).rejects.toThrow(
      HA_AGENT_OFFLINE_COPY,
    );
  });

  it("forwards a request and resolves the matching response", async () => {
    const registry = createAgentRegistry();
    const { handle, sent } = fakeHandle();
    registry.bind(handle);
    const core = createRelayCore({ registry, newRequestId: () => "req-1" });

    const promise = core.request("acct", "entity.get", { entityId: "climate.attic" });
    expect(requestOf(sent[0])).toEqual({
      type: "request",
      id: "req-1",
      method: "entity.get",
      params: { entityId: "climate.attic" },
    });

    core.handleResponse("acct", {
      type: "response",
      id: "req-1",
      ok: true,
      result: { entityId: "climate.attic" },
    });
    await expect(promise).resolves.toEqual({ entityId: "climate.attic" });
  });

  it("rejects with the agent's error status and message", async () => {
    const registry = createAgentRegistry();
    registry.bind(fakeHandle().handle);
    const core = createRelayCore({ registry, newRequestId: () => "req-1" });

    const promise = core.request("acct", "entity.get", { entityId: "climate.attic" });
    core.handleResponse("acct", {
      type: "response",
      id: "req-1",
      ok: false,
      status: 502,
      error: "Home Assistant request failed",
    });
    await expect(promise).rejects.toMatchObject({
      status: 502,
      userMessage: "Home Assistant request failed",
    });
  });

  it("times out a request the agent never answers", async () => {
    vi.useFakeTimers();
    const registry = createAgentRegistry();
    registry.bind(fakeHandle().handle);
    const core = createRelayCore({
      registry,
      requestTimeoutMs: 5_000,
      newRequestId: () => "req-1",
    });

    const promise = core.request("acct", "entities.list", { domain: "climate" });
    const assertion = expect(promise).rejects.toThrow(HA_AGENT_TIMEOUT_COPY);
    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;
  });

  it("rejects past the per-account in-flight cap", async () => {
    const registry = createAgentRegistry();
    const { handle, sent } = fakeHandle();
    registry.bind(handle);
    let seq = 0;
    const core = createRelayCore({
      registry,
      maxInFlightPerAccount: 1,
      newRequestId: () => `req-${++seq}`,
    });

    const first = core.request("acct", "entities.list", { domain: "climate" });
    await expect(core.request("acct", "entities.list", { domain: "climate" })).rejects.toThrow(
      HA_AGENT_BUSY_COPY,
    );
    expect(core.inFlight("acct")).toBe(1);

    core.handleResponse("acct", { type: "response", id: "req-1", ok: true, result: [] });
    await expect(first).resolves.toEqual([]);
    expect(core.inFlight("acct")).toBe(0);
    expect(sent).toHaveLength(1);
  });

  it("ignores a response for an unknown or foreign request id", async () => {
    const registry = createAgentRegistry();
    registry.bind(fakeHandle().handle);
    const core = createRelayCore({ registry, newRequestId: () => "req-1" });

    const promise = core.request("acct", "entities.list", { domain: "climate" });
    const foreign: AgentResponseMessage = { type: "response", id: "other", ok: true, result: 1 };
    core.handleResponse("acct", foreign);
    expect(core.inFlight("acct")).toBe(1);
    core.handleResponse("acct", { type: "response", id: "req-1", ok: true, result: [] });
    await expect(promise).resolves.toEqual([]);
  });

  it("rejects everything for an account when asked", async () => {
    const registry = createAgentRegistry();
    registry.bind(fakeHandle().handle);
    let seq = 0;
    const core = createRelayCore({ registry, newRequestId: () => `req-${++seq}` });

    const first = core.request("acct", "entities.list", { domain: "climate" });
    const second = core.request("acct", "entities.list", { domain: "climate" });
    core.rejectAll("acct", new Error("gone"));
    await expect(first).rejects.toThrow("gone");
    await expect(second).rejects.toThrow("gone");
    expect(core.inFlight("acct")).toBe(0);
  });

  it("reports connection state from the registry", () => {
    const registry = createAgentRegistry();
    const core = createRelayCore({ registry });
    expect(core.connected("acct")).toBe(false);
    const { handle } = fakeHandle();
    registry.bind(handle);
    expect(core.connected("acct")).toBe(true);
  });
});
