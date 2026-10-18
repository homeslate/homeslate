import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createEmptyDisplayDocument } from "@homeslate/adapters";
import { DISPLAY_OWNER_SIGN_IN_MESSAGE } from "@homeslate/widgets/server";
import { createHomeslateServer } from "./createHomeslateServer";

const execFileAsync = promisify(execFile);

describe("createHomeslateServer", () => {
  let dataDir = "";
  afterEach(async () => {
    if (dataDir) await rm(dataDir, { recursive: true, force: true });
  });

  async function app() {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createHomeslateServer({ dataDir });
  }

  async function googleApp() {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    return createHomeslateServer({
      dataDir,
      google: { clientId: "client-id", clientSecret: "client-secret" },
    });
  }

  it("redirects GET / to the Vite UI origin so the API port is not a blank 404", async () => {
    dataDir = await mkdtemp(join(tmpdir(), "homeslate-ref-"));
    const hono = createHomeslateServer({
      dataDir,
      publicBaseUrl: "http://127.0.0.1:5174",
    });
    const response = await hono.request("/");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:5174/");
  });

  it("creates a fixture display and returns it from GET /api/displays", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: createEmptyDisplayDocument("Kitchen") }),
    });
    expect(created.status).toBe(201);
    const record = (await created.json()) as {
      id: string;
      publicId: string;
      document: { name: string };
    };
    expect(record.document.name).toBe("Kitchen");

    const list = await hono.request("/api/displays");
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([{ id: record.id, name: "Kitchen" }]);

    const kiosk = await hono.request(`/api/public/${record.publicId}`);
    expect(kiosk.status).toBe(200);
    expect(((await kiosk.json()) as { document: { name: string } }).document.name).toBe("Kitchen");
  });

  it("PUT persists household members and a daily routine widget", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", { method: "POST" });
    const record = (await created.json()) as {
      id: string;
      document: ReturnType<typeof createEmptyDisplayDocument>;
    };
    const view = record.document.views[0];
    const put = await hono.request(`/api/displays/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...record.document,
        household: { members: [{ id: "maya", name: "Maya", color: "#6366f1" }] },
        views: [
          {
            ...view,
            widgets: [
              {
                id: "w-routine",
                type: "daily-routine",
                title: "Maya",
                config: {
                  steps: [{ id: "wake", label: "Wake up", icon: "sun" }],
                  resetHour: 4,
                  completionDay: null,
                  completedStepIds: [],
                  showReset: true,
                  transparentBackground: false,
                },
                layout: { x: 0, y: 0, w: 3, h: 5 },
              },
            ],
          },
        ],
      }),
    });
    expect(put.status).toBe(200);
    const again = await hono.request(`/api/displays/${record.id}`);
    const saved = (await again.json()) as {
      document: {
        household?: { members: Array<{ id: string }> };
        views: Array<{ widgets: Array<{ type: string }> }>;
      };
    };
    expect(saved.document.household?.members).toEqual([
      { id: "maya", name: "Maya", color: "#6366f1" },
    ]);
    expect(saved.document.views[0].widgets[0]?.type).toBe("daily-routine");
  });

  it("PUT invalid document returns 400 and leaves the store unchanged", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", { method: "POST" });
    const record = (await created.json()) as { id: string; document: { name: string } };
    const put = await hono.request(`/api/displays/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaVersion: 1, name: "x", views: "nope" }),
    });
    expect(put.status).toBe(400);
    const again = await hono.request(`/api/displays/${record.id}`);
    expect(((await again.json()) as { document: { name: string } }).document.name).toBe(
      record.document.name,
    );
  });

  it("sets a passcode, gates the public routes, and never leaks the hash", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", { method: "POST" });
    const record = (await created.json()) as {
      id: string;
      publicId: string;
      passcodeEnabled: boolean;
      document: ReturnType<typeof createEmptyDisplayDocument>;
    };
    expect(record.passcodeEnabled).toBe(false);
    expect((await hono.request(`/api/public/${record.publicId}`)).status).toBe(200);

    const patched = await hono.request(`/api/displays/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "1234" }),
    });
    expect(patched.status).toBe(200);
    expect(await patched.json()).toEqual({ id: record.id, passcodeEnabled: true });

    const owner = await hono.request(`/api/displays/${record.id}`);
    const ownerBody = (await owner.json()) as Record<string, unknown>;
    expect(ownerBody.passcodeEnabled).toBe(true);
    expect(JSON.stringify(ownerBody)).not.toContain("scrypt");

    const blocked = await hono.request(`/api/public/${record.publicId}`);
    expect(blocked.status).toBe(401);
    expect(await blocked.json()).toEqual({ passcodeRequired: true });

    expect((await hono.request(`/api/public/${record.publicId}?passcode=0000`)).status).toBe(401);

    const allowed = await hono.request(`/api/public/${record.publicId}?passcode=1234`);
    expect(allowed.status).toBe(200);
    expect(((await allowed.json()) as { document: { name: string } }).document.name).toBe(
      record.document.name,
    );

    const putBlocked = await hono.request(`/api/public/${record.publicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record.document),
    });
    expect(putBlocked.status).toBe(401);

    const cleared = await hono.request(`/api/displays/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: null }),
    });
    expect(await cleared.json()).toEqual({ id: record.id, passcodeEnabled: false });
    expect((await hono.request(`/api/public/${record.publicId}`)).status).toBe(200);
  });

  it("rejects malformed passcodes and a missing passcode field", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", { method: "POST" });
    const record = (await created.json()) as { id: string };

    for (const passcode of ["123", "12345", "abcd", 1234, ""]) {
      const response = await hono.request(`/api/displays/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      expect(response.status).toBe(400);
    }

    const missing = await hono.request(`/api/displays/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(missing.status).toBe(400);
  });

  it("PATCH returns 404 for an unknown display", async () => {
    const hono = await app();
    const response = await hono.request("/api/displays/missing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "1234" }),
    });
    expect(response.status).toBe(404);
  });

  it("PUT with malformed JSON returns 400 on both document routes", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", { method: "POST" });
    const record = (await created.json()) as { id: string; publicId: string };

    const owner = await hono.request(`/api/displays/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: '{"schemaVersion":',
    });
    expect(owner.status).toBe(400);
    expect(await owner.json()).toEqual({ error: "Invalid JSON" });

    const kiosk = await hono.request(`/api/public/${record.publicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "not json at all",
    });
    expect(kiosk.status).toBe(400);
    expect(await kiosk.json()).toEqual({ error: "Invalid JSON" });
  });

  it("OAuth connect issues a state in both the redirect and an httpOnly cookie", async () => {
    const hono = await googleApp();
    const connect = await hono.request("/api/google/connect");
    expect(connect.status).toBe(302);

    const location = new URL(connect.headers.get("location") ?? "");
    const state = location.searchParams.get("state");
    expect(state).toEqual(expect.any(String));
    expect(state).not.toBe("");

    const cookie = connect.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`homeslate_oauth_state=${state}`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("OAuth callback rejects a missing or mismatched state before exchanging a code", async () => {
    const hono = await googleApp();

    const noState = await hono.request("/api/google/callback?code=abc");
    expect(noState.status).toBe(400);
    expect(await noState.json()).toMatchObject({ reason: "state_mismatch" });

    const connect = await hono.request("/api/google/connect");
    const cookie = (connect.headers.get("set-cookie") ?? "").split(";")[0];
    const mismatched = await hono.request("/api/google/callback?code=abc&state=forged", {
      headers: { cookie },
    });
    expect(mismatched.status).toBe(400);
    expect(await mismatched.json()).toMatchObject({ reason: "state_mismatch" });
  });

  it("OAuth callback reports a Google error param instead of blaming a missing code", async () => {
    const hono = await googleApp();
    const connect = await hono.request("/api/google/connect");
    const cookie = (connect.headers.get("set-cookie") ?? "").split(";")[0];

    const denied = await hono.request("/api/google/callback?error=access_denied", {
      headers: { cookie },
    });
    expect(denied.status).toBe(400);
    const body = (await denied.json()) as { error: string; reason: string };
    expect(body.reason).toBe("access_denied");
    expect(body.error).toContain("access_denied");
    expect(body.error).not.toMatch(/missing code/i);
  });

  it("OAuth callback with a matching state still requires a code", async () => {
    const hono = await googleApp();
    const connect = await hono.request("/api/google/connect");
    const setCookie = connect.headers.get("set-cookie") ?? "";
    const cookie = setCookie.split(";")[0];
    const state = new URL(connect.headers.get("location") ?? "").searchParams.get("state");

    const missingCode = await hono.request(`/api/google/callback?state=${state}`, {
      headers: { cookie },
    });
    expect(missingCode.status).toBe(400);
    expect(await missingCode.json()).toMatchObject({ reason: "missing_code" });
  });

  it("display-calendar without Google still returns the empty widget payload", async () => {
    const hono = await app();
    const created = await hono.request("/api/displays", { method: "POST" });
    const record = (await created.json()) as { publicId: string };
    const cal = await hono.request(
      `/api/display-calendar?displayId=${record.publicId}&calendarIds=primary&daysAhead=7`,
    );
    expect(cal.status).toBe(200);
    const body = (await cal.json()) as { events: unknown[]; calendars: unknown[]; error: string };
    expect(body.events).toEqual([]);
    expect(body.calendars).toEqual([]);
    expect(body.error).toBe(DISPLAY_OWNER_SIGN_IN_MESSAGE);
  });

  it("loads in the Node tsx runtime used by the reference server", async () => {
    await expect(
      execFileAsync(
        process.execPath,
        [
          "--import",
          createRequire(import.meta.url).resolve("tsx"),
          "--input-type=module",
          "--eval",
          "await import('./packages/server/src/createHomeslateServer.ts')",
        ],
        { cwd: process.cwd() },
      ),
    ).resolves.toBeDefined();
  });
});
