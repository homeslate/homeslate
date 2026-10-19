import { styles } from "../typeStyles";

export const container = styles.class("notifywidget-container", {
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

export const transparent = styles.class("notifywidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("notifywidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("notifywidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("notifywidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("notifywidget-header", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
});

export const headerIcon = styles.class("notifywidget-headerIcon", {
  color: "var(--var-ui-color-accent)",
  display: "flex",
  flexShrink: 0,
});

export const title = styles.class("notifywidget-title", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1",
});

export const name = styles.class("notifywidget-name", {
  fontWeight: 600,
});

export const target = styles.class("notifywidget-target", {
  fontSize: "0.8em",
  color: "var(--var-ui-color-text-secondary)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const form = styles.class("notifywidget-form", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
});

export const row = styles.class("notifywidget-row", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
});

export const status = styles.class("notifywidget-status", {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "0.8em",
  color: "var(--var-ui-color-tone-success-foreground)",
});

export const errorBox = styles.class("notifywidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
