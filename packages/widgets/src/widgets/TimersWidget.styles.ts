import { styles } from "../typeStyles";

export const container = styles.class("timerswidget-container", {
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

export const transparent = styles.class("timerswidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("timerswidget-empty", {
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const list = styles.class("timerswidget-list", {
  minHeight: "min-content",
});

export const runtimeCard = styles.class("timerswidget-runtimeCard", {
  background: "var(--token-surface-elevated, var(--token-surface-card))",
});

export const runtimeDetails = styles.class("timerswidget-runtimeDetails", {
  minWidth: "0",
});

export const countdown = styles.class("timerswidget-countdown", {
  fontSize: "var(--mantine-font-size-xl)",
  fontVariantNumeric: "tabular-nums",
  fontWeight: "700",
  lineHeight: "1.1",
});

export const labelInput = styles.class("timerswidget-labelInput", {
  flex: "1",
  minWidth: "0",
});

export const touchAction = styles.class("timerswidget-touchAction", {
  minWidth: "44px",
  minHeight: "44px",
});

export const touchButton = styles.class("timerswidget-touchButton", {
  minHeight: "44px",
});
