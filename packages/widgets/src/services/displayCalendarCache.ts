/** How long a cached display-calendar response is served without hitting the network. */
export const DISPLAY_CALENDAR_CLIENT_TTL_MS = 5 * 60 * 1000;
/** Drop entries older than this instead of showing them. */
export const DISPLAY_CALENDAR_MAX_STALE_MS = 24 * 60 * 60 * 1000;

export type DisplayCalendarCacheAction = "fresh" | "stale" | "expired";

export function displayCalendarCacheAction(
  fetchedAt: number,
  nowMs = Date.now(),
): DisplayCalendarCacheAction {
  const age = nowMs - fetchedAt;
  if (age >= DISPLAY_CALENDAR_MAX_STALE_MS) return "expired";
  if (age < DISPLAY_CALENDAR_CLIENT_TTL_MS) return "fresh";
  return "stale";
}

const DB_NAME = "homeslate-display-calendar-v1";
const STORE_NAME = "responses";
const DB_VERSION = 1;

export interface DisplayCalendarCacheEntry {
  url: string;
  body: string;
  status: number;
  fetchedAt: number;
}

function isDisplayCalendarRequest(url: string): boolean {
  try {
    const parsed = new URL(
      url,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );
    return parsed.pathname.includes("display-calendar");
  } catch {
    return url.includes("display-calendar");
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "url" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function readEntry(url: string): Promise<DisplayCalendarCacheEntry | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB read failed"));
      req.onsuccess = () => resolve((req.result as DisplayCalendarCacheEntry | undefined) ?? null);
    });
  } finally {
    db.close();
  }
}

async function writeEntry(entry: DisplayCalendarCacheEntry): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
    });
  } finally {
    db.close();
  }
}

export function isDisplayCalendarCacheFresh(fetchedAt: number, nowMs = Date.now()): boolean {
  return displayCalendarCacheAction(fetchedAt, nowMs) === "fresh";
}

function jsonResponse(
  body: string,
  status: number,
  fetchedAt: number,
  fromCache: boolean,
): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Homeslate-Calendar-Fetched-At": String(fetchedAt),
      ...(fromCache ? { "X-Homeslate-Calendar-Cache": "hit" } : {}),
    },
  });
}

async function fetchAndStore(url: string, fetchImpl: typeof fetch): Promise<Response> {
  const res = await fetchImpl(url);
  const body = await res.text();
  if (res.ok) {
    await writeEntry({
      url,
      body,
      status: res.status,
      fetchedAt: Date.now(),
    });
  }
  return jsonResponse(body, res.status, Date.now(), false);
}

function scheduleRevalidate(url: string, fetchImpl: typeof fetch) {
  void fetchAndStore(url, fetchImpl).catch((err) => {
    console.warn("[display-calendar-cache] background revalidate failed", err);
  });
}

/** Stale-while-revalidate: fresh entries skip the network; stale/offline falls back to IndexedDB. */
export async function fetchDisplayCalendarCached(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  fetchImpl: typeof fetch,
): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!isDisplayCalendarRequest(url)) {
    return fetchImpl(input, init);
  }

  const cached = await readEntry(url);
  const action = cached ? displayCalendarCacheAction(cached.fetchedAt) : "expired";

  if (cached && action === "fresh") {
    return jsonResponse(cached.body, cached.status, cached.fetchedAt, true);
  }

  if (cached && action === "stale") {
    scheduleRevalidate(url, fetchImpl);
    return jsonResponse(cached.body, cached.status, cached.fetchedAt, true);
  }

  try {
    return await fetchAndStore(url, fetchImpl);
  } catch (err) {
    if (cached && action === "stale") {
      console.warn("[display-calendar-cache] network failed; using stale cache", err);
      return jsonResponse(cached.body, cached.status, cached.fetchedAt, true);
    }
    throw err;
  }
}
