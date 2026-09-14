import {
  createDesignTheme,
  type DesignTheme,
  type DesignThemeColorMode,
  type DesignThemeTokenValues,
  type ExtendTokenValues,
} from "@var-ui/core";
import type { ThemeDocument } from "@homeslate/schema";

export function createDisplayTheme(doc: ThemeDocument): DesignTheme {
  return createDesignTheme({
    name: `homeslate-${doc.id}`,
    tokens: doc.tokens as DesignThemeTokenValues | undefined,
    colorMode: doc.colorMode as DesignThemeColorMode | undefined,
    extend: doc.extend as Record<string, ExtendTokenValues> | undefined,
  });
}
