import type { ColorMode, ThemeDocument } from "@homeslate/schema";

export type EditableTokenType = "color" | "fontFamily" | "dimension";

export interface EditableTokenEntry {
  label: string;
  tokenPath: string[];
  referencePath: string;
  type: EditableTokenType;
  value: string;
}

export type ColorTokenEntry = EditableTokenEntry & { type: "color" };

export interface ReferenceOption {
  label: string;
  value: string;
}

export type ColorReferenceOption = ReferenceOption;

export interface WidgetTokenSection {
  id: string;
  title: string;
  description: string;
  entries: EditableTokenEntry[];
}

interface WidgetTokenSectionDef {
  id: string;
  title: string;
  description: string;
  paths?: readonly string[];
  prefixes?: readonly string[];
}

type JsonRecord = Record<string, unknown>;

const SKIP_TOKEN_NAMESPACES = new Set(["fontWeight", "lineHeight"]);

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function titleize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_.]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLabel(path: string[]): string {
  return path.map(titleize).join(" / ");
}

function isModeAwareLeaf(value: unknown): value is { light?: string; dark?: string } {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((key) => (key === "light" || key === "dark") && typeof value[key] === "string");
}

function looksLikeColor(value: string): boolean {
  return (
    /^(#|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|hwb\(|color-mix\(|transparent\b|currentcolor\b)/i.test(
      value,
    ) || /gradient\(/i.test(value)
  );
}

function looksLikeDimension(value: string): boolean {
  return /^-?[\d.]+(?:px|rem|em|%|vh|vw|ch|ex|fr|svh|svw)?$/i.test(value.trim());
}

function inferType(referencePath: string[], value: string): EditableTokenType | null {
  const ns = referencePath[0];
  if (ns === "fontFamily") return "fontFamily";
  if (ns === "color") return "color";
  if (ns === "space" || ns === "radius" || ns === "fontSize" || ns === "size") return "dimension";
  if (looksLikeColor(value)) return "color";
  if (looksLikeDimension(value)) return "dimension";
  return null;
}

function inferTypeFromTokenPath(tokenPath: string[], value: string): EditableTokenType | null {
  if (tokenPath[0] === "colorMode") return "color";
  if (tokenPath[0] === "tokens" && tokenPath[1] === "fontFamily") return "fontFamily";
  if (
    tokenPath[0] === "tokens" &&
    (tokenPath[1] === "space" || tokenPath[1] === "radius" || tokenPath[1] === "fontSize")
  ) {
    return "dimension";
  }
  const referencePath =
    tokenPath[0] === "extend"
      ? tokenPath.filter((segment) => segment !== "light" && segment !== "dark")
      : tokenPath.slice(tokenPath[0] === "tokens" ? 1 : 0);
  return inferType(referencePath, value);
}

export function tokenCssVarName(referencePath: string): string {
  const segments = referencePath.split(".").filter(Boolean);
  const stripped = segments[0] === "extend" ? segments.slice(1) : segments;
  return `--var-ui-${stripped.join("-")}`;
}

const WIDGET_TOKEN_SECTION_DEFS: readonly WidgetTokenSectionDef[] = [
  {
    id: "widget",
    title: "Widget component",
    description:
      "Direct widget container tokens: card background, border, radius, padding, and shadow.",
    paths: [
      "extend.widget.background",
      "extend.widget.borderColor",
      "extend.widget.borderWidth",
      "extend.widget.radius",
      "extend.widget.padding",
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces and borders",
    description:
      "Shared surfaces and border colors used inside widget content, overlays, lists, and cards.",
    paths: [
      "color.background.app",
      "color.background.surface",
      "color.background.subtle",
      "color.background.elevated",
      "color.background.popover",
      "color.border.subtle",
      "color.border.default",
      "color.border.strong",
      "color.border.focus",
      "color.ring.default",
    ],
  },
  {
    id: "text",
    title: "Text and typography",
    description:
      "Primary widget text, muted labels, inverse text over media, links, and font families.",
    paths: [
      "color.text.primary",
      "color.text.secondary",
      "color.text.disabled",
      "color.link.default",
      "fontFamily.body",
      "fontFamily.mono",
    ],
  },
  {
    id: "brand-status",
    title: "Brand, status, and interactions",
    description: "Accent colors, status chips, buttons, hover states, and live/current indicators.",
    prefixes: ["color.tone."],
  },
  {
    id: "shape",
    title: "Shape and spacing",
    description:
      "Foundation radius and spacing tokens that widget modules use for density and layout rhythm.",
    prefixes: ["radius.", "space."],
  },
] as const;

function matchesSection(entry: EditableTokenEntry, section: WidgetTokenSectionDef) {
  if (section.paths?.includes(entry.referencePath)) return true;
  if (section.prefixes?.some((prefix) => entry.referencePath.startsWith(prefix))) return true;
  return false;
}

function matchesQuery(entry: EditableTokenEntry, query: string) {
  if (!query) return true;
  const haystack =
    `${entry.label} ${entry.referencePath} ${tokenCssVarName(entry.referencePath)} ${entry.value}`.toLowerCase();
  return haystack.includes(query);
}

function walkEditableTokens(
  node: unknown,
  tokenPath: string[],
  referencePath: string[],
  types: readonly EditableTokenType[],
  mode: ColorMode,
  out: EditableTokenEntry[],
  typeHint?: EditableTokenType,
): void {
  if (typeof node === "string" || typeof node === "number") {
    const value = String(node);
    const type = typeHint ?? inferType(referencePath, value);
    if (!type || !types.includes(type)) return;
    out.push({
      label: formatLabel(referencePath),
      tokenPath,
      referencePath: referencePath.join("."),
      type,
      value,
    });
    return;
  }

  if (isModeAwareLeaf(node)) {
    const value = node[mode] ?? node.light ?? node.dark;
    if (typeof value !== "string") return;
    walkEditableTokens(value, [...tokenPath, mode], referencePath, types, mode, out, typeHint);
    return;
  }

  if (!isRecord(node)) return;

  for (const [key, value] of Object.entries(node)) {
    walkEditableTokens(
      value,
      [...tokenPath, key],
      [...referencePath, key],
      types,
      mode,
      out,
      typeHint,
    );
  }
}

export function getEditableTokenEntries(
  doc: ThemeDocument,
  mode: ColorMode,
  types: readonly EditableTokenType[] = ["color", "fontFamily", "dimension"],
): EditableTokenEntry[] {
  const entries: EditableTokenEntry[] = [];

  if (isRecord(doc.tokens)) {
    for (const [namespace, value] of Object.entries(doc.tokens)) {
      if (SKIP_TOKEN_NAMESPACES.has(namespace)) continue;
      const hint: EditableTokenType | undefined =
        namespace === "fontFamily"
          ? "fontFamily"
          : namespace === "space" || namespace === "radius" || namespace === "fontSize"
            ? "dimension"
            : undefined;
      walkEditableTokens(value, ["tokens", namespace], [namespace], types, mode, entries, hint);
    }
  }

  const modeColors = doc.colorMode?.[mode];
  if (modeColors) {
    walkEditableTokens(modeColors, ["colorMode", mode], ["color"], types, mode, entries, "color");
  }

  if (doc.extend) {
    walkEditableTokens(doc.extend, ["extend"], ["extend"], types, mode, entries);
  }

  return entries;
}

export function getColorTokenEntries(doc: ThemeDocument, mode: ColorMode): ColorTokenEntry[] {
  return getEditableTokenEntries(doc, mode, ["color"]) as ColorTokenEntry[];
}

export function getWidgetTokenSections(
  entries: EditableTokenEntry[],
  query = "",
): WidgetTokenSection[] {
  const normalizedQuery = query.trim().toLowerCase();
  const used = new Set<string>();

  return WIDGET_TOKEN_SECTION_DEFS.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    entries: entries.filter((entry) => {
      if (used.has(entry.referencePath)) return false;
      if (!matchesSection(entry, section)) return false;
      if (!matchesQuery(entry, normalizedQuery)) return false;
      used.add(entry.referencePath);
      return true;
    }),
  })).filter((section) => section.entries.length > 0);
}

