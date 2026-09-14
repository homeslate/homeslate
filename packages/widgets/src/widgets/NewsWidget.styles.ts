import { styles } from "../typeStyles";

export const container = styles.class("newswidget-container", {
  height: "100%",
  padding: "var(--token-widget-padding, var(--token-spacing-4))",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--token-color-brand-500) 10%, transparent) 0%,\n    color-mix(in srgb, var(--token-color-brand-600) 10%, transparent) 100%\n  )",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("newswidget-transparent", {
  background: "transparent",
});

export const header = styles.class("newswidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.75rem",
  flexShrink: "0",
});

export const title = styles.class("newswidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: "600",
  fontSize: "1rem",
  color: "var(--token-color-brand-500)",
});

export const newsList = styles.class("newswidget-newsList", {
  flex: "1",
  overflowY: "auto",
  minHeight: "0",
});

export const newsItem = styles.class("newswidget-newsItem", {
  background: "var(--token-surface-card)",
  border: "1px solid var(--token-border-default)",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "color-mix(in srgb, var(--token-color-brand-500) 8%, var(--token-surface-card))",
    borderColor:
      "color-mix(in srgb, var(--token-color-brand-500) 45%, var(--token-border-default))",
  },
});

export const newsLink = styles.class("newswidget-newsLink", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  textDecoration: "none",
  color: "inherit",
});

export const newsTitle = styles.class("newswidget-newsTitle", {
  flex: "1",
  transition: "color 0.2s ease",
  [`.${newsLink}:hover &`]: {
    color: "var(--token-text-link)",
  },
});

export const externalIcon = styles.class("newswidget-externalIcon", {
  flexShrink: "0",
  marginTop: "3px",
  opacity: "0.5",
});

export const newsMeta = styles.class("newswidget-newsMeta", {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginTop: "0.5rem",
});

export const source = styles.class("newswidget-source", {
  color: "var(--token-color-brand-500)",
  fontWeight: "500",
});

export const empty = styles.class("newswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const emptyIcon = styles.class("newswidget-emptyIcon", {
  color: "var(--token-color-brand-500)",
  opacity: "0.5",
});

export const loading = styles.class("newswidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const error = styles.class("newswidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const checkboxLabel = styles.class("newswidget-checkboxLabel", {
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
