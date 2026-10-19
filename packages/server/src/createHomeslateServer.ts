import {
  DisplayNotFoundError,
  FileTokenStore,
  InvalidDisplayDocumentError,
  SqliteDisplayStore,
  SqliteGoogleBindingStore,
  assertValidDisplayDocument,
  createEmptyDisplayDocument,
  openSqlite,
  type DisplayRecord,
  type DisplayStore,
} from "@homeslate/adapters";
import {
  DISPLAY_CALENDAR_DAYS_BACK_DEFAULT,
  createGoogleClient,
  displayCalendarWindow,
  isGoogleAuthError,
  type GoogleClient,
} from "@homeslate/google";
import {
  COMMUTE_MISSING_KEY_COPY,
  DISPLAY_GOOGLE_RECONNECT_MESSAGE,
  DISPLAY_OWNER_SIGN_IN_MESSAGE,
  HA_MISSING_CONFIG_COPY,
  THERMOSTAT_MISSING_CONFIG_COPY,
  TODO_MISSING_CONFIG_COPY,
  entityDomain,
  isAllowedService,
  isKnownDomain,
  isValidEntityId,
  isValidTodoEntityId,
  mapEntity,
  mapTodoItems,
  parseCommuteQuery,
  type CommuteEstimate,
  type WeatherAlertsResponse,
} from "@homeslate/widgets/server";
import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { estimateCommute } from "./commute";
import {
  HomeAssistantError,
  HomeAssistantTransportError,
  createHomeAssistantClient,
  hasStatus,
  type HomeAssistantStatus,
  type HomeAssistantTransport,
} from "./homeAssistant";
import { fetchWeatherAlerts, parseWeatherAlertPoint } from "./weatherAlerts";
import {
  DEFAULT_PUBLIC_BASE_URL,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_STATE_MAX_AGE_S,
  createOAuthState,
  googleAuthorizationUrl,
  googleRedirectUri,
  isMatchingOAuthState,
} from "./oauth";
import { homeslateDatabasePath, homeslateTokensPath } from "./paths";
import { hashPasscode, isValidPin, verifyPasscode } from "./passcode";
import { createTtlCache } from "./ttlCache";
import type { HomeslateServerOptions } from "./types";

/** Single-tenant account id. One display owner per host. */
export const LOCAL_ACCOUNT_ID = "local";

/**
 * Build the homeslate Hono API: display CRUD, the public kiosk route, the
 * Google OAuth routes, and the calendar / commute / weather-alerts proxies.
 *
 * Pair it with your own runtime, or use `startHomeslateServer` for the
 * batteries-included Node server.
 */
