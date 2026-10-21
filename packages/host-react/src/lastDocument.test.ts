import { describe, expect, it } from "vite-plus/test";
import type { DisplayDocument } from "@homeslate/schema";
import {
  LAST_DOCUMENT_MAX_AGE_MS,
  LAST_DOCUMENT_MAX_BYTES,
  clearLastDocument,
  loadLastDocument,
  saveLastDocument,
} from "./lastDocument";

function memoryStore() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

const document = {
  schemaVersion: 1,
  name: "Kitchen",
  views: [],
  activeViewId: null,
  rotation: { enabled: false, intervalMs: 15000 },
  themes: [],
  activeThemeId: null,
  settings: {},
} as DisplayDocument;

describe("lastDocument", () => {
  it("saves and loads before any network call", () => {
    const storage = memoryStore();
    expect(saveLastDocument("board", document, storage, 1_000)).toBe(true);
    expect(loadLastDocument("board", storage, 1_500)?.document.name).toBe("Kitchen");
    expect(loadLastDocument("other", storage, 1_500)).toBeNull();
  });

  it("expires old documents and rejects oversized ones", () => {
    const storage = memoryStore();
    saveLastDocument("board", document, storage, 0);
    expect(loadLastDocument("board", storage, LAST_DOCUMENT_MAX_AGE_MS)).toBeNull();

    const huge = {
      ...document,
      name: "x".repeat(LAST_DOCUMENT_MAX_BYTES),
    } as DisplayDocument;
    expect(saveLastDocument("huge", huge, storage, 10)).toBe(false);
    expect(loadLastDocument("huge", storage, 10)).toBeNull();
  });

  it("clears one display without touching another", () => {
    const storage = memoryStore();
    saveLastDocument("a", document, storage, 1);
    saveLastDocument("b", { ...document, name: "Hall" }, storage, 1);
    clearLastDocument("a", storage);
    expect(loadLastDocument("a", storage, 2)).toBeNull();
    expect(loadLastDocument("b", storage, 2)?.document.name).toBe("Hall");
  });
});
