#!/usr/bin/env node
import process from "node:process";
import { createHomeslateAgent } from "./agent";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`[homeslate-agent] ${name} is required`);
    process.exit(1);
  }
  return value;
}

const agent = createHomeslateAgent({
  relayUrl: required("HOMESLATE_RELAY_URL"),
  token: required("HOMESLATE_AGENT_TOKEN"),
  accountId: required("HOMESLATE_ACCOUNT_ID"),
  baseUrl: required("HOMEASSISTANT_BASE_URL"),
  haToken: required("HOMEASSISTANT_TOKEN"),
  agentId: process.env.HOMESLATE_AGENT_ID?.trim() || undefined,
});

agent.onStateChange((state) => console.log(`[homeslate-agent] ${state}`));
console.log("[homeslate-agent] connecting to Home Assistant + relay…");
agent.start();

let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[homeslate-agent] ${signal} received, shutting down`);
  void agent.stop().then(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
