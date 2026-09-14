import { styles } from "../typeStyles";

export const container = styles.class("stockswidget-container", {
  height: "100%",
  padding: "var(--token-widget-padding, var(--token-spacing-4))",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--token-status-success-fg) 10%, transparent) 0%,\n    color-mix(in srgb, var(--token-color-brand-500) 10%, transparent) 100%\n  )",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("stockswidget-transparent", {
  background: "transparent",
});

export const header = styles.class("stockswidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.75rem",
  flexShrink: "0",
});

export const title = styles.class("stockswidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: "600",
  fontSize: "1rem",
  color: "var(--token-status-success-fg)",
});

export const refreshBtn = styles.class("stockswidget-refreshBtn", {
  color: "var(--token-text-muted)",
  "&:hover": {
    color: "var(--token-text-primary)",
    background: "color-mix(in srgb, var(--token-color-brand-500) 12%, transparent)",
  },
});

export const stocksList = styles.class("stockswidget-stocksList", {
  flex: "1",
  overflowY: "auto",
  minHeight: "0",
});

export const stockRow = styles.class("stockswidget-stockRow", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
  background: "var(--token-surface-card)",
  border: "1px solid var(--token-border-default)",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "color-mix(in srgb, var(--token-status-success-fg) 8%, var(--token-surface-card))",
    borderColor:
      "color-mix(in srgb, var(--token-status-success-fg) 45%, var(--token-border-default))",
  },
});

export const stockInfo = styles.class("stockswidget-stockInfo", {
  flex: "1",
  minWidth: "0",
});

export const stockPrice = styles.class("stockswidget-stockPrice", {
  textAlign: "right",
  flexShrink: "0",
});

export const change = styles.class("stockswidget-change", {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "0.25rem",
  marginTop: "2px",
});

export const positive = styles.class("stockswidget-positive", {
  color: "var(--token-status-success-fg)",
});

export const negative = styles.class("stockswidget-negative", {
  color: "var(--token-status-danger-fg)",
});

export const neutral = styles.class("stockswidget-neutral", {
  color: "var(--token-text-muted)",
});

export const attribution = styles.class("stockswidget-attribution", {
  opacity: "0.5",
  flexShrink: "0",
});

export const empty = styles.class("stockswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const emptyIcon = styles.class("stockswidget-emptyIcon", {
  color: "var(--token-status-success-fg)",
  opacity: "0.5",
});

export const loading = styles.class("stockswidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const checkboxLabel = styles.class("stockswidget-checkboxLabel", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  cursor: "pointer",
  "& input": {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
});

export const searchResults = styles.class("stockswidget-searchResults", {
  background: "var(--token-surface-overlay, var(--token-surface-card))",
  border: "1px solid var(--token-border-default)",
  maxHeight: "250px",
  overflowY: "auto",
});

export const searchResult = styles.class("stockswidget-searchResult", {
  color: "var(--token-text-muted)",
  fontWeight: "normal",
  "&:hover:not(:disabled)": {
    color: "var(--token-text-primary)",
    background: "color-mix(in srgb, var(--token-color-brand-500) 12%, transparent)",
  },
  "&:disabled": {
    opacity: "0.7",
  },
});
