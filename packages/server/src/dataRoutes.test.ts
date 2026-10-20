import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createHomeslateServer } from "./createHomeslateServer";

describe("data routes", () => {
  let dataDir = "";
  const originalFetch = globalThis.fetch;

  afterEach(async () => {
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
    const seen: string[] = [];
    globalThis.fetch = async (input) => {
      seen.push(String(input));
      return new Response(JSON.stringify({ c: 10, d: 1, dp: 1, h: 11, l: 9, o: 9, pc: 9, t: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const hono = await app("secret-token");
    const response = await hono.request("/api/stocks/quote?symbol=aapl");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("max-age=60");
    const body = await response.text();
    expect(body).toContain('"c":10');
    expect(body).not.toContain("secret-token");
    expect(seen[0]).toContain("token=secret-token");
    expect(seen[0]).toContain("symbol=AAPL");
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
