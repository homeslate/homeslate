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
        agent: { version: "0.1.0", haBaseUrl: "http://homeassistant.local:8123" },
      },
      { type: "welcome", protocol: AGENT_PROTOCOL_VERSION, heartbeatMs: 20_000 },
      {
        type: "request",
        id: "req-1",
        method: "climate.state.get",
        params: { entityId: "climate.living_room" },
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
    expect(
      decodeAgentMessage({ type: "hello", protocol: AGENT_PROTOCOL_VERSION, accountId: "acct" }),
    ).toBeNull();
    expect(decodeAgentMessage({ type: "request", id: "req-1", method: "climate.nuke" })).toBeNull();
    expect(decodeAgentMessage({ type: "request", id: "", method: "climate.state.get" })).toBeNull();
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
      agent: { version: "", haBaseUrl: "" },
    });
  });

  it("recognizes only the allowlisted methods", () => {
    expect(isAgentMethod("climate.entities.list")).toBe(true);
    expect(isAgentMethod("climate.state.get")).toBe(true);
    expect(isAgentMethod("climate.service.call")).toBe(true);
    expect(isAgentMethod("light.turn_on")).toBe(false);
    expect(isAgentMethod(7)).toBe(false);
  });

  describe("validateAgentRequestParams", () => {
    it("accepts the entity list with any object params", () => {
      expect(validateAgentRequestParams("climate.entities.list", {})).toEqual({ ok: true });
      expect(validateAgentRequestParams("climate.entities.list", { ignored: true })).toEqual({
        ok: true,
      });
    });

    it("validates state requests", () => {
      expect(
        validateAgentRequestParams("climate.state.get", { entityId: "climate.living_room" }),
      ).toEqual({ ok: true });
      for (const entityId of ["light.kitchen", "climate../x", "climate.", "climate.LivingRoom"]) {
        expect(validateAgentRequestParams("climate.state.get", { entityId })).toEqual({
          ok: false,
          error: "Invalid entity id",
        });
      }
    });

    it("validates service calls", () => {
      expect(
        validateAgentRequestParams("climate.service.call", {
          entityId: "climate.living_room",
          service: "set_temperature",
          data: { temperature: 21 },
        }),
      ).toEqual({ ok: true });
      expect(
        validateAgentRequestParams("climate.service.call", {
          entityId: "climate.living_room",
          service: "turn_off",
        }),
      ).toEqual({ ok: true });
      expect(
        validateAgentRequestParams("climate.service.call", {
          entityId: "climate.living_room",
          service: "reload",
        }),
      ).toEqual({ ok: false, error: "Unsupported service" });
      expect(
        validateAgentRequestParams("climate.service.call", {
          entityId: "light.kitchen",
          service: "turn_off",
        }),
      ).toEqual({ ok: false, error: "Invalid entity id" });
      expect(
        validateAgentRequestParams("climate.service.call", {
          entityId: "climate.living_room",
          service: "turn_off",
          data: "nope",
        }),
      ).toEqual({ ok: false, error: "Invalid service data" });
    });

    it("rejects non-object params", () => {
      expect(validateAgentRequestParams("climate.entities.list", "nope")).toEqual({
        ok: false,
        error: "Invalid params",
      });
      expect(validateAgentRequestParams("climate.state.get", null)).toEqual({
        ok: false,
        error: "Invalid params",
      });
    });
  });
});
