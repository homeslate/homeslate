import { styles } from "../typeStyles";

export const container = styles.class("presencewidget-container", {
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

export const transparent = styles.class("presencewidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("presencewidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("presencewidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("presencewidget-emptyTitle", {
  fontWeight: 600,
});

export const list = styles.class("presencewidget-list", {
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
  flex: "1",
});

export const row = styles.class("presencewidget-row", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-2)",
  padding: "var(--var-ui-space-1) 0",
});

export const avatar = styles.class("presencewidget-avatar", {
  width: "36px",
  height: "36px",
  borderRadius: "999px",
  objectFit: "cover",
  flexShrink: 0,
  background: "var(--var-ui-color-background-muted)",
});

export const avatarFallback = styles.class("presencewidget-avatarFallback", {
  width: "36px",
  height: "36px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontWeight: 600,
  background: "var(--var-ui-color-background-muted)",
});

export const details = styles.class("presencewidget-details", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: "1",
});

export const name = styles.class("presencewidget-name", {
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const state = styles.class("presencewidget-state", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.85em",
});

export const dot = styles.class("presencewidget-dot", {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  display: "inline-block",
});
