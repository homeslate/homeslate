import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import fixture from "../../../../packages/widgets/src/widgets/weatherAlerts.fixture.json" with { type: "json" };
import { createReferenceApp } from "./app";

const originalFetch = globalThis.fetch;

const jsonOk = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("GET /api/weather/alerts", () => {
  let dataDir = "";

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function app() {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createReferenceApp({ dataDir });
  }

  it("returns 400 when lat or lon is missing or out of range", async () => {
    const hono = await app();
    expect((await hono.request("/api/weather/alerts")).status).toBe(400);
    expect((await hono.request("/api/weather/alerts?lat=91&lon=0")).status).toBe(400);
  });

  it("returns coverage unavailable on empty features or NWS 400 — not 502", async () => {
    globalThis.fetch = async () => new Response("{}", { status: 400 });
    const hono = await app();
    const response = await hono.request("/api/weather/alerts?lat=47.606&lon=-122.332");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ alerts: [], coverage: "unavailable" });
  });

  it("maps NWS features and caches 2 minutes per rounded lat/lon", async () => {
    let hits = 0;
    globalThis.fetch = async () => {
      hits += 1;
      return jsonOk(fixture);
    };
    const hono = await app();
    const first = await hono.request("/api/weather/alerts?lat=47.6062&lon=-122.3321");
    expect(first.status).toBe(200);
    const body = (await first.json()) as { coverage: string; alerts: { event: string }[] };
    expect(body.coverage).toBe("us");
    expect(body.alerts[0]?.event).toBe("Excessive Heat Warning"); // extreme first
    await hono.request("/api/weather/alerts?lat=47.6064&lon=-122.3324"); // same 3-decimal key
    expect(hits).toBe(1);
  });
});
