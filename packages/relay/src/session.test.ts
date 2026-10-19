import { describe, expect, it } from "vite-plus/test";
import {
  AGENT_PROTOCOL_VERSION,
  HA_AGENT_OFFLINE_COPY,
  decodeAgentMessage,
  type AgentMessage,
} from "@homeslate/widgets/server";
import { createRelayCore, type RelayCore } from "./core";
import { createAgentRegistry, type AgentRegistry } from "./registry";
import {
  authorizeHello,
  createRelaySession,
  type HelloAuthenticator,
  type RelaySession,
  type RelaySocket,
} from "./session";

const HEARTBEAT = 1_000_000;

const hello = (overrides: Record<string, unknown> = {}) => ({
  type: "hello",
  protocol: AGENT_PROTOCOL_VERSION,
  accountId: "acct",
  agentId: "a1",
  token: "tok",
  agent: { version: "0.1.0", haBaseUrl: "http://ha", domains: ["climate", "todo"] },
  ...overrides,
});

function fakeSocket() {
  const sent: string[] = [];
  let closed = false;
  let closeCode: number | undefined;
  const socket: RelaySocket = {
    send: (data) => sent.push(data),
    close: (code) => {
      closed = true;
      closeCode = code;
    },
  };
  return { socket, sent, isClosed: () => closed, closeCode: () => closeCode };
}

function lastMessage(sent: string[]): AgentMessage | null {
  return decodeAgentMessage(sent.at(-1) ?? "");
}

function authSession(
  options: {
    authenticate?: HelloAuthenticator;
    registry?: AgentRegistry;
    core?: RelayCore;
  } = {},
) {
  const registry: AgentRegistry = options.registry ?? createAgentRegistry();
  const core: RelayCore = options.core ?? createRelayCore({ registry });
  const socket = fakeSocket();
  const session: RelaySession = createRelaySession({
    socket: socket.socket,
    authenticate: options.authenticate ?? (() => ({ accountId: "acct", agentId: "a1" })),
    registry,
    core,
    heartbeatMs: HEARTBEAT,
  });
  return { registry, core, session, socket };
}

describe("authorizeHello", () => {
  it("accepts a hello that the authenticator binds", async () => {
    const result = await authorizeHello(
      (h) => ({ accountId: "acct", agentId: h.agentId }),
      hello(),
    );
    expect(result).toMatchObject({ binding: { accountId: "acct", agentId: "a1" } });
  });

  it("rejects a non-hello, an unknown token, and an account mismatch", async () => {
    expect(
      await authorizeHello(() => ({ accountId: "acct", agentId: "a1" }), { type: "ping" }),
    ).toBeNull();
    expect(await authorizeHello(() => null, hello())).toBeNull();
    expect(await authorizeHello(() => ({ accountId: "other", agentId: "a1" }), hello())).toBeNull();
  });
});

describe("relay session", () => {
  it("authenticates on hello, binds the agent, and welcomes it", async () => {
    const { registry, session, socket } = authSession();
    await session.handleMessage(hello());

    expect(session.state()).toBe("authenticated");
    expect(registry.get("acct")?.agentId).toBe("a1");
    expect(lastMessage(socket.sent)).toMatchObject({
      type: "welcome",
      protocol: AGENT_PROTOCOL_VERSION,
    });

    session.close();
    expect(session.state()).toBe("closed");
    expect(registry.get("acct")).toBeNull();
    expect(socket.isClosed()).toBe(true);
  });

  it("closes with a policy code when the hello cannot be authenticated", async () => {
    const { session, socket } = authSession({ authenticate: () => null });
    await session.handleMessage(hello());

    expect(session.state()).toBe("closed");
    expect(socket.isClosed()).toBe(true);
    expect(socket.closeCode()).toBe(4001);
  });

  it("routes responses to the relay core", async () => {
    const { core, session, socket } = authSession();
    await session.handleMessage(hello());

    const promise = core.request("acct", "entity.get", { entityId: "climate.attic" });
    const request = decodeAgentMessage(socket.sent.at(-1) ?? "") as Extract<
      AgentMessage,
      { type: "request" }
    >;
    await session.handleMessage({
      type: "response",
      id: request.id,
      ok: true,
      result: { entityId: "climate.attic" },
    });
    await expect(promise).resolves.toEqual({ entityId: "climate.attic" });

    session.close();
  });

  it("replies pong to a ping", async () => {
    const { session, socket } = authSession();
    await session.handleMessage(hello());
    socket.sent.length = 0;

    await session.handleMessage({ type: "ping" });
    expect(lastMessage(socket.sent)).toEqual({ type: "pong" });

    session.close();
  });

  it("rejects pending work and unbinds the agent on close", async () => {
    const { core, registry, session } = authSession();
    await session.handleMessage(hello());

    const promise = core.request("acct", "entities.list", { domain: "climate" });
    session.close();

    await expect(promise).rejects.toThrow(HA_AGENT_OFFLINE_COPY);
    expect(registry.get("acct")).toBeNull();
  });

  it("replaces a previous session's handle without rejecting the new one", async () => {
    const registry = createAgentRegistry();
    const core = createRelayCore({ registry });
    const authenticate: HelloAuthenticator = (h) => ({ accountId: "acct", agentId: h.agentId });
    const first = authSession({ registry, core, authenticate });
    await first.session.handleMessage(hello({ agentId: "a1" }));

    const second = authSession({ registry, core, authenticate });
    await second.session.handleMessage(hello({ agentId: "a2" }));

    expect(first.session.state()).toBe("closed");
    expect(first.socket.isClosed()).toBe(true);
    expect(second.registry.get("acct")?.agentId).toBe("a2");

    second.session.close();
  });
});
