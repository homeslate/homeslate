import { styles } from "../typeStyles";

export const container = styles.class("sportswidget-container", {
  height: "100%",
  padding: "var(--token-widget-padding, var(--token-spacing-4))",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--token-color-brand-500) 10%, transparent) 0%,\n    color-mix(in srgb, var(--token-color-brand-600) 10%, transparent) 100%\n  )",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("sportswidget-transparent", {
  background: "transparent",
});

export const header = styles.class("sportswidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.75rem",
  flexShrink: "0",
});

export const title = styles.class("sportswidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: "600",
  fontSize: "1rem",
  color: "var(--token-color-brand-500)",
});

export const refreshBtn = styles.class("sportswidget-refreshBtn", {
  color: "var(--token-text-muted)",
  "&:hover": {
    color: "var(--token-text-primary)",
    background: "color-mix(in srgb, var(--token-color-brand-500) 12%, transparent)",
  },
});

export const gamesList = styles.class("sportswidget-gamesList", {
  flex: "1",
  minHeight: "0",
});

export const gameCard = styles.class("sportswidget-gameCard", {
  padding: "0.4rem 0.25rem",
});

export const teamRow = styles.class("sportswidget-teamRow", {
  padding: "2px 0",
});

export const leagueLogo = styles.class("sportswidget-leagueLogo", {
  width: "20px",
  height: "20px",
  objectFit: "contain",
  flexShrink: "0",
});

export const teamLogo = styles.class("sportswidget-teamLogo", {
  width: "20px",
  height: "20px",
  objectFit: "contain",
  flexShrink: "0",
});

export const teamName = styles.class("sportswidget-teamName", {
  flex: "1",
  minWidth: "0",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const score = styles.class("sportswidget-score", {
  flexShrink: "0",
  minWidth: "2rem",
  textAlign: "right",
});

export const liveBadge = styles.class("sportswidget-liveBadge", {
  animation: "pulse 2s infinite",
});

export const finalText = styles.class("sportswidget-finalText", {
  fontStyle: "italic",
});

export const empty = styles.class("sportswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const emptyIcon = styles.class("sportswidget-emptyIcon", {
  color: "var(--token-color-brand-500)",
  opacity: "0.5",
});

export const loading = styles.class("sportswidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const attribution = styles.class("sportswidget-attribution", {
  opacity: "0.5",
  flexShrink: "0",
});
