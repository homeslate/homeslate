import { styles } from "../typeStyles";

export const container = styles.class("todowidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("todowidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("todowidget-empty", {
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const list = styles.class("todowidget-list", {
  flex: "1",
  overflowY: "auto",
});

export const deleteBtn = styles.class("todowidget-deleteBtn", {});

export const addRow = styles.class("todowidget-addRow", {
  marginTop: "0.25rem",
  paddingTop: "0.25rem",
  borderTop: "1px solid var(--var-ui-color-border-default)",
});

export const item = styles.class("todowidget-item", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.6rem",
  padding: "0.4rem 0.25rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  borderRadius: "var(--var-ui-radius-sm)",
  transition: "background 0.12s ease",
  "&:hover": {
    background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 8%, transparent)",
  },
});

export const itemText = styles.class("todowidget-itemText", {
  color: "var(--var-ui-color-text-primary)",
  flex: "1",
  wordBreak: "break-word",
  lineHeight: "1.4",
});

export const checkbox = styles.class("todowidget-checkbox", {
  width: "18px",
  height: "18px",
  minWidth: "18px",
  border: "2px solid var(--var-ui-color-tone-accent-foreground)",
  borderRadius: "var(--var-ui-radius-sm)",
  marginTop: "1px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.12s ease,\n    border-color 0.12s ease",
  color: "transparent",
});

export const checkboxChecked = styles.class("todowidget-checkboxChecked", {
  background: "var(--var-ui-color-tone-accent-foreground)",
  color: "var(--var-ui-color-tone-accent-foregroundOnBackground)",
});

export const itemRow = styles.class("todowidget-itemRow", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  [`& .${deleteBtn}`]: {
    flexShrink: "0",
    opacity: "0.6",
  },
  [`&:hover .${deleteBtn}`]: {
    opacity: "1",
  },
});

export const itemChecked = styles.class("todowidget-itemChecked", {
  [`& .${itemText}`]: {
    textDecoration: "line-through",
    opacity: "0.45",
  },
});
