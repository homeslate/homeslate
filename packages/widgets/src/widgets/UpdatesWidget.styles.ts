import { styles } from "../typeStyles";

export const container = styles.class("updateswidget-container", {
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

export const transparent = styles.class("updateswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("updateswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("updateswidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("updateswidget-emptyTitle", {
  fontWeight: 600,
});

export const list = styles.class("updateswidget-list", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
  flex: "1",
});

export const row = styles.class("updateswidget-row", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-1)",
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  border: "1px solid var(--var-ui-color-border-default)",
  background: "var(--var-ui-color-background-muted, transparent)",
});

export const rowPending = styles.class("updateswidget-rowPending", {
  opacity: 0.65,
});

export const rowUnavailable = styles.class("updateswidget-rowUnavailable", {
  opacity: 0.5,
});

export const rowTop = styles.class("updateswidget-rowTop", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
});

export const rowIcon = styles.class("updateswidget-rowIcon", {
  color: "var(--var-ui-color-text-secondary)",
  display: "flex",
  flexShrink: 0,
});

export const details = styles.class("updateswidget-details", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1",
});

export const name = styles.class("updateswidget-name", {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const state = styles.class("updateswidget-state", {
  fontSize: "0.8em",
  color: "var(--var-ui-color-text-secondary)",
});

export const version = styles.class("updateswidget-version", {
  fontSize: "0.75em",
  color: "var(--var-ui-color-text-secondary)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const progressTrack = styles.class("updateswidget-progressTrack", {
  height: "4px",
  borderRadius: "999px",
  background: "var(--var-ui-color-border-default)",
  overflow: "hidden",
});

export const progressFill = styles.class("updateswidget-progressFill", {
  height: "100%",
  background: "var(--var-ui-color-accent)",
  borderRadius: "999px",
});

export const actions = styles.class("updateswidget-actions", {
  display: "flex",
  gap: "var(--var-ui-space-1)",
  flexWrap: "wrap",
});

export const errorBox = styles.class("updateswidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
