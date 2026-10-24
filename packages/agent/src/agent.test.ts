import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { HomeAssistantError, type HomeAssistantTransport } from "@homeslate/server";
import {
  AGENT_PROTOCOL_VERSION,
  decodeAgentMessage,
  knownDomains,
  type AgentMessage,
} from "@homeslate/widgets/server";
import { createHomeslateAgent, type HomeslateAgent } from "./agent";

/** A controllable stand-in for the browser/Node WebSocket the agent dials out. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  sent: string[] = [];
  closed = false;

  readonly url: string;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.closed = true;
    this.onclose?.();
  }

  open(): void {
    this.onopen?.();
  }

  receive(message: AgentMessage): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  lastSent(): AgentMessage | null {
    const last = this.sent.at(-1);
    return last ? decodeAgentMessage(last) : null;
  }
}

function stubClient(overrides: Partial<HomeAssistantTransport> = {}): HomeAssistantTransport {
  return {
    async listEntities() {
      return [];
    },
    async getEntity() {
      return null;
    },
    async callService() {},
    ...overrides,
  };
}

function setup(haClient: HomeAssistantTransport): { agent: HomeslateAgent; ws: FakeWebSocket } {
  FakeWebSocket.instances = [];
  const agent = createHomeslateAgent({
    relayUrl: "wss://relay.test/agent",
    token: "relay-token",
    accountId: "acct",
    baseUrl: "http://homeassistant.local:8123",
    haToken: "ha-token",
    agentId: "agent-1",
    agentVersion: "0.1.0",
    haClient,
    webSocketImpl: (url) => new FakeWebSocket(url) as unknown as WebSocket,
  });
  agent.start();
  const ws = FakeWebSocket.instances[0];
  if (!ws) throw new Error("agent did not open a socket");
  return { agent, ws };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  FakeWebSocket.instances = [];
});

describe("homeslate agent", () => {
  it("sends a hello frame on open", () => {
    const { ws } = setup(stubClient());
    ws.open();
    expect(decodeAgentMessage(ws.sent[0] ?? "")).toEqual({
      type: "hello",
      protocol: AGENT_PROTOCOL_VERSION,
      accountId: "acct",
      agentId: "agent-1",
      token: "relay-token",
      agent: {
        version: "0.1.0",
        haBaseUrl: "http://homeassistant.local:8123",
        domains: knownDomains(),
      },
    });
  });

  it("answers entities.list from the Home Assistant client", async () => {
    const { agent, ws } = setup(
      stubClient({
        async listEntities(domain) {
          expect(domain).toBe("climate");
          return [{ entityId: "climate.attic", name: "Attic", state: "off" }];
        },
      }),
    );
    ws.open();
    ws.receive({ type: "welcome", protocol: AGENT_PROTOCOL_VERSION, heartbeatMs: 20_000 });
    ws.receive({
      type: "request",
      id: "r1",
      method: "entities.list",
      params: { domain: "climate" },
    });
    await flush();
    expect(ws.lastSent()).toEqual({
      type: "response",
      id: "r1",
      ok: true,
      result: [{ entityId: "climate.attic", name: "Attic", state: "off" }],
    });
    await agent.stop();
  });

  it("rejects an unknown domain without calling Home Assistant", async () => {
    const calls: string[] = [];
    const { agent, ws } = setup(
      stubClient({
        async listEntities() {
          calls.push("list");
          return [];
        },
      }),
    );
    ws.open();
    ws.receive({ type: "request", id: "r1", method: "entities.list", params: { domain: "weird" } });
    await flush();
    expect(ws.lastSent()).toMatchObject({ type: "response", id: "r1", ok: false, status: 400 });
    expect(calls).toEqual([]);
    await agent.stop();
  });

  it("returns a null result for an unknown entity", async () => {
    const { agent, ws } = setup(stubClient());
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "entity.get",
      params: { entityId: "climate.attic" },
    });
    await flush();
    expect(ws.lastSent()).toEqual({ type: "response", id: "r1", ok: true, result: null });
    await agent.stop();
  });

  it("answers a service call with an ok result", async () => {
    const calls: Array<{ method: string; returnResponse?: boolean }> = [];
    const { agent, ws } = setup(
      stubClient({
        async callService(domain, service, entityId, _data, options) {
          calls.push({
            method: `${domain}/${service}/${entityId}`,
            returnResponse: options?.returnResponse,
          });
          return undefined;
        },
      }),
    );
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "service.call",
      params: {
        domain: "climate",
        service: "set_temperature",
        entityId: "climate.attic",
        data: { temperature: 21 },
      },
    });
    await flush();
    expect(calls).toEqual([
      { method: "climate/set_temperature/climate.attic", returnResponse: false },
    ]);
    expect(ws.lastSent()).toEqual({ type: "response", id: "r1", ok: true, result: { ok: true } });
    await agent.stop();
  });

  it("forwards returnResponse and returns the service result", async () => {
    const calls: Array<boolean | undefined> = [];
    const { agent, ws } = setup(
      stubClient({
        async callService(_domain, _service, _entityId, _data, options) {
          calls.push(options?.returnResponse);
          return { "todo.shopping": { items: [] } };
        },
      }),
    );
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "service.call",
      params: {
        domain: "todo",
        service: "get_items",
        entityId: "todo.shopping",
        data: {},
        returnResponse: true,
      },
    });
    await flush();
    expect(calls).toEqual([true]);
    expect(ws.lastSent()).toEqual({
      type: "response",
      id: "r1",
      ok: true,
      result: { "todo.shopping": { items: [] } },
    });
    await agent.stop();
  });

  it("rejects an out-of-scope service without calling Home Assistant", async () => {
    const calls: string[] = [];
    const { agent, ws } = setup(
      stubClient({
        async callService() {
          calls.push("call");
        },
      }),
    );
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "service.call",
      params: { domain: "climate", entityId: "climate.attic", service: "reload" },
    });
    await flush();
    expect(ws.lastSent()).toMatchObject({ type: "response", id: "r1", ok: false, status: 400 });
    expect(calls).toEqual([]);
    await agent.stop();
  });

  it("maps a Home Assistant failure to its status", async () => {
    const { agent, ws } = setup(
      stubClient({
        async getEntity() {
          throw new HomeAssistantError(502, "boom");
        },
      }),
    );
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "entity.get",
      params: { entityId: "climate.attic" },
    });
    await flush();
    expect(ws.lastSent()).toEqual({
      type: "response",
      id: "r1",
      ok: false,
      status: 502,
      error: "boom",
    });
    await agent.stop();
  });

  it("replies pong to a ping", async () => {
    const { agent, ws } = setup(stubClient());
    ws.open();
    ws.sent = [];
    ws.receive({ type: "ping" });
    expect(decodeAgentMessage(ws.sent[0] ?? "")).toEqual({ type: "pong" });
    await agent.stop();
  });

  it("reports connection state and reconnects after a close", async () => {
    vi.useFakeTimers();
    try {
      const { agent, ws } = setup(stubClient());
      const states: string[] = [];
      agent.onStateChange((state) => states.push(state));

      ws.open();
      ws.receive({ type: "welcome", protocol: AGENT_PROTOCOL_VERSION, heartbeatMs: 20_000 });
      expect(states).toContain("connected");

      ws.close();
      expect(states).toContain("disconnected");

      vi.advanceTimersByTime(2_000);
      expect(FakeWebSocket.instances.length).toBeGreaterThan(1);

      await agent.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops cleanly and cancels a pending reconnect", async () => {
    vi.useFakeTimers();
    try {
      const { agent, ws } = setup(stubClient());
      ws.close();
      await agent.stop();
      vi.advanceTimersByTime(5_000);
      expect(FakeWebSocket.instances).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("backs off instead of throwing when the socket cannot be opened", async () => {
    vi.useFakeTimers();
    try {
      const agent = createHomeslateAgent({
        relayUrl: "not-a-url",
        token: "relay-token",
        accountId: "acct",
        baseUrl: "http://homeassistant.local:8123",
        haToken: "ha-token",
        haClient: stubClient(),
        webSocketImpl: () => {
          throw new Error("invalid url");
        },
      });
      agent.start();
      const states: string[] = [];
      agent.onStateChange((state) => states.push(state));
      vi.advanceTimersByTime(2_000);
      expect(states).toContain("disconnected");
      await agent.stop();
    } finally {
      vi.useRealTimers();
    }
  });
});
