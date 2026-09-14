import { describe, it, expect } from "vite-plus/test";
import { validateThemeDocument } from "./themeDocumentValidation";

function minimalDoc(): unknown {
  return {
    id: "test",
    name: "Test",
    version: 2,
    isActive: true,
    tokens: {
      color: { brand: "#6366f1" },
      space: { md: "16px" },
      radius: { md: "10px" },
      fontFamily: { body: "Inter, sans-serif" },
    },
    colorMode: {
      light: {
        background: { app: "#f5f4ff" },
        text: { primary: "#1a1a2e" },
      },
      dark: {
        background: { app: "#0a0a0f" },
        text: { primary: "#e8e8f0" },
      },
    },
  };
}

describe("validateThemeDocument", () => {
  it("accepts a minimal valid document", () => {
    const result = validateThemeDocument(minimalDoc());
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("accepts a document without tokens and colorMode", () => {
    const result = validateThemeDocument({
      id: "test",
      name: "Test",
      version: 2,
      isActive: true,
    });
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("accepts optional extend as a map of objects", () => {
    const doc = minimalDoc() as Record<string, unknown>;
    doc.extend = { widget: { background: "#1e1e28" } };
    const result = validateThemeDocument(doc);
    expect(result.ok).toBe(true);
  });

  it("rejects a missing id", () => {
    const doc = minimalDoc() as { id?: string };
    delete doc.id;
    const result = validateThemeDocument(doc);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path === "id" || i.path.includes("id"))).toBe(true);
  });

  it("rejects unknown top-level keys", () => {
    const doc = minimalDoc() as Record<string, unknown>;
    doc.bogus = true;
    const result = validateThemeDocument(doc);
    expect(result.ok).toBe(false);
  });

  it("rejects version below 2", () => {
    const doc = minimalDoc() as { version: number };
    doc.version = 1;
    const result = validateThemeDocument(doc);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path === "version")).toBe(true);
  });
});
