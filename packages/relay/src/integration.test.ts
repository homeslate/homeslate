import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createHomeslateServer } from "@homeslate/server";
import {
  HA_AGENT_OFFLINE_COPY,
  decodeAgentMessage,
  type AgentHelloMessage,
  type AgentMessage,
} from "@homeslate/widgets/server";
import { createHomeAssistantRelay } from "./relay";
import type { RelaySession, RelaySocket } from "./session";

const HEARTBEAT = 1_000_000;

const hello: AgentHelloMessage = {
  type: "hello",
  protocol: 1,
  accountId: "acct",
  agentId: "a1",
  token: "tok",
  agent: { version: "0.1.0", haBaseUrl: "http://ha" },
};

function fakeSocket() {
  const sent: string[] = [];
  const socket: RelaySocket = { send: (data) => sent.push(data), close: () => {} };
  return { socket, sent };
}

function lastRequest(sent: string[]): Extract<AgentMessage, { type: "request" }> {
  return decodeAgentMessage(sent.at(-1) ?? "") as Extract<AgentMessage, { type: "request" }>;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("relay end to end", () => {
  let dataDir = "";

  afterEach(async () => {
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function relayApp() {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-relay-"));
    const relay = createHomeAssistantRelay({
      authenticate: (h) => ({ accountId: h.accountId, agentId: h.agentId }),
      heartbeatMs: HEARTBEAT,
    });
    const app = createHomeslateServer({
      dataDir,
      homeAssistant: { transport: relay.transport("acct") },
    });
    return { relay, app };
  }

  it("returns 503 with the offline copy when no agent is connected", async () => {
    const { app } = await relayApp();
    const response = await app.request("/api/homeassistant/entities?domain=climate");
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: HA_AGENT_OFFLINE_COPY });

    const status = await (await app.request("/api/homeassistant/status")).json();
    expect(status).toEqual({
      configured: true,
      transport: "relay",
      connected: false,
      haReachable: true,
    });
  });

  it("serves the routes through a connected agent", async () => {
    const { relay, app } = await relayApp();
    const { socket, sent } = fakeSocket();
    const session: RelaySession = relay.accept(socket);
    await session.handleMessage(hello);

    const status = await (await app.request("/api/homeassistant/status")).json();
    expect(status).toMatchObject({ connected: true });

    const listing = app.request("/api/homeassistant/entities?domain=climate");
    await flush();
    await session.handleMessage({
      type: "response",
      id: lastRequest(sent).id,
      ok: true,
      result: [{ entityId: "climate.attic", name: "Attic", state: "off" }],
    });
    expect(await (await listing).json()).toEqual({
      entities: [{ entityId: "climate.attic", name: "Attic", state: "off" }],
    });

    const service = app.request("/api/homeassistant/services/climate/set_temperature", {
      method: "POST",
      body: JSON.stringify({ entity_id: "climate.attic", temperature: 21 }),
    });
    await flush();
    const request = lastRequest(sent);
    expect(request.method).toBe("climate.service.call");
    expect(request.params).toEqual({
      entityId: "climate.attic",
      service: "set_temperature",
      data: { entity_id: "climate.attic", temperature: 21 },
    });
    await session.handleMessage({
      type: "response",
      id: request.id,
      ok: true,
      result: { ok: true },
    });
    expect(await (await service).json()).toEqual({ ok: true });

    session.close();
  });
});
