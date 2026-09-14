import { styles } from "../typeStyles";

export const container = styles.class("stockswidget-container", {
  height: "100%",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-4))",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--var-ui-color-tone-success-foreground) 10%, transparent) 0%,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 10%, transparent) 100%\n  )",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
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
  color: "var(--var-ui-color-tone-success-foreground)",
});

export const refreshBtn = styles.class("stockswidget-refreshBtn", {
  color: "var(--var-ui-color-text-secondary)",
  "&:hover": {
    color: "var(--var-ui-color-text-primary)",
    background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 12%, transparent)",
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
  background: "var(--var-ui-color-background-surface)",
  border: "1px solid var(--var-ui-color-border-default)",
  transition: "all 0.2s ease",
  "&:hover": {
    background:
      "color-mix(in srgb, var(--var-ui-color-tone-success-foreground) 8%, var(--var-ui-color-background-surface))",
    borderColor:
      "color-mix(in srgb, var(--var-ui-color-tone-success-foreground) 45%, var(--var-ui-color-border-default))",
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
  color: "var(--var-ui-color-tone-success-foreground)",
});

export const negative = styles.class("stockswidget-negative", {
  color: "var(--var-ui-color-tone-danger-foreground)",
});

export const neutral = styles.class("stockswidget-neutral", {
  color: "var(--var-ui-color-text-secondary)",
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
  color: "var(--var-ui-color-tone-success-foreground)",
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
  background: "var(--var-ui-color-background-popover, var(--var-ui-color-background-surface))",
  border: "1px solid var(--var-ui-color-border-default)",
  maxHeight: "250px",
  overflowY: "auto",
});

export const searchResult = styles.class("stockswidget-searchResult", {
  color: "var(--var-ui-color-text-secondary)",
  fontWeight: "normal",
  "&:hover:not(:disabled)": {
    color: "var(--var-ui-color-text-primary)",
    background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 12%, transparent)",
  },
  "&:disabled": {
    opacity: "0.7",
  },
});
