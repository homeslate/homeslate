import { styles } from "../typeStyles";

export const container = styles.class("securitywidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
});

export const transparent = styles.class("securitywidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("securitywidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("securitywidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("securitywidget-emptyTitle", {
  fontWeight: 600,
});

export const list = styles.class("securitywidget-list", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
  flex: "1",
});

export const row = styles.class("securitywidget-row", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  border: "1px solid var(--var-ui-color-border-default)",
  background: "var(--var-ui-color-background-muted, transparent)",
});

export const rowPending = styles.class("securitywidget-rowPending", {
  opacity: 0.65,
});

export const rowUnavailable = styles.class("securitywidget-rowUnavailable", {
  opacity: 0.5,
});

export const rowTop = styles.class("securitywidget-rowTop", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
});

export const rowIcon = styles.class("securitywidget-rowIcon", {
  color: "var(--var-ui-color-text-secondary)",
  display: "flex",
  flexShrink: 0,
});

export const details = styles.class("securitywidget-details", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1",
});

export const name = styles.class("securitywidget-name", {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const state = styles.class("securitywidget-state", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.8em",
});

export const dot = styles.class("securitywidget-dot", {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  flexShrink: 0,
});

export const actions = styles.class("securitywidget-actions", {
  display: "flex",
  gap: "var(--var-ui-space-1)",
  flexWrap: "wrap",
});

export const errorBox = styles.class("securitywidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
