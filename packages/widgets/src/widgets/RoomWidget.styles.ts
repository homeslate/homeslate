import { styles } from "../typeStyles";

export const container = styles.class("roomwidget-container", {
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

export const transparent = styles.class("roomwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("roomwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("roomwidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("roomwidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("roomwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("roomwidget-title", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const name = styles.class("roomwidget-name", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
});

export const summary = styles.class("roomwidget-summary", {
  fontSize: "0.8em",
  color: "var(--var-ui-color-text-secondary)",
});

export const actions = styles.class("roomwidget-actions", {
  display: "flex",
  gap: "var(--var-ui-space-1)",
  flexWrap: "wrap",
});

export const list = styles.class("roomwidget-list", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-1)",
  flex: "1",
});

export const row = styles.class("roomwidget-row", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  padding: "var(--var-ui-space-1) 0",
});

export const rowPending = styles.class("roomwidget-rowPending", {
  opacity: 0.65,
});

export const rowUnavailable = styles.class("roomwidget-rowUnavailable", {
  opacity: 0.5,
});

export const rowIcon = styles.class("roomwidget-rowIcon", {
  color: "var(--var-ui-color-text-secondary)",
  display: "flex",
  flexShrink: 0,
});

export const details = styles.class("roomwidget-details", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1",
});

export const rowName = styles.class("roomwidget-rowName", {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const rowState = styles.class("roomwidget-rowState", {
  fontSize: "0.75em",
  color: "var(--var-ui-color-text-secondary)",
});

export const rowActions = styles.class("roomwidget-rowActions", {
  display: "flex",
  gap: "var(--var-ui-space-1)",
  flexShrink: 0,
});

export const errorBox = styles.class("roomwidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
