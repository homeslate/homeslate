import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { decodeAgentMessage } from "@homeslate/widgets/server";
import { WebSocket } from "ws";
import { attachNodeWebSocket, type NodeWebSocketBinding } from "./node";
import { createHomeAssistantRelay } from "./relay";

function listen(server: Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(typeof address === "object" && address ? address.port : 0);
    });
  });
}

const hello = (agentId: string) =>
  JSON.stringify({
    type: "hello",
    protocol: 1,
    accountId: "acct",
    agentId,
    token: "tok",
    agent: { version: "0.1.0", haBaseUrl: "http://ha" },
  });

describe("attachNodeWebSocket", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const cleanup of cleanups.splice(0)) await cleanup();
  });

  it("welcomes an authenticated agent over a real socket", async () => {
    const server = createServer();
    const relay = createHomeAssistantRelay({
      authenticate: (h) => ({ accountId: h.accountId, agentId: h.agentId }),
      heartbeatMs: 1_000_000,
    });
    const binding: NodeWebSocketBinding = attachNodeWebSocket(relay, server);
    const port = await listen(server);
    cleanups.push(async () => {
      await binding.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    const client = new WebSocket(`ws://127.0.0.1:${port}/agent`);
    cleanups.push(async () => {
      client.terminate();
    });
    await once(client, "open");

    const welcome = once(client, "message").then(([data]) => decodeAgentMessage(String(data)));
    client.send(hello("a1"));

    await expect(welcome).resolves.toMatchObject({ type: "welcome", protocol: 1 });
    expect(relay.isConnected("acct")).toBe(true);
  });

  it("closes a socket whose hello is unauthenticatable", async () => {
    const server = createServer();
    const relay = createHomeAssistantRelay({ authenticate: () => null, heartbeatMs: 1_000_000 });
    const binding = attachNodeWebSocket(relay, server);
    const port = await listen(server);
    cleanups.push(async () => {
      await binding.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    const client = new WebSocket(`ws://127.0.0.1:${port}/agent`);
    cleanups.push(async () => {
      client.terminate();
    });
    await once(client, "open");

    const closed = once(client, "close").then(([code]) => code);
    client.send(hello("a1"));

    await expect(closed).resolves.toBe(4001);
    expect(relay.isConnected("acct")).toBe(false);
  });
});
