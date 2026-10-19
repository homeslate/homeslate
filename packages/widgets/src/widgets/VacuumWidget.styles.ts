import { styles } from "../typeStyles";

export const container = styles.class("vacuumwidget-container", {
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

export const transparent = styles.class("vacuumwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("vacuumwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("vacuumwidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("vacuumwidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("vacuumwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("vacuumwidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
  minWidth: 0,
});

export const battery = styles.class("vacuumwidget-battery", {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "0.8em",
  color: "var(--var-ui-color-text-secondary)",
});

export const stateRow = styles.class("vacuumwidget-stateRow", {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--var-ui-space-2)",
});

export const stateLabel = styles.class("vacuumwidget-stateLabel", {
  fontSize: "1.4em",
  fontWeight: 600,
});

export const actions = styles.class("vacuumwidget-actions", {
  display: "flex",
  gap: "var(--var-ui-space-1)",
  flexWrap: "wrap",
});

export const errorBox = styles.class("vacuumwidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
