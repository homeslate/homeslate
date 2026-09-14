import { useEffect, useMemo, type CSSProperties } from "react";
import {
  createDesignTheme,
  disposeDesignTheme,
  type DesignTheme,
  type DesignThemeColorMode,
  type DesignThemeTokenValues,
  type ExtendTokenValues,
} from "@var-ui/core";
import type { ColorMode, ThemeDocument } from "@homeslate/schema";

export function displayThemeName(docId: string): string {
  return `homeslate-${docId}`;
}

export function previewDisplayThemeName(docId: string): string {
  return `${displayThemeName(docId)}-preview`;
}

export function createDisplayTheme(
  doc: ThemeDocument,
  name = displayThemeName(doc.id),
): DesignTheme {
  return createDesignTheme({
    name,
    tokens: doc.tokens as DesignThemeTokenValues | undefined,
    colorMode: doc.colorMode as DesignThemeColorMode | undefined,
    extend: doc.extend as Record<string, ExtendTokenValues> | undefined,
  });
}

function readModeAwareString(value: unknown, mode: ColorMode): string | undefined {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const picked = record[mode] ?? record.light ?? record.dark;
  return typeof picked === "string" ? picked : undefined;
}

export function getCanvasBackgroundStyle(doc: ThemeDocument, mode: ColorMode): CSSProperties {
  const backgroundImage = readModeAwareString(doc.extend?.canvas?.backgroundImage, mode);
  return backgroundImage ? { backgroundImage } : {};
}

export function createInactivePreviewThemeDispose(previewId: string): () => void {
  return () => {
    disposeDesignTheme(previewDisplayThemeName(previewId));
  };
}

export function useCompiledDisplayTheme(doc: ThemeDocument): DesignTheme {
  const tokensKey = JSON.stringify(doc.tokens ?? null);
  const colorModeKey = JSON.stringify(doc.colorMode ?? null);
  const extendKey = JSON.stringify(doc.extend ?? null);
  const theme = useMemo(
    () => createDisplayTheme(doc),
    // tokens/colorMode/extend identity is unstable across persist; serialize instead
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see serialized keys above
    [doc.id, tokensKey, colorModeKey, extendKey],
  );
  useEffect(() => () => disposeDesignTheme(displayThemeName(doc.id)), [doc.id]);
  return theme;
}
