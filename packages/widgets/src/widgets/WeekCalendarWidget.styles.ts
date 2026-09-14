import { styles } from "../typeStyles";

export const container = styles.class("weekcalendarwidget-container", {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  fontSize: "12px",
});

export const transparent = styles.class("weekcalendarwidget-transparent", {
  background: "transparent",
});

export const dayHeaders = styles.class("weekcalendarwidget-dayHeaders", {
  display: "grid",
  gridTemplateColumns: "48px repeat(7, 1fr)",
  flexShrink: "0",
  borderBottom: "1px solid var(--token-border-default)",
  paddingBottom: "6px",
  paddingTop: "4px",
});

export const timeGutterHead = styles.class("weekcalendarwidget-timeGutterHead", {});

export const dayHead = styles.class("weekcalendarwidget-dayHead", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  padding: "0 2px",
});

export const dayName = styles.class("weekcalendarwidget-dayName", {
  fontSize: "10px",
  color: "var(--token-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: "500",
});

export const dayNum = styles.class("weekcalendarwidget-dayNum", {
  width: "26px",
  height: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  fontSize: "13px",
  fontWeight: "500",
  color: "var(--token-text-primary)",
});

export const dayNumToday = styles.class("weekcalendarwidget-dayNumToday", {
  background: "var(--token-color-brand-500)",
  color: "var(--token-text-inverse)",
  fontWeight: "700",
  boxShadow: "0 0 0 2px color-mix(in srgb, var(--token-color-brand-500) 45%, transparent)",
});

export const dayHeadPast = styles.class("weekcalendarwidget-dayHeadPast", {
  [`& .${dayName}`]: {
    color: "color-mix(in srgb, var(--token-text-muted) 55%, transparent)",
  },
  [`& .${dayNum}`]: {
    color: "color-mix(in srgb, var(--token-text-muted) 55%, transparent)",
  },
});

export const allDayStrip = styles.class("weekcalendarwidget-allDayStrip", {
  display: "grid",
  gridTemplateColumns: "48px repeat(7, 1fr)",
  flexShrink: "0",
  borderBottom: "1px solid var(--token-border-default)",
  minHeight: "24px",
  padding: "2px 0",
});

export const allDayGutter = styles.class("weekcalendarwidget-allDayGutter", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  paddingRight: "6px",
  paddingTop: "3px",
  fontSize: "9px",
  color: "var(--token-text-muted)",
  whiteSpace: "nowrap",
});

export const allDayColumn = styles.class("weekcalendarwidget-allDayColumn", {
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  padding: "0 1px",
});

export const allDayEvent = styles.class("weekcalendarwidget-allDayEvent", {
  borderRadius: "3px",
  padding: "1px 4px",
  fontSize: "10px",
  fontWeight: "500",
  color: "var(--token-text-inverse)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  opacity: "0.9",
  cursor: "pointer",
  "&:focus-visible": {
    outline: "2px solid var(--token-focus-ring)",
    outlineOffset: "1px",
  },
});

export const scrollable = styles.class("weekcalendarwidget-scrollable", {
  flex: "1",
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: "var(--token-border-default) transparent",
});

export const gridBody = styles.class("weekcalendarwidget-gridBody", {
  display: "grid",
  gridTemplateColumns: "48px repeat(7, 1fr)",
  position: "relative",
});

export const timeGutter = styles.class("weekcalendarwidget-timeGutter", {
  position: "relative",
});

export const hourLabel = styles.class("weekcalendarwidget-hourLabel", {
  position: "absolute",
  right: "6px",
  fontSize: "9px",
  color: "var(--token-text-muted)",
  whiteSpace: "nowrap",
  transform: "translateY(-50%)",
  userSelect: "none",
});

export const dayColumn = styles.class("weekcalendarwidget-dayColumn", {
  position: "relative",
  borderLeft: "1px solid var(--token-border-subtle, var(--token-border-default))",
});

export const dayColumnToday = styles.class("weekcalendarwidget-dayColumnToday", {
  background: "color-mix(in srgb, var(--token-color-brand-500) 10%, transparent)",
});

export const dayColumnPast = styles.class("weekcalendarwidget-dayColumnPast", {
  opacity: "0.6",
});

export const hourLine = styles.class("weekcalendarwidget-hourLine", {
  position: "absolute",
  left: "0",
  right: "0",
  height: "1px",
  background: "var(--token-border-subtle, var(--token-border-default))",
  pointerEvents: "none",
});

export const halfHourLine = styles.class("weekcalendarwidget-halfHourLine", {
  position: "absolute",
  left: "0",
  right: "0",
  height: "1px",
  background:
    "color-mix(\n    in srgb,\n    var(--token-border-subtle, var(--token-border-default)) 45%,\n    transparent\n  )",
  pointerEvents: "none",
});

export const event = styles.class("weekcalendarwidget-event", {
  position: "absolute",
  borderRadius: "3px",
  padding: "2px 4px",
  overflow: "hidden",
  cursor: "pointer",
  boxSizing: "border-box",
  borderLeft: "2px solid transparent",
  transition: "opacity 0.1s",
  "&:hover": {
    opacity: "0.9",
    zIndex: "3 !important",
  },
  "&:focus-visible": {
    outline: "2px solid var(--token-focus-ring)",
    outlineOffset: "1px",
  },
});

export const eventTitle = styles.class("weekcalendarwidget-eventTitle", {
  display: "block",
  fontSize: "10px",
  fontWeight: "600",
  color: "var(--token-text-inverse)",
  lineHeight: "1.3",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const eventTime = styles.class("weekcalendarwidget-eventTime", {
  display: "block",
  fontSize: "9px",
  color: "color-mix(in srgb, var(--token-text-inverse) 70%, transparent)",
  lineHeight: "1.2",
  marginTop: "1px",
  whiteSpace: "nowrap",
  overflow: "hidden",
});

export const currentTimeLine = styles.class("weekcalendarwidget-currentTimeLine", {
  position: "absolute",
  left: "48px",
  right: "0",
  height: "2px",
  background: "color-mix(in srgb, var(--token-status-danger-fg) 65%, transparent)",
  zIndex: "4",
  pointerEvents: "none",
});

export const currentTimeDot = styles.class("weekcalendarwidget-currentTimeDot", {
  position: "absolute",
  left: "-5px",
  top: "-4px",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "color-mix(in srgb, var(--token-status-danger-fg) 65%, transparent)",
});

export const timeGrid = styles.class("weekcalendarwidget-timeGrid", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem",
});

export const dayAddBtn = styles.class("weekcalendarwidget-dayAddBtn", {
  color: "var(--token-text-muted) !important",
  width: "14px !important",
  height: "14px !important",
  minWidth: "14px !important",
  minHeight: "14px !important",
  "&:hover": {
    color: "var(--token-color-brand-500) !important",
    background: "color-mix(in srgb, var(--token-color-brand-500) 15%, transparent) !important",
  },
});

export const emptyState = styles.class("weekcalendarwidget-emptyState", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  textAlign: "center",
  padding: "16px",
});