export function createHomeslateServer(opts: HomeslateServerOptions): Hono {
  const database = openSqlite(homeslateDatabasePath(opts.dataDir));
  const displays = opts.displayStore ?? new SqliteDisplayStore({ database });
  const bindings = new SqliteGoogleBindingStore({ database });
  const tokenStore =
    opts.tokenStore ?? new FileTokenStore({ dir: homeslateTokensPath(opts.dataDir) });
  const accountId = opts.accountId?.trim() || LOCAL_ACCOUNT_ID;
  const googleClientId = opts.google?.clientId?.trim() ?? "";
  const googleClientSecret = opts.google?.clientSecret?.trim() ?? "";
  const publicBaseUrl = opts.publicBaseUrl ?? DEFAULT_PUBLIC_BASE_URL;
  const redirectUri = googleRedirectUri(publicBaseUrl);
  const google: GoogleClient | null =
    googleClientId && googleClientSecret
      ? createGoogleClient({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          tokenStore,
        })
      : null;
  const app = new Hono();
  const commuteCache = createTtlCache<CommuteEstimate>();
  const weatherAlertsCache = createTtlCache<WeatherAlertsResponse>();

  const homeAssistantBaseUrl = opts.homeAssistant?.baseUrl?.trim() ?? "";
  const homeAssistantToken = opts.homeAssistant?.token?.trim() ?? "";
  const homeAssistant: HomeAssistantTransport | null =
    opts.homeAssistant?.transport ??
    (homeAssistantBaseUrl && homeAssistantToken
      ? createHomeAssistantClient({ baseUrl: homeAssistantBaseUrl, token: homeAssistantToken })
      : null);
  const homeAssistantTransportKind: HomeAssistantStatus["transport"] = opts.homeAssistant?.transport
    ? "relay"
    : homeAssistantBaseUrl && homeAssistantToken
      ? "direct"
      : null;

  app.get("/", (c) => c.redirect(`${publicBaseUrl.replace(/\/+$/, "")}/`));

  app.get("/api/displays", async (c) => c.json(await displays.list()));

  app.get("/api/commute", async (c) => {
    const parsed = parseCommuteQuery({
      origin: c.req.query("origin"),
      destination: c.req.query("destination"),
      units: c.req.query("units"),
    });
    if (!parsed.ok) return c.json({ error: "Invalid origin, destination, or units" }, 400);
    const apiKey = opts.openRouteServiceApiKey?.trim() ?? "";
    if (!apiKey) return c.json({ error: COMMUTE_MISSING_KEY_COPY }, 501);

    try {
      const estimate = await estimateCommute({
        apiKey,
        origin: parsed.origin,
        destination: parsed.destination,
        units: parsed.units,
        cache: commuteCache,
        now: Date.now(),
      });
      return c.json(estimate);
    } catch {
      return c.json({ error: "Commute provider failed" }, 502);
    }
  });

  app.get("/api/weather/alerts", async (c) => {
    const point = parseWeatherAlertPoint(c.req.query("lat"), c.req.query("lon"));
    if (!point) return c.json({ error: "Invalid lat or lon" }, 400);

    try {
      const payload = await fetchWeatherAlerts({
        lat: point.lat,
        lon: point.lon,
        cache: weatherAlertsCache,
        now: Date.now(),
      });
      return c.json(payload);
    } catch {
      return c.json({ error: "Weather alerts provider failed" }, 502);
    }
  });

  app.get("/api/homeassistant/status", async (c) => {
    const configured = homeAssistant !== null;
    const base: HomeAssistantStatus = {
      configured,
      transport: homeAssistantTransportKind,
      connected: configured,
      haReachable: configured ? true : null,
    };
    if (homeAssistant && hasStatus(homeAssistant)) {
      try {
        return c.json({ ...base, ...(await homeAssistant.status()) });
      } catch {
        return c.json({ ...base, connected: false });
      }
    }
    return c.json(base);
  });

  app.get("/api/homeassistant/entities", async (c) => {
    const domain = c.req.query("domain") ?? "climate";
    if (!isKnownDomain(domain)) {
      return c.json({ error: "Unsupported domain" }, 400);
    }
    if (!homeAssistant) return c.json({ error: homeAssistantMissingConfigCopy(domain) }, 501);

    try {
      return c.json({ entities: await homeAssistant.listEntities(domain) });
    } catch (error) {
      const { status, error: message } = homeAssistantRouteError(error);
      return c.json({ error: message }, status);
    }
  });

  app.get("/api/homeassistant/todo/:entityId/items", async (c) => {
    const entityId = c.req.param("entityId");
    if (!isValidTodoEntityId(entityId)) {
      return c.json({ error: "Invalid entity id" }, 400);
    }
    if (!homeAssistant) return c.json({ error: TODO_MISSING_CONFIG_COPY }, 501);

    try {
      const result = await homeAssistant.callService(
        "todo",
        "get_items",
        entityId,
        {},
        {
          returnResponse: true,
        },
      );
      return c.json({ items: mapTodoItems(result, entityId) });
    } catch (error) {
      const { status, error: message } = homeAssistantRouteError(error);
      return c.json({ error: message }, status);
    }
  });

  app.get("/api/homeassistant/states/:entityId", async (c) => {
    const entityId = c.req.param("entityId");
    const domain = entityDomain(entityId);
    if (!domain || !isKnownDomain(domain) || !isValidEntityId(domain, entityId)) {
      return c.json({ error: "Invalid entity id" }, 400);
    }
    if (!homeAssistant) return c.json({ error: homeAssistantMissingConfigCopy(domain) }, 501);

    try {
      const state = await homeAssistant.getEntity(entityId);
      if (!state) return c.json({ error: "Entity not found" }, 404);
      return c.json(mapEntity(domain, state) ?? state);
    } catch (error) {
      const { status, error: message } = homeAssistantRouteError(error);
      return c.json({ error: message }, status);
    }
  });

  app.post("/api/homeassistant/services/:domain/:service", async (c) => {
    const domain = c.req.param("domain");
    const service = c.req.param("service");
    if (!isKnownDomain(domain) || !isAllowedService(domain, service)) {
      return c.json({ error: "Unsupported service" }, 400);
    }
    if (!homeAssistant) return c.json({ error: homeAssistantMissingConfigCopy(domain) }, 501);

    let body: Record<string, unknown>;
    try {
      body = await optionalJsonBody(c.req.raw);
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }
    const entityId = typeof body.entity_id === "string" ? body.entity_id : "";
    if (!isValidEntityId(domain, entityId)) {
      return c.json({ error: "Invalid entity id" }, 400);
    }

    try {
      await homeAssistant.callService(domain, service, entityId, body);
      return c.json({ ok: true });
    } catch (error) {
      const { status, error: message } = homeAssistantRouteError(error);
      return c.json({ error: message }, status);
    }
  });

  app.post("/api/displays", async (c) => {
    try {
      const rawBody = await optionalJsonBody(c.req.raw);
      const document = assertValidDisplayDocument(rawBody.document ?? createEmptyDisplayDocument());
      const record = await displays.create(document);
      await bindings.setAccountIdForDisplay(record.id, accountId);
      return c.json(await toDisplayPayload(displays, record), 201);
    } catch (error) {
      return documentWriteError(c, error);
    }
  });

  app.get("/api/displays/:id", async (c) => {
    const record = await displays.get(c.req.param("id"));
    if (!record) return c.json({ error: "Display not found" }, 404);
    return c.json(await toDisplayPayload(displays, record));
  });

  app.put("/api/displays/:id", async (c) => {
    try {
      const document = assertValidDisplayDocument(await c.req.json());
      await displays.put(c.req.param("id"), document);
      const record = await displays.get(c.req.param("id"));
      return record ? c.json(await toDisplayPayload(displays, record)) : c.notFound();
    } catch (error) {
      return documentWriteError(c, error);
    }
  });

  // Sets or clears the 4-digit viewer passcode. The hash stays on the display
  // record and never appears in a response.
  app.patch("/api/displays/:id", async (c) => {
    const id = c.req.param("id");
    const record = await displays.get(id);
    if (!record) return c.json({ error: "Display not found" }, 404);

    let body: Record<string, unknown>;
    try {
      body = await optionalJsonBody(c.req.raw);
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }
    if (!("passcode" in body)) {
      return c.json({ error: "passcode is required" }, 400);
    }
    const passcode = body.passcode;
    if (passcode !== null && (typeof passcode !== "string" || !isValidPin(passcode))) {
      return c.json({ error: "Passcode must be 4 digits" }, 400);
    }

    try {
      await displays.setPasscode(id, passcode === null ? null : hashPasscode(passcode));
    } catch (error) {
      return documentWriteError(c, error);
    }
    return c.json({ id, passcodeEnabled: passcode !== null });
  });

  app.delete("/api/displays/:id", async (c) => {
    await displays.remove(c.req.param("id"));
    return c.json({ ok: true });
  });

  app.get("/api/public/:publicId", async (c) => {
    const record = await displays.getByPublicId(c.req.param("publicId"));
    if (!record) return c.json({ error: "Display not found" }, 404);
    if (!(await passcodeSatisfied(c, displays, record))) {
      return c.json({ passcodeRequired: true }, 401);
    }
    return c.json({ document: record.document });
  });

  app.put("/api/public/:publicId", async (c) => {
    const record = await displays.getByPublicId(c.req.param("publicId"));
    if (!record) return c.json({ error: "Display not found" }, 404);
    if (!(await passcodeSatisfied(c, displays, record))) {
      return c.json({ passcodeRequired: true }, 401);
    }

    try {
      const document = assertValidDisplayDocument(await c.req.json());
      await displays.put(record.id, document);
      return c.json({ document });
    } catch (error) {
      return documentWriteError(c, error);
    }
  });

  app.get("/api/display-calendar", async (c) => {
    const publicId = c.req.query("displayId");
    const calendarIdsParam = c.req.query("calendarIds");
    const daysAhead = Math.min(
      90,
      Math.max(1, parseInt(c.req.query("daysAhead") ?? "30", 10) || 30),
    );
    const daysBack = Math.min(
      90,
      Math.max(
        0,
        parseInt(c.req.query("daysBack") ?? String(DISPLAY_CALENDAR_DAYS_BACK_DEFAULT), 10) ||
          DISPLAY_CALENDAR_DAYS_BACK_DEFAULT,
      ),
    );

    if (!publicId || !calendarIdsParam) {
      return c.json({ error: "Missing displayId or calendarIds", reason: "missing_params" }, 400);
    }

    const record = await displays.getByPublicId(publicId);
    if (!record) return c.json({ error: "Display not found" }, 404);

    const calendarIds = calendarIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (calendarIds.length === 0) return c.json({ events: [], calendars: [] });

    const ownerAccountId = await bindings.getAccountIdForDisplay(record.id);
    if (!google || !ownerAccountId) return c.json(emptyCalendarPayload());

    try {
      const { timeMin, timeMax } = displayCalendarWindow(daysAhead, daysBack);
      const calendars = await google.listCalendars(ownerAccountId);
      const events = await google.listEvents(ownerAccountId, {
        calendarIds,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      });
      return c.json({ events, calendars });
    } catch (error) {
      if (isGoogleAuthError(error)) {
        if (error.code === "missing_tokens") return c.json(emptyCalendarPayload());
        if (error.code === "invalid_grant" || error.code === "token_revoked") {
          return c.json({ error: DISPLAY_GOOGLE_RECONNECT_MESSAGE, reason: error.code }, 401);
        }
        return c.json({ error: error.message, reason: error.code }, 502);
      }
      return c.json({ error: errorMessage(error) }, 502);
    }
  });

  app.get("/api/google/connect", (c) => {
    if (!google) return c.json({ error: "Google OAuth is not configured" }, 404);
    const state = createOAuthState();
    setCookie(c, GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      // Lax still sends the cookie on Google's top-level redirect back to us.
      sameSite: "Lax",
      secure: publicBaseUrl.startsWith("https://"),
      path: "/",
      maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_S,
    });
    return c.redirect(googleAuthorizationUrl(googleClientId, redirectUri, state));
  });

  app.get("/api/google/callback", async (c) => {
    if (!google) return c.json({ error: "Google OAuth is not configured" }, 404);
    const expectedState = getCookie(c, GOOGLE_OAUTH_STATE_COOKIE);
    deleteCookie(c, GOOGLE_OAUTH_STATE_COOKIE, { path: "/" });

    const authError = c.req.query("error");
    if (authError) {
      return c.json(
        { error: `Google sign-in was not completed: ${authError}`, reason: authError },
        400,
      );
    }
    if (!isMatchingOAuthState(c.req.query("state"), expectedState)) {
      return c.json(
        {
          error: "Google sign-in state did not match. Start again from Connect.",
          reason: "state_mismatch",
        },
        400,
      );
    }
    const code = c.req.query("code");
    if (!code) return c.json({ error: "Missing code", reason: "missing_code" }, 400);
    await google.exchangeAuthCode(accountId, code, redirectUri);
    return c.redirect("/");
  });

  app.get("/api/google/session", async (c) => {
    if (!google) return c.json({ accessToken: null });
    try {
      const accessToken = await google.getAccessToken(accountId);
      return c.json({ accessToken });
    } catch {
      return c.json({ accessToken: null });
    }
  });

  return app;
}

