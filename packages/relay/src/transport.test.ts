import { describe, expect, it } from "vite-plus/test";
import type { AgentMessage } from "@homeslate/widgets/server";
import { createRelayCore } from "./core";
import { createAgentRegistry, type AgentHandle } from "./registry";
import { createRelayHomeAssistantTransport, type RelayHomeAssistantTransport } from "./transport";

function setup() {
  const registry = createAgentRegistry();
  const sent: AgentMessage[] = [];
  const handle: AgentHandle = {
    accountId: "acct",
    agentId: "a1",
    send: (message) => sent.push(message),
    isOpen: () => true,
    close: () => {},
  };
  registry.bind(handle);
  let seq = 0;
  const core = createRelayCore({ registry, newRequestId: () => `req-${++seq}` });
  const transport = createRelayHomeAssistantTransport(core, "acct");
  const lastRequest = () => sent.at(-1) as Extract<AgentMessage, { type: "request" }>;
  return { core, sent, transport, lastRequest };
}

describe("relay transport", () => {
  it("lists entities through the agent", async () => {
    const { core, transport, lastRequest } = setup();
    const promise = transport.listEntities("climate");
    expect(lastRequest()).toEqual({
      type: "request",
      id: expect.any(String),
      method: "entities.list",
      params: { domain: "climate" },
    });
    core.handleResponse("acct", {
      type: "response",
      id: lastRequest().id,
      ok: true,
      result: [{ entityId: "climate.attic", name: "Attic", state: "off" }],
    });
    await expect(promise).resolves.toEqual([
      { entityId: "climate.attic", name: "Attic", state: "off" },
    ]);
  });

  it("returns an empty list for a non-array result", async () => {
    const { core, transport, lastRequest } = setup();
    const promise = transport.listEntities("climate");
    core.handleResponse("acct", { type: "response", id: lastRequest().id, ok: true, result: null });
    await expect(promise).resolves.toEqual([]);
  });

  it("returns null for an unknown entity", async () => {
    const { core, transport, lastRequest } = setup();
    const promise = transport.getEntity("climate.attic");
    expect(lastRequest().method).toBe("entity.get");
    core.handleResponse("acct", { type: "response", id: lastRequest().id, ok: true, result: null });
    await expect(promise).resolves.toBeNull();
  });

  it("forwards a service call with domain, entity, service, and data", async () => {
    const { core, transport, lastRequest } = setup();
    const promise = transport.callService("climate", "set_temperature", "climate.attic", {
      temperature: 21,
    });
    expect(lastRequest()).toEqual({
      type: "request",
      id: expect.any(String),
      method: "service.call",
      params: {
        domain: "climate",
        entityId: "climate.attic",
        service: "set_temperature",
        data: { temperature: 21 },
        returnResponse: false,
      },
    });
    core.handleResponse("acct", {
      type: "response",
      id: lastRequest().id,
      ok: true,
      result: { ok: true },
    });
    await expect(promise).resolves.toBeUndefined();
  });

  it("returns the raw result when returnResponse is set", async () => {
    const { core, transport, lastRequest } = setup();
    const promise = transport.callService(
      "todo",
      "get_items",
      "todo.shopping",
      {},
      { returnResponse: true },
    );
    expect(lastRequest().params).toMatchObject({ returnResponse: true });
    core.handleResponse("acct", {
      type: "response",
      id: lastRequest().id,
      ok: true,
      result: { "todo.shopping": { items: [] } },
    });
    await expect(promise).resolves.toEqual({ "todo.shopping": { items: [] } });
  });

  it("rejects an unknown domain before touching the socket", async () => {
    const { sent, transport } = setup();
    await expect(transport.listEntities("weird")).rejects.toMatchObject({ status: 400 });
    await expect(
      transport.callService("weird", "turn_on", "weird.thing", {}),
    ).rejects.toMatchObject({ status: 400 });
    expect(sent).toHaveLength(0);
  });

  it("rejects an out-of-scope service before touching the socket", async () => {
    const { sent, transport } = setup();
    await expect(
      transport.callService("climate", "reload", "climate.attic", {}),
    ).rejects.toMatchObject({ status: 400 });
    expect(sent).toHaveLength(0);
  });

  it("reports connection status", async () => {
    const { transport } = setup();
    await expect(transport.status()).resolves.toEqual({ connected: true });

    const offline: RelayHomeAssistantTransport = createRelayHomeAssistantTransport(
      createRelayCore({ registry: createAgentRegistry() }),
      "acct",
    );
    await expect(offline.status()).resolves.toEqual({ connected: false });
  });
});