export function buildReferenceOptions(
  doc: ThemeDocument,
  mode: ColorMode,
  type: EditableTokenType,
  excludeReferencePath?: string,
): ReferenceOption[] {
  return getEditableTokenEntries(doc, mode, [type])
    .filter((entry) => entry.referencePath !== excludeReferencePath)
    .map((entry) => ({
      label: `${entry.label} (${entry.value})`,
      value: `{${entry.referencePath}}`,
    }));
}

export function buildColorReferenceOptions(
  doc: ThemeDocument,
  mode: ColorMode,
  excludeReferencePath?: string,
): ColorReferenceOption[] {
  return buildReferenceOptions(doc, mode, "color", excludeReferencePath);
}

export function setTokenValue(
  doc: ThemeDocument,
  tokenPath: string[],
  value: string,
  expectedType?: EditableTokenType,
): ThemeDocument {
  const next = structuredClone(doc) as ThemeDocument;
  let cursor: unknown = next;
  let parent: JsonRecord | undefined;
  let last: string | undefined;

  for (const segment of tokenPath) {
    if (!isRecord(cursor)) {
      throw new Error(`Invalid theme token path: ${tokenPath.join(".")}`);
    }
    parent = cursor;
    last = segment;
    cursor = cursor[segment];
  }

  if ((typeof cursor !== "string" && typeof cursor !== "number") || !parent || last === undefined) {
    throw new Error(`Theme token path is not an editable token: ${tokenPath.join(".")}`);
  }
  if (expectedType) {
    const inferred = inferTypeFromTokenPath(tokenPath, String(cursor));
    if (inferred !== expectedType) {
      throw new Error(`Theme token path is not a ${expectedType} token: ${tokenPath.join(".")}`);
    }
  }

  parent[last] = value;
  return next;
}

export function setColorTokenValue(
  doc: ThemeDocument,
  tokenPath: string[],
  value: string,
): ThemeDocument {
  return setTokenValue(doc, tokenPath, value, "color");
}