async function optionalJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.text();
  if (!body) return {};
  const value: unknown = JSON.parse(body);
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** User-facing "Home Assistant is not configured" copy, domain-aware. */
function homeAssistantMissingConfigCopy(domain: string): string {
  if (domain === "climate") return THERMOSTAT_MISSING_CONFIG_COPY;
  if (domain === "todo") return TODO_MISSING_CONFIG_COPY;
  return HA_MISSING_CONFIG_COPY;
}

/**
 * Map a Home Assistant transport failure onto an HTTP status. Transport errors
 * carry their own status (relay `503` offline / `504` timeout); anything else
 * is the generic upstream failure.
 */
function homeAssistantRouteError(error: unknown): { status: number; error: string } {
  if (error instanceof HomeAssistantTransportError) {
    return { status: error.status, error: error.userMessage };
  }
  if (error instanceof HomeAssistantError && error.status === 400) {
    return { status: 400, error: "Invalid service data" };
  }
  return { status: 502, error: "Home Assistant request failed" };
}

/** Owner-facing display shape: exposes whether a passcode is set, never the hash. */
async function toDisplayPayload(
  displays: DisplayStore,
  record: DisplayRecord,
): Promise<DisplayRecord & { passcodeEnabled: boolean }> {
  const passcodeHash = await displays.getPasscodeHash(record.id);
  return {
    id: record.id,
    publicId: record.publicId,
    document: record.document,
    passcodeEnabled: passcodeHash !== null,
  };
}

/** True when the display has no passcode or the request carries the right one. */
async function passcodeSatisfied(
  c: Context,
  displays: DisplayStore,
  record: DisplayRecord,
): Promise<boolean> {
  const passcodeHash = await displays.getPasscodeHash(record.id);
  if (!passcodeHash) return true;
  const provided = c.req.query("passcode");
  return typeof provided === "string" && verifyPasscode(provided, passcodeHash);
}

function documentWriteError(c: Context, error: unknown) {
  if (error instanceof InvalidDisplayDocumentError) {
    return c.json({ errors: error.errors }, 400);
  }
  if (error instanceof DisplayNotFoundError) {
    return c.json({ error: "Display not found" }, 404);
  }
  if (error instanceof SyntaxError) {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  throw error;
}

function emptyCalendarPayload() {
  return {
    events: [],
    calendars: [],
    error: DISPLAY_OWNER_SIGN_IN_MESSAGE,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
