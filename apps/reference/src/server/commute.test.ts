import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createReferenceApp } from "./app";

const originalFetch = globalThis.fetch;

const jsonOk = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("GET /api/commute", () => {
  let dataDir = "";

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function app() {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createReferenceApp({ dataDir });
  }

  async function appWithOrs() {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createReferenceApp({ dataDir, openRouteServiceApiKey: "test-key" });
  }

  it("returns 501 when OPENROUTESERVICE_API_KEY is unset", async () => {
    const hono = await app();
    const response = await hono.request("/api/commute?origin=A&destination=B&units=imperial");
    expect(response.status).toBe(501);
  });

  it("returns 400 when origin or destination is missing", async () => {
    const hono = await appWithOrs();
    expect((await hono.request("/api/commute?destination=B")).status).toBe(400);
  });

  it("geocodes addresses then calls driving-car and caches 60s", async () => {
    const calls: Array<{ url: string; authorization: string | null }> = [];
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      calls.push({
        url,
        authorization: new Headers(init?.headers).get("Authorization"),
      });
      if (url.includes("/geocode/search")) {
        return jsonOk({
          features: [{ geometry: { coordinates: [-122.3, 47.6] } }],
        });
      }
      return jsonOk({
        features: [{ properties: { summary: { duration: 1080, distance: 9978 } } }],
      });
    };

    const hono = await appWithOrs();
    const first = await hono.request("/api/commute?origin=Home&destination=School&units=imperial");
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ durationSeconds: 1080, distanceMeters: 9978 });
    await hono.request("/api/commute?origin=Home&destination=School&units=imperial");

    expect(calls.filter(({ url }) => url.includes("/v2/directions/driving-car"))).toHaveLength(1);
    expect(calls.every(({ authorization }) => authorization === "test-key")).toBe(true);
    expect(calls.at(-1)?.url).toContain("start=-122.3%2C47.6&end=-122.3%2C47.6");
  });
});
