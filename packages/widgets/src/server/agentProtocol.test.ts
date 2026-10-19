import { describe, expect, it } from "vite-plus/test";
import {
  AGENT_PROTOCOL_VERSION,
  decodeAgentMessage,
  encodeAgentMessage,
  isAgentMethod,
  validateAgentRequestParams,
  type AgentMessage,
} from "./agentProtocol";

describe("agentProtocol", () => {
  it("round-trips every message variant", () => {
    const messages: AgentMessage[] = [
      {
        type: "hello",
        protocol: AGENT_PROTOCOL_VERSION,
        accountId: "acct",
        agentId: "agent-1",
        token: "relay-token",
        agent: {
          version: "0.1.0",
          haBaseUrl: "http://homeassistant.local:8123",
          domains: ["climate", "todo"],
        },
      },
      { type: "welcome", protocol: AGENT_PROTOCOL_VERSION, heartbeatMs: 20_000 },
      {
        type: "request",
        id: "req-1",
        method: "entity.get",
        params: { entityId: "climate.living_room" },
      },
      {
        type: "request",
        id: "req-2",
        method: "service.call",
        params: {
          domain: "todo",
          service: "get_items",
          entityId: "todo.shopping",
          data: {},
          returnResponse: true,
        },
      },
      { type: "response", id: "req-1", ok: true, result: { entityId: "climate.living_room" } },
      { type: "response", id: "req-2", ok: false, status: 502, error: "boom" },
      { type: "ping" },
      { type: "pong" },
    ];

    for (const message of messages) {
      expect(decodeAgentMessage(encodeAgentMessage(message))).toEqual(message);
    }
  });

  it("rejects unknown, malformed, and wrong-version messages", () => {
    expect(decodeAgentMessage("not json")).toBeNull();
    expect(decodeAgentMessage("42")).toBeNull();
    expect(decodeAgentMessage(null)).toBeNull();
    expect(decodeAgentMessage({})).toBeNull();
    expect(decodeAgentMessage({ type: "nope" })).toBeNull();
    expect(
      decodeAgentMessage({
        type: "hello",
        protocol: AGENT_PROTOCOL_VERSION + 1,
        accountId: "acct",
        agentId: "agent-1",
        token: "relay-token",
      }),
    ).toBeNull();
    // A v1 hello is a clean reject now that the protocol is v2.
    expect(
      decodeAgentMessage({
        type: "hello",
        protocol: 1,
        accountId: "acct",
        agentId: "agent-1",
        token: "relay-token",
        agent: { version: "0.1.0", haBaseUrl: "http://ha" },
      }),
    ).toBeNull();
    expect(
      decodeAgentMessage({ type: "hello", protocol: AGENT_PROTOCOL_VERSION, accountId: "acct" }),
    ).toBeNull();
    expect(decodeAgentMessage({ type: "request", id: "req-1", method: "climate.nuke" })).toBeNull();
    expect(decodeAgentMessage({ type: "request", id: "", method: "entity.get" })).toBeNull();
    expect(decodeAgentMessage({ type: "response", id: "req-1" })).toBeNull();
  });

  it("normalizes loose response and hello fields", () => {
    expect(decodeAgentMessage({ type: "response", id: "req-1", ok: false })).toEqual({
      type: "response",
      id: "req-1",
      ok: false,
      status: 502,
      error: "Agent request failed",
    });
    expect(
      decodeAgentMessage({
        type: "hello",
        protocol: AGENT_PROTOCOL_VERSION,
        accountId: "acct",
        agentId: "agent-1",
        token: "relay-token",
      }),
    ).toEqual({
      type: "hello",
      protocol: AGENT_PROTOCOL_VERSION,
      accountId: "acct",
      agentId: "agent-1",
      token: "relay-token",
      agent: { version: "", haBaseUrl: "", domains: [] },
    });
  });

  it("keeps only string domains in the capability list", () => {
    const hello = decodeAgentMessage({
      type: "hello",
      protocol: AGENT_PROTOCOL_VERSION,
      accountId: "acct",
      agentId: "agent-1",
      token: "relay-token",
      agent: { version: "1", haBaseUrl: "http://ha", domains: ["climate", 7, "todo"] },
    });
    expect(hello).toMatchObject({ agent: { domains: ["climate", "todo"] } });
  });

  it("recognizes only the allowlisted methods", () => {
    expect(isAgentMethod("entities.list")).toBe(true);
    expect(isAgentMethod("entity.get")).toBe(true);
    expect(isAgentMethod("service.call")).toBe(true);
    expect(isAgentMethod("climate.state.get")).toBe(false);
    expect(isAgentMethod("light.turn_on")).toBe(false);
    expect(isAgentMethod(7)).toBe(false);
  });

  describe("validateAgentRequestParams", () => {
    it("requires a known domain to list entities", () => {
      expect(validateAgentRequestParams("entities.list", { domain: "climate" })).toEqual({
        ok: true,
      });
      expect(validateAgentRequestParams("entities.list", { domain: "todo" })).toEqual({ ok: true });
      expect(validateAgentRequestParams("entities.list", { domain: "weird" })).toEqual({
        ok: false,
        error: "Unsupported domain",
      });
      expect(validateAgentRequestParams("entities.list", {})).toEqual({
        ok: false,
        error: "Unsupported domain",
      });
    });

    it("validates entity requests", () => {
      expect(validateAgentRequestParams("entity.get", { entityId: "climate.living_room" })).toEqual(
        { ok: true },
      );
      for (const entityId of ["weird.thing", "climate../x", "climate.", "climate.LivingRoom"]) {
        expect(validateAgentRequestParams("entity.get", { entityId })).toEqual({
          ok: false,
          error: "Invalid entity id",
        });
      }
    });

    it("validates service calls against the domain registry", () => {
      expect(
        validateAgentRequestParams("service.call", {
          domain: "climate",
          entityId: "climate.living_room",
          service: "set_temperature",
          data: { temperature: 21 },
        }),
      ).toEqual({ ok: true });
      expect(
        validateAgentRequestParams("service.call", {
          domain: "todo",
          entityId: "todo.shopping",
          service: "get_items",
          data: {},
          returnResponse: true,
        }),
      ).toEqual({ ok: true });
      expect(
        validateAgentRequestParams("service.call", {
          domain: "climate",
          entityId: "climate.living_room",
          service: "reload",
        }),
      ).toEqual({ ok: false, error: "Unsupported service" });
      expect(
        validateAgentRequestParams("service.call", {
          domain: "climate",
          entityId: "light.kitchen",
          service: "turn_off",
        }),
      ).toEqual({ ok: false, error: "Invalid entity id" });
      expect(
        validateAgentRequestParams("service.call", {
          domain: "weird",
          entityId: "weird.thing",
          service: "turn_on",
        }),
      ).toEqual({ ok: false, error: "Unsupported domain" });
      expect(
        validateAgentRequestParams("service.call", {
          domain: "climate",
          entityId: "climate.living_room",
          service: "turn_off",
          data: "nope",
        }),
      ).toEqual({ ok: false, error: "Invalid service data" });
      expect(
        validateAgentRequestParams("service.call", {
          domain: "todo",
          entityId: "todo.shopping",
          service: "get_items",
          returnResponse: "yes",
        }),
      ).toEqual({ ok: false, error: "Invalid service data" });
    });

    it("rejects non-object params", () => {
      expect(validateAgentRequestParams("entities.list", "nope")).toEqual({
        ok: false,
        error: "Invalid params",
      });
      expect(validateAgentRequestParams("entity.get", null)).toEqual({
        ok: false,
        error: "Invalid params",
      });
    });
  });
});
