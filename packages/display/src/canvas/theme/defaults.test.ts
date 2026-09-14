import { describe, it, expect } from "vite-plus/test";
import { DEFAULT_THEME_DOCUMENTS } from "./defaults";
import { validateThemeDocument } from "@homeslate/schema";

describe("DEFAULT_THEME_DOCUMENTS — validation", () => {
  for (const doc of DEFAULT_THEME_DOCUMENTS) {
    it(`validates: ${doc.name}`, () => {
      const result = validateThemeDocument(doc);
      if (!result.ok) {
        throw new Error(`${doc.name} failed validation: ${JSON.stringify(result.issues, null, 2)}`);
      }
      expect(result.ok).toBe(true);
    });
  }
});

describe("DEFAULT_THEME_DOCUMENTS — VarUI token JSON", () => {
  it("stores flattened VarUI tokens without DTCG wrappers", () => {
    const doc = DEFAULT_THEME_DOCUMENTS[0];
    const json = JSON.stringify(doc);
    expect(json).not.toContain("$type");
    expect(json).not.toContain("$value");
    expect(json).not.toContain("$schema");
    expect(doc.version).toBe(2);
    expect(doc.tokens?.fontFamily).toEqual(
      expect.objectContaining({ body: expect.any(String), display: expect.any(String) }),
    );
    expect(doc.colorMode?.light).toEqual(
      expect.objectContaining({
        background: expect.objectContaining({ app: expect.any(String) }),
        text: expect.objectContaining({
          primary: expect.any(String),
          secondary: expect.any(String),
        }),
      }),
    );
    expect(doc.extend?.widget).toEqual(
      expect.objectContaining({
        background: expect.any(Object),
        radius: "12px",
      }),
    );
  });
});
