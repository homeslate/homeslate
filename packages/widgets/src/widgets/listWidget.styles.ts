import { styles } from "../typeStyles";

export const container = styles.class("listwidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const transparent = styles.class("listwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("listwidget-empty", {
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const header = styles.class("listwidget-header", {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const list = styles.class("listwidget-list", {
  flex: "1",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
});

export const row = styles.class("listwidget-row", {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  width: "100%",
  minHeight: "44px",
  padding: "0.45rem 0.5rem",
  border: "none",
  background: "transparent",
  color: "var(--var-ui-color-text-primary)",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "var(--var-ui-radius-sm)",
  "&:hover": {
    background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, transparent)",
  },
});

export const routineRow = styles.class("listwidget-routineRow", {
  minHeight: "72px",
  fontSize: "1.15rem",
});

export const label = styles.class("listwidget-label", {
  flex: "1",
  wordBreak: "break-word",
  lineHeight: "1.3",
});

export const number = styles.class("listwidget-number", {
  width: "1.75rem",
  minWidth: "1.75rem",
  height: "1.75rem",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "0.9rem",
  background: "var(--var-ui-color-tone-accent-foreground)",
  color: "var(--var-ui-color-tone-accent-foregroundOnBackground)",
});

export const disc = styles.class("listwidget-disc", {
  width: "1.5rem",
  height: "1.5rem",
  minWidth: "1.5rem",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  fontWeight: "700",
  color: "var(--var-ui-color-tone-accent-foregroundOnBackground)",
});

export const checkbox = styles.class("listwidget-checkbox", {
  width: "1.25rem",
  height: "1.25rem",
  minWidth: "1.25rem",
  border: "2px solid var(--var-ui-color-tone-accent-foreground)",
  borderRadius: "var(--var-ui-radius-sm)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "transparent",
});

export const checkboxOn = styles.class("listwidget-checkboxOn", {
  background: "var(--var-ui-color-tone-accent-foreground)",
  color: "var(--var-ui-color-tone-accent-foregroundOnBackground)",
});

export const aisle = styles.class("listwidget-aisle", {
  fontSize: "0.7rem",
  fontWeight: "700",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--var-ui-color-text-secondary)",
  marginTop: "0.35rem",
});

export const addRow = styles.class("listwidget-addRow", {
  display: "flex",
  gap: "0.35rem",
  paddingTop: "0.25rem",
  borderTop: "1px solid var(--var-ui-color-border-default)",
});

export const countdownValue = styles.class("listwidget-countdownValue", {
  fontWeight: "700",
  lineHeight: "1.1",
  color: "var(--var-ui-color-text-primary)",
});

export const announcement = styles.class("listwidget-announcement", {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  color: "var(--var-ui-color-text-primary)",
});

export const sizeMd = styles.class("listwidget-sizeMd", {
  fontSize: "1.1rem",
});

export const sizeLg = styles.class("listwidget-sizeLg", {
  fontSize: "1.6rem",
});

export const sizeXl = styles.class("listwidget-sizeXl", {
  fontSize: "2.1rem",
});

export const rowDone = styles.class("listwidget-rowDone", {
  opacity: "0.45",
  [`& .${label}`]: {
    textDecoration: "line-through",
  },
});
