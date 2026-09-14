import { styles } from "./typeStyles";

export const panel = styles.class("widgetpanel-panel", {
  width: "240px",
  minWidth: "240px",
  background: "var(--var-ui-color-background-surface)",
  borderRight: "1px solid var(--var-ui-color-border-default)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "width 0.2s ease,\n    min-width 0.2s ease",
  flexShrink: "0",
});

export const toggleBar = styles.class("widgetpanel-toggleBar", {
  display: "flex",
  justifyContent: "flex-end",
  padding: "8px 6px 4px",
  borderBottom: "1px solid var(--var-ui-color-border-default)",
});

export const toggleBtn = styles.class("widgetpanel-toggleBtn", {
  color: "var(--var-ui-color-text-secondary)",
});

export const content = styles.class("widgetpanel-content", {
  padding: "12px 8px",
  overflowY: "auto",
  flex: "1",
});

export const panelTitle = styles.class("widgetpanel-panelTitle", {
  letterSpacing: "0.06em",
  marginBottom: "8px",
  padding: "0 4px",
  color: "var(--var-ui-color-text-primary)",
});

export const widgetRow = styles.class("widgetpanel-widgetRow", {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 6px",
  borderRadius: "6px",
  width: "100%",
  transition: "background 0.1s ease",
  color: "var(--var-ui-color-text-primary)",
  "&:hover": {
    background: "var(--var-ui-color-overlay-hover)",
  },
});

export const widgetIcon = styles.class("widgetpanel-widgetIcon", {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  background: "var(--var-ui-color-overlay-hover)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--var-ui-color-tone-accent-foreground)",
  flexShrink: "0",
});

export const iconOnly = styles.class("widgetpanel-iconOnly", {
  width: "36px",
  height: "36px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--var-ui-color-text-secondary)",
  transition: "background 0.1s ease,\n    color 0.1s ease",
  "&:hover": {
    background: "var(--var-ui-color-overlay-hover)",
    color: "var(--var-ui-color-tone-accent-foreground)",
  },
});

export const collapsed = styles.class("widgetpanel-collapsed", {
  width: "48px",
  minWidth: "48px",
  [`& .${toggleBar}`]: {
    justifyContent: "center",
  },
});
