import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { HomeAssistantError, type HomeAssistantTransport } from "@homeslate/server";
import { decodeAgentMessage, type AgentMessage } from "@homeslate/widgets/server";
import { createHomeslateAgent, type HomeslateAgent } from "./agent";

/** A controllable stand-in for the browser/Node WebSocket the agent dials out. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  sent: string[] = [];
  closed = false;

  constructor(readonly url: string) {
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
    async listClimateEntities() {
      return [];
    },
    async getClimateState() {
      return null;
    },
    async callClimateService() {},
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
      protocol: 1,
      accountId: "acct",
      agentId: "agent-1",
      token: "relay-token",
      agent: { version: "0.1.0", haBaseUrl: "http://homeassistant.local:8123" },
    });
  });

  it("answers climate.entities.list from the Home Assistant client", async () => {
    const { agent, ws } = setup(
      stubClient({
        async listClimateEntities() {
          return [{ entityId: "climate.attic", name: "Attic", state: "off" }];
        },
      }),
    );
    ws.open();
    ws.receive({ type: "welcome", protocol: 1, heartbeatMs: 20_000 });
    ws.receive({ type: "request", id: "r1", method: "climate.entities.list", params: {} });
    await flush();
    expect(ws.lastSent()).toEqual({
      type: "response",
      id: "r1",
      ok: true,
      result: [{ entityId: "climate.attic", name: "Attic", state: "off" }],
    });
    await agent.stop();
  });

  it("returns a null result for an unknown entity", async () => {
    const { agent, ws } = setup(stubClient());
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "climate.state.get",
      params: { entityId: "climate.attic" },
    });
    await flush();
    expect(ws.lastSent()).toEqual({ type: "response", id: "r1", ok: true, result: null });
    await agent.stop();
  });

  it("rejects an out-of-scope service without calling Home Assistant", async () => {
    const calls: string[] = [];
    const { agent, ws } = setup(
      stubClient({
        async callClimateService() {
          calls.push("call");
        },
      }),
    );
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "climate.service.call",
      params: { entityId: "climate.attic", service: "reload" },
    });
    await flush();
    expect(ws.lastSent()).toMatchObject({ type: "response", id: "r1", ok: false, status: 400 });
    expect(calls).toEqual([]);
    await agent.stop();
  });

  it("maps a Home Assistant failure to its status", async () => {
    const { agent, ws } = setup(
      stubClient({
        async getClimateState() {
          throw new HomeAssistantError(502, "boom");
        },
      }),
    );
    ws.open();
    ws.receive({
      type: "request",
      id: "r1",
      method: "climate.state.get",
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
      ws.receive({ type: "welcome", protocol: 1, heartbeatMs: 20_000 });
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
