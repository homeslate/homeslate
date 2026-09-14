import type { CSSProperties } from "react";

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

interface BackgroundImageConfig {
  backgroundImage?: string;
  backgroundImageSize?: "cover" | "contain" | "tile";
  backgroundOverlayOpacity?: number;
}

export function getBackgroundStyle(config: BackgroundImageConfig): CSSProperties {
  if (!config.backgroundImage) return {};
  const opacity = config.backgroundOverlayOpacity ?? 0.5;
  const size =
    config.backgroundImageSize === "tile" ? "auto" : (config.backgroundImageSize ?? "cover");
  const repeat = config.backgroundImageSize === "tile" ? "repeat" : "no-repeat";
  return {
    background: `linear-gradient(rgba(0,0,0,${opacity}), rgba(0,0,0,${opacity})), url(${config.backgroundImage}) center/${size} ${repeat}`,
  };
}
