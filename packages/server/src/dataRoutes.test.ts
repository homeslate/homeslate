import { EventEmitter } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import type { ClientRequest, IncomingMessage } from "node:http";
import https from "node:https";
import { promises as dns } from "node:dns";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createHomeslateServer } from "./createHomeslateServer";

function stubDns(address: string) {
  vi.spyOn(dns, "lookup").mockResolvedValue([{ address, family: 4 }] as never);
}

function stubHttps(body: string) {
  const seen: https.RequestOptions[] = [];
  vi.spyOn(https, "request").mockImplementation(((
    options: https.RequestOptions,
    callback: (response: IncomingMessage) => void,
  ) => {
    seen.push(options);
    const response = new EventEmitter() as IncomingMessage;
    response.statusCode = 200;
    response.headers = { "content-type": "application/json" };
    queueMicrotask(() => {
      callback(response);
      response.emit("data", Buffer.from(body));
      response.emit("end");
    });
    const request = new EventEmitter() as ClientRequest;
    request.end = (() => request) as ClientRequest["end"];
    request.destroy = (() => request) as ClientRequest["destroy"];
    return request;
  }) as never);
  return seen;
}

describe("data routes", () => {
  let dataDir = "";
  const originalFetch = globalThis.fetch;

  afterEach(async () => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
    dataDir = "";
  });

  async function app(finnhubApiKey?: string) {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-data-"));
    return createHomeslateServer({ dataDir, finnhubApiKey });
  }

  it("rejects a private feed URL before fetching it", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response("no");
    };
    const hono = await app();
    const response = await hono.request("/api/news?url=http://127.0.0.1/secret");
    expect(response.status).toBe(400);
    expect(called).toBe(false);
  });

  it("quotes a symbol on the server and keeps the Finnhub token out of the response", async () => {
    stubDns("1.1.1.1");
    const seen = stubHttps(JSON.stringify({ c: 10, d: 1, dp: 1, h: 11, l: 9, o: 9, pc: 9, t: 1 }));
    const hono = await app("secret-token");
    const response = await hono.request("/api/stocks/quote?symbol=aapl");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("max-age=60");
    const body = await response.text();
    expect(body).toContain('"c":10');
    expect(body).not.toContain("secret-token");
    const outbound = seen[0];
    expect(outbound?.hostname).toBe("finnhub.io");
    expect(outbound?.lookup).toEqual(expect.any(Function));
    expect(String(outbound?.path)).toContain("token=secret-token");
    expect(String(outbound?.path)).toContain("symbol=AAPL");
  });

  it("does not fetch a feed name that resolves to a private address", async () => {
    stubDns("10.0.0.5");
    const request = vi.spyOn(https, "request");
    const hono = await app();
    const response = await hono.request("/api/news?url=https://feeds.example.test/rss");
    expect(response.status).toBe(400);
    expect(request).not.toHaveBeenCalled();
  });

  it("marks a fetched feed private so shared caches do not store it", async () => {
    stubDns("1.1.1.1");
    stubHttps("<rss></rss>");
    const hono = await app();
    const response = await hono.request("/api/news?url=https://feeds.example.test/rss");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toMatch(/^private,/);
  });

  it("returns 501 when FINNHUB_API_KEY is unset", async () => {
    const hono = await app();
    const response = await hono.request("/api/stocks/quote?symbol=AAPL");
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({ error: "Set FINNHUB_API_KEY on the server." });
  });

  it("rejects an unknown sports league", async () => {
    const hono = await app();
    const response = await hono.request("/api/sports/scoreboard?league=not-a-league");
    expect(response.status).toBe(400);
  });
});
