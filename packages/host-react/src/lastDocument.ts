import type { DisplayDocument } from "@homeslate/schema";

export const LAST_DOCUMENT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const LAST_DOCUMENT_MAX_BYTES = 512 * 1024;

export interface LastDocumentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavedDisplayDocument {
  document: DisplayDocument;
  savedAt: number;
}

interface Envelope {
  savedAt: number;
  document: DisplayDocument;
}

export function lastDocumentKey(publicId: string): string {
  return `homeslate:lastDocument:v1:${publicId}`;
}

function browserStorage(): LastDocumentStorage {
  return {
    getItem(key) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      if (typeof localStorage === "undefined") throw new Error("localStorage is unavailable");
      localStorage.setItem(key, value);
    },
    removeItem(key) {
      try {
        localStorage?.removeItem(key);
      } catch {
        // Ignore private-mode failures.
      }
    },
  };
}

export function saveLastDocument(
  publicId: string,
  document: DisplayDocument,
  storage: LastDocumentStorage = browserStorage(),
  now = Date.now(),
): boolean {
  const payload = JSON.stringify({ savedAt: now, document } satisfies Envelope);
  if (payload.length > LAST_DOCUMENT_MAX_BYTES) return false;
  try {
    storage.setItem(lastDocumentKey(publicId), payload);
    return true;
  } catch {
    return false;
  }
}

export function loadLastDocument(
  publicId: string,
  storage: LastDocumentStorage = browserStorage(),
  now = Date.now(),
): SavedDisplayDocument | null {
  const key = lastDocumentKey(publicId);
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Envelope;
    if (!parsed || typeof parsed.savedAt !== "number" || !parsed.document) {
      storage.removeItem(key);
      return null;
    }
    if (now - parsed.savedAt >= LAST_DOCUMENT_MAX_AGE_MS) {
      storage.removeItem(key);
      return null;
    }
    return { document: parsed.document, savedAt: parsed.savedAt };
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function clearLastDocument(
  publicId: string,
  storage: LastDocumentStorage = browserStorage(),
): void {
  storage.removeItem(lastDocumentKey(publicId));
}
