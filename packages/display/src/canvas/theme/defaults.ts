import type { ThemeDocument } from "@homeslate/schema";

interface ThemeSeed {
  id: string;
  name: string;
  brand: { "500": string; "600": string };
  fontFamily: string;
  dark: ModeSeed;
  light: ModeSeed;
}

interface ModeSeed {
  canvas: string;
  canvasImage?: string;
  card: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  glow: string;
}

const SHARED_SPACE = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  12: "48px",
  16: "64px",
} as const;

const SHARED_RADIUS = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  full: "9999px",
} as const;

const SHARED_FONT_SIZE = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
} as const;

const SHARED_FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

const SHARED_LINE_HEIGHT = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

const STATUS_COLORS = {
  success: { "500": "#22c55e", "600": "#16a34a" },
  warning: { "500": "#f59e0b", "600": "#d97706" },
  danger: { "500": "#ef4444", "600": "#dc2626" },
  info: { "500": "#0ea5e9", "600": "#0284c7" },
} as const;

const SEEDS: ThemeSeed[] = [
  {
    id: "cosmos",
    name: "Cosmos",
    brand: { "500": "#6366f1", "600": "#a855f7" },
    fontFamily: "'Outfit', 'Inter', sans-serif",
    dark: {
      canvas: "#0a0a0f",
      canvasImage: [
        "radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
        "radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
        "radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)",
        "#0a0a0f",
      ].join(", "),
      card: "rgba(30, 30, 40, 0.6)",
      border: "rgba(255, 255, 255, 0.08)",
      textPrimary: "#e8e8f0",
      textMuted: "#6c6c7e",
      glow: "rgba(99, 102, 241, 0.3)",
    },
    light: {
      canvas: "#f5f4ff",
      canvasImage: [
        "radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)",
        "radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)",
        "#f5f4ff",
      ].join(", "),
      card: "rgba(255, 255, 255, 0.85)",
      border: "rgba(99, 102, 241, 0.15)",
      textPrimary: "#1a1a2e",
      textMuted: "#6b6b7e",
      glow: "rgba(99, 102, 241, 0.15)",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    brand: { "500": "#3b82f6", "600": "#60a5fa" },
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    dark: {
      canvas: "#080c14",
      card: "rgba(15, 20, 35, 0.85)",
      border: "rgba(255, 255, 255, 0.06)",
      textPrimary: "#e2e8f0",
      textMuted: "#64748b",
      glow: "rgba(59, 130, 246, 0.2)",
    },
    light: {
      canvas: "#eef3fb",
      card: "rgba(255, 255, 255, 0.9)",
      border: "rgba(59, 130, 246, 0.15)",
      textPrimary: "#0f172a",
      textMuted: "#64748b",
      glow: "rgba(59, 130, 246, 0.1)",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    brand: { "500": "#10b981", "600": "#34d399" },
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    dark: {
      canvas: "#060f0d",
      canvasImage: [
        "radial-gradient(ellipse at 30% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        "radial-gradient(ellipse at 70% 20%, rgba(52, 211, 153, 0.08) 0%, transparent 50%)",
        "#060f0d",
      ].join(", "),
      card: "rgba(16, 28, 25, 0.7)",
      border: "rgba(16, 185, 129, 0.15)",
      textPrimary: "#d1fae5",
      textMuted: "#6b7280",
      glow: "rgba(16, 185, 129, 0.25)",
    },
    light: {
      canvas: "#f0fdf8",
      canvasImage: [
        "radial-gradient(ellipse at 30% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)",
        "#f0fdf8",
      ].join(", "),
      card: "rgba(255, 255, 255, 0.85)",
      border: "rgba(16, 185, 129, 0.2)",
      textPrimary: "#064e3b",
      textMuted: "#6b7280",
      glow: "rgba(16, 185, 129, 0.12)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    brand: { "500": "#f59e0b", "600": "#ef4444" },
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    dark: {
      canvas: "#100804",
      canvasImage: [
        "radial-gradient(ellipse at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)",
        "radial-gradient(ellipse at 75% 15%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
        "#100804",
      ].join(", "),
      card: "rgba(30, 18, 10, 0.7)",
      border: "rgba(245, 158, 11, 0.12)",
      textPrimary: "#fef3c7",
      textMuted: "#78716c",
      glow: "rgba(245, 158, 11, 0.25)",
    },
    light: {
      canvas: "#fffbf0",
      canvasImage: [
        "radial-gradient(ellipse at 20% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)",
        "radial-gradient(ellipse at 75% 15%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)",
        "#fffbf0",
      ].join(", "),
      card: "rgba(255, 255, 255, 0.9)",
      border: "rgba(245, 158, 11, 0.2)",
      textPrimary: "#431407",
      textMuted: "#78716c",
      glow: "rgba(245, 158, 11, 0.1)",
    },
  },
  {
    id: "neon",
    name: "Neon",
    brand: { "500": "#f0abfc", "600": "#67e8f9" },
    fontFamily: "'Sora', 'Inter', sans-serif",
    dark: {
      canvas: "#02020a",
      canvasImage: [
        "radial-gradient(ellipse at 30% 40%, rgba(240, 171, 252, 0.1) 0%, transparent 50%)",
        "radial-gradient(ellipse at 70% 60%, rgba(103, 232, 249, 0.07) 0%, transparent 50%)",
        "#02020a",
      ].join(", "),
      card: "rgba(15, 8, 25, 0.85)",
      border: "rgba(240, 171, 252, 0.15)",
      textPrimary: "#fce7f3",
      textMuted: "#6b7280",
      glow: "rgba(240, 171, 252, 0.3)",
    },
    light: {
      canvas: "#fdf4ff",
      canvasImage: [
        "radial-gradient(ellipse at 30% 40%, rgba(192, 38, 211, 0.06) 0%, transparent 50%)",
        "radial-gradient(ellipse at 70% 60%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)",
        "#fdf4ff",
      ].join(", "),
      card: "rgba(255, 255, 255, 0.9)",
      border: "rgba(192, 38, 211, 0.15)",
      textPrimary: "#3b0764",
      textMuted: "#6b7280",
      glow: "rgba(192, 38, 211, 0.1)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    brand: { "500": "#06b6d4", "600": "#0ea5e9" },
    fontFamily: "'Nunito', 'Inter', sans-serif",
    dark: {
      canvas: "#020b14",
      canvasImage: [
        "radial-gradient(ellipse at 40% 60%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)",
        "radial-gradient(ellipse at 70% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)",
        "#020b14",
      ].join(", "),
      card: "rgba(10, 20, 40, 0.7)",
      border: "rgba(6, 182, 212, 0.15)",
      textPrimary: "#e0f2fe",
      textMuted: "#64748b",
      glow: "rgba(6, 182, 212, 0.25)",
    },
    light: {
      canvas: "#f0f9ff",
      canvasImage: [
        "radial-gradient(ellipse at 40% 60%, rgba(6, 182, 212, 0.07) 0%, transparent 60%)",
        "#f0f9ff",
      ].join(", "),
      card: "rgba(255, 255, 255, 0.9)",
      border: "rgba(6, 182, 212, 0.2)",
      textPrimary: "#0c4a6e",
      textMuted: "#64748b",
      glow: "rgba(6, 182, 212, 0.1)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    brand: { "500": "#22c55e", "600": "#86efac" },
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    dark: {
      canvas: "#030f06",
      canvasImage: [
        "radial-gradient(ellipse at 30% 60%, rgba(34, 197, 94, 0.12) 0%, transparent 60%)",
        "radial-gradient(ellipse at 70% 20%, rgba(134, 239, 172, 0.07) 0%, transparent 50%)",
        "#030f06",
      ].join(", "),
      card: "rgba(8, 20, 12, 0.75)",
      border: "rgba(34, 197, 94, 0.12)",
      textPrimary: "#dcfce7",
      textMuted: "#6b7280",
      glow: "rgba(34, 197, 94, 0.2)",
    },
    light: {
      canvas: "#f0fdf4",
      canvasImage: [
        "radial-gradient(ellipse at 30% 60%, rgba(34, 197, 94, 0.07) 0%, transparent 60%)",
        "#f0fdf4",
      ].join(", "),
      card: "rgba(255, 255, 255, 0.9)",
      border: "rgba(34, 197, 94, 0.2)",
      textPrimary: "#14532d",
      textMuted: "#6b7280",
      glow: "rgba(34, 197, 94, 0.1)",
    },
  },
  {
    id: "paper",
    name: "Paper",
    brand: { "500": "#4338ca", "600": "#7c3aed" },
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    dark: {
      canvas: "#16161e",
      card: "rgba(30, 30, 42, 0.85)",
      border: "rgba(255, 255, 255, 0.08)",
      textPrimary: "#e8e8f0",
      textMuted: "#6b7280",
      glow: "rgba(124, 58, 237, 0.2)",
    },
    light: {
      canvas: "#f5f5f7",
      card: "rgba(255, 255, 255, 0.85)",
      border: "rgba(0, 0, 0, 0.08)",
      textPrimary: "#1a1b1e",
      textMuted: "#6b7280",
      glow: "rgba(67, 56, 202, 0.15)",
    },
  },
];

function colorFaces(seed: ModeSeed, isDark: boolean, brand: ThemeSeed["brand"]) {
  return {
    background: {
      app: seed.canvas,
      surface: seed.card,
    },
    text: {
      primary: seed.textPrimary,
      secondary: seed.textMuted,
    },
    border: {
      subtle: seed.border,
      default: seed.border,
      strong: brand["500"],
      focus: seed.glow,
    },
    ring: {
      default: seed.glow,
    },
    link: {
      default: brand["500"],
    },
    tone: {
      accent: {
        background: brand["500"],
        foreground: brand["500"],
      },
      success: {
        background: STATUS_COLORS.success["500"],
        foreground: isDark ? "#dcfce7" : "#166534",
        subtleBackground: isDark ? "#166534" : "#dcfce7",
        border: STATUS_COLORS.success["500"],
      },
      warning: {
        background: STATUS_COLORS.warning["500"],
        foreground: isDark ? "#fef3c7" : "#92400e",
        subtleBackground: isDark ? "#92400e" : "#fef3c7",
        border: STATUS_COLORS.warning["500"],
      },
      danger: {
        background: STATUS_COLORS.danger["500"],
        foreground: isDark ? "#fee2e2" : "#991b1b",
        subtleBackground: isDark ? "#991b1b" : "#fee2e2",
        border: STATUS_COLORS.danger["500"],
      },
      info: {
        background: STATUS_COLORS.info["500"],
        foreground: brand["500"],
        subtleBackground: isDark ? "#0c4a6e" : "#e0f2fe",
        border: STATUS_COLORS.info["500"],
      },
    },
  };
}

function buildDocument(seed: ThemeSeed): ThemeDocument {
  return {
    id: `theme-${seed.id}`,
    name: seed.name,
    version: 2,
    isActive: false,
    tokens: {
      fontFamily: {
        body: seed.fontFamily,
        display: seed.fontFamily,
        mono: "'Fira Code', 'SFMono-Regular', Menlo, monospace",
      },
      space: SHARED_SPACE,
      radius: SHARED_RADIUS,
      fontSize: SHARED_FONT_SIZE,
      fontWeight: SHARED_FONT_WEIGHT,
      lineHeight: SHARED_LINE_HEIGHT,
    },
    colorMode: {
      light: colorFaces(seed.light, false, seed.brand),
      dark: colorFaces(seed.dark, true, seed.brand),
    },
    extend: {
      widget: {
        background: { light: seed.light.card, dark: seed.dark.card },
        borderColor: { light: seed.light.border, dark: seed.dark.border },
        borderWidth: "1px",
        radius: "12px",
        padding: "12px",
      },
      ...(seed.light.canvasImage || seed.dark.canvasImage
        ? {
            canvas: {
              backgroundImage: {
                light: seed.light.canvasImage ?? seed.light.canvas,
                dark: seed.dark.canvasImage ?? seed.dark.canvas,
              },
            },
          }
        : {}),
    },
  };
}

export const DEFAULT_THEME_DOCUMENTS: ThemeDocument[] = SEEDS.map(buildDocument);

export const THEME_PRESET_OPTIONS = DEFAULT_THEME_DOCUMENTS.map((doc) => ({
  value: doc.id,
  label: doc.name,
}));

export function getPresetById(id: string): ThemeDocument {
  return DEFAULT_THEME_DOCUMENTS.find((doc) => doc.id === id) ?? DEFAULT_THEME_DOCUMENTS[0];
}

export function pickActiveDocument(
  themes: ThemeDocument[],
  activeThemeId: string | null,
): ThemeDocument {
  if (activeThemeId) {
    const found = themes.find((t) => t.id === activeThemeId);
    if (found) return found;
  }
  return themes[0] ?? DEFAULT_THEME_DOCUMENTS[0];
}
