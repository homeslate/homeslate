import { styles } from "../typeStyles";

export const container = styles.class("homestatuswidget-container", {
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

export const transparent = styles.class("homestatuswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("homestatuswidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("homestatuswidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("homestatuswidget-emptyTitle", {
  fontWeight: 600,
});

export const list = styles.class("homestatuswidget-list", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-1)",
  flex: "1",
});

export const row = styles.class("homestatuswidget-row", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  padding: "var(--var-ui-space-1) 0",
  borderBottom: "1px solid var(--var-ui-color-border-subtle, transparent)",
});

export const rowIcon = styles.class("homestatuswidget-rowIcon", {
  color: "var(--var-ui-color-text-secondary)",
  display: "flex",
  flexShrink: 0,
});

export const rowLabel = styles.class("homestatuswidget-rowLabel", {
  flex: "1",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const rowValue = styles.class("homestatuswidget-rowValue", {
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const errorBox = styles.class("homestatuswidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
