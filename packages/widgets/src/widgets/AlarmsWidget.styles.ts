import { styles } from "../typeStyles";

export const container = styles.class("alarmswidget-container", {
  height: "100%",
  background: "var(--token-widget-background, var(--token-surface-card))",
  border:
    "var(--token-widget-border-width, 1px) solid\n    var(--token-widget-border-color, var(--token-border-default))",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  padding: "var(--token-widget-padding, var(--token-spacing-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("alarmswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("alarmswidget-empty", {
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});
