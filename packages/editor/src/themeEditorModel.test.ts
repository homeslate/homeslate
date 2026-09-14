import { describe, expect, it } from "vite-plus/test";
import { getPresetById } from "@homeslate/display/canvas";
import {
  buildReferenceOptions,
  buildColorReferenceOptions,
  getEditableTokenEntries,
  getColorTokenEntries,
  getWidgetTokenSections,
  tokenCssVarName,
  setTokenValue,
  setColorTokenValue,
} from "./themeEditorModel";

describe("theme editor model", () => {
  it("lists editable foundation and mode color tokens", () => {
    const doc = getPresetById("theme-cosmos");
    const entries = getColorTokenEntries(doc, "dark");

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Color / Tone / Accent / Foreground",
          referencePath: "color.tone.accent.foreground",
          value: "#6366f1",
        }),
        expect.objectContaining({
          label: "Color / Background / App",
          referencePath: "color.background.app",
          value: expect.stringContaining("#0a0a0f"),
        }),
        expect.objectContaining({
          label: "Extend / Widget / Background",
          referencePath: "extend.widget.background",
          value: expect.stringContaining("rgba("),
        }),
      ]),
    );
  });

  it("builds reference options for foundation and the selected mode", () => {
    const doc = getPresetById("theme-cosmos");
    const options = buildColorReferenceOptions(doc, "dark", "color.link.default");

    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Color / Tone / Accent / Foreground (#6366f1)",
          value: "{color.tone.accent.foreground}",
        }),
        expect.objectContaining({
          label: "Color / Background / Surface (rgba(30, 30, 40, 0.6))",
          value: "{color.background.surface}",
        }),
      ]),
    );
    expect(options).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "{color.link.default}" }),
        expect.objectContaining({ value: "{colorMode.light.background.surface}" }),
      ]),
    );
  });

  it("updates a color token value without mutating the original document", () => {
    const doc = getPresetById("theme-cosmos");
    const updated = setColorTokenValue(doc, ["colorMode", "dark", "link", "default"], "#ff00aa");

    expect((updated.colorMode?.dark as { link: { default: string } }).link.default).toBe("#ff00aa");
    expect((doc.colorMode?.dark as { link: { default: string } }).link.default).toBe("#6366f1");
    expect((updated.colorMode?.light as { link: { default: string } }).link.default).toBe(
      "#6366f1",
    );
  });

  it("lists editable font family and dimension tokens", () => {
    const doc = getPresetById("theme-cosmos");
    const entries = getEditableTokenEntries(doc, "dark", ["fontFamily", "dimension"]);

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "fontFamily",
          label: "Font Family / Body",
          referencePath: "fontFamily.body",
          value: "'Outfit', 'Inter', sans-serif",
        }),
        expect.objectContaining({
          type: "dimension",
          label: "Radius / Md",
          referencePath: "radius.md",
          value: "10px",
        }),
        expect.objectContaining({
          type: "dimension",
          label: "Extend / Widget / Border Width",
          referencePath: "extend.widget.borderWidth",
          value: "1px",
        }),
      ]),
    );
  });

  it("builds type-aware reference options", () => {
    const doc = getPresetById("theme-cosmos");
    const dimensionOptions = buildReferenceOptions(
      doc,
      "dark",
      "dimension",
      "extend.widget.radius",
    );
    const fontOptions = buildReferenceOptions(doc, "dark", "fontFamily");

    expect(dimensionOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Radius / Md (10px)",
          value: "{radius.md}",
        }),
      ]),
    );
    expect(dimensionOptions).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "{extend.widget.radius}" }),
        expect.objectContaining({ value: "{fontFamily.body}" }),
      ]),
    );
    expect(fontOptions).toEqual(
      expect.arrayContaining([expect.objectContaining({ value: "{fontFamily.body}" })]),
    );
  });

  it("updates non-color token values without mutating the original document", () => {
    const doc = getPresetById("theme-cosmos");
    const withFont = setTokenValue(
      doc,
      ["tokens", "fontFamily", "body"],
      "'Aptos', sans-serif",
      "fontFamily",
    );
    const withRadius = setTokenValue(doc, ["extend", "widget", "radius"], "18px", "dimension");

    expect((withFont.tokens?.fontFamily as { body: string }).body).toBe("'Aptos', sans-serif");
    expect((doc.tokens?.fontFamily as { body: string }).body).toBe("'Outfit', 'Inter', sans-serif");
    expect((withRadius.extend?.widget as { radius: string }).radius).toBe("18px");
    expect((doc.extend?.widget as { radius: string }).radius).toBe("12px");
  });

  it("groups widget-impacting tokens by editable token family", () => {
    const doc = getPresetById("theme-cosmos");
    const sections = getWidgetTokenSections(getEditableTokenEntries(doc, "dark"));

    expect(sections.map((section) => section.id)).toEqual([
      "widget",
      "surfaces",
      "text",
      "brand-status",
      "shape",
    ]);
    expect(sections[0]).toEqual(
      expect.objectContaining({
        title: "Widget component",
        entries: expect.arrayContaining([
          expect.objectContaining({ referencePath: "extend.widget.background" }),
          expect.objectContaining({ referencePath: "extend.widget.borderColor" }),
          expect.objectContaining({ referencePath: "extend.widget.padding" }),
        ]),
      }),
    );
    expect(sections.find((section) => section.id === "text")?.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ referencePath: "color.text.primary" }),
        expect.objectContaining({ referencePath: "color.text.secondary" }),
      ]),
    );
  });

  it("filters widget token sections by label, path, and CSS variable", () => {
    const doc = getPresetById("theme-cosmos");
    const entries = getEditableTokenEntries(doc, "dark");

    expect(getWidgetTokenSections(entries, "text.secondary")).toEqual([
      expect.objectContaining({
        id: "text",
        entries: [expect.objectContaining({ referencePath: "color.text.secondary" })],
      }),
    ]);

    expect(getWidgetTokenSections(entries, "--var-ui-widget-borderColor")).toEqual([
      expect.objectContaining({
        id: "widget",
        entries: [expect.objectContaining({ referencePath: "extend.widget.borderColor" })],
      }),
    ]);
  });

  it("formats generated CSS variable names for token paths", () => {
    expect(tokenCssVarName("extend.widget.borderColor")).toBe("--var-ui-widget-borderColor");
    expect(tokenCssVarName("color.text.primary")).toBe("--var-ui-color-text-primary");
    expect(tokenCssVarName("fontFamily.body")).toBe("--var-ui-fontFamily-body");
    expect(tokenCssVarName("radius.md")).toBe("--var-ui-radius-md");
  });
});
