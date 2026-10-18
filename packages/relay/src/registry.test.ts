import { describe, expect, it } from "vite-plus/test";
import type { AgentMessage } from "@homeslate/widgets/server";
import { createAgentRegistry, type AgentHandle } from "./registry";

function fakeHandle(accountId = "acct", agentId = "agent-1") {
  const sent: AgentMessage[] = [];
  let open = true;
  const handle: AgentHandle = {
    accountId,
    agentId,
    send: (message) => sent.push(message),
    isOpen: () => open,
    close: () => {
      open = false;
    },
  };
  return { handle, sent, isClosed: () => !open };
}

describe("agent registry", () => {
  it("binds and returns the current handle", () => {
    const registry = createAgentRegistry();
    const { handle } = fakeHandle();
    registry.bind(handle);
    expect(registry.get("acct")).toBe(handle);
    expect(registry.accounts()).toEqual(["acct"]);
  });

  it("replaces an account's handle and closes the previous one", () => {
    const registry = createAgentRegistry();
    const first = fakeHandle("acct", "agent-1");
    const second = fakeHandle("acct", "agent-2");

    registry.bind(first.handle);
    const replaced = registry.bind(second.handle);

    expect(replaced).toBe(first.handle);
    expect(first.isClosed()).toBe(true);
    expect(registry.get("acct")).toBe(second.handle);
  });

  it("removes only the current handle", () => {
    const registry = createAgentRegistry();
    const first = fakeHandle("acct", "agent-1");
    const second = fakeHandle("acct", "agent-2");

    registry.bind(first.handle);
    registry.bind(second.handle);

    registry.remove("acct", first.handle);
    expect(registry.get("acct")).toBe(second.handle);

    registry.remove("acct", second.handle);
    expect(registry.get("acct")).toBeNull();
  });

  it("clears every account", () => {
    const registry = createAgentRegistry();
    registry.bind(fakeHandle("a").handle);
    registry.bind(fakeHandle("b").handle);
    registry.clear();
    expect(registry.accounts()).toEqual([]);
  });
});
