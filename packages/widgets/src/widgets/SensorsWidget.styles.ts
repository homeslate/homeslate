import { styles } from "../typeStyles";

export const container = styles.class("sensorswidget-container", {
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

export const transparent = styles.class("sensorswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("sensorswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("sensorswidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("sensorswidget-emptyTitle", {
  fontWeight: 600,
});

export const list = styles.class("sensorswidget-list", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
  flex: "1",
});

export const grid = styles.class("sensorswidget-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "var(--var-ui-space-2)",
  flex: "1",
  alignContent: "start",
});

export const row = styles.class("sensorswidget-row", {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "var(--var-ui-space-2)",
  borderRadius: "var(--var-ui-radius-sm)",
  background: "var(--var-ui-color-background-muted, transparent)",
});

export const rowTop = styles.class("sensorswidget-rowTop", {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const rowLabel = styles.class("sensorswidget-rowLabel", {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const rowValue = styles.class("sensorswidget-rowValue", {
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const binaryDot = styles.class("sensorswidget-binaryDot", {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  display: "inline-block",
  marginRight: "6px",
});

export const gaugeTrack = styles.class("sensorswidget-gaugeTrack", {
  height: "4px",
  borderRadius: "999px",
  background: "var(--var-ui-color-background-muted)",
  overflow: "hidden",
});

export const gaugeFill = styles.class("sensorswidget-gaugeFill", {
  height: "100%",
  borderRadius: "999px",
  background: "var(--var-ui-color-accent)",
  transition: "width 300ms ease",
});

export const errorBox = styles.class("sensorswidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
