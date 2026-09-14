import { styles } from "../typeStyles";

export const container = styles.class("weatherwidget-container", {
  height: "100%",
  minHeight: "0",
  overflow: "auto",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-4))",
  background:
    "linear-gradient(\n    135deg,\n    color-mix(in srgb, var(--var-ui-color-tone-warning-foreground) 10%, transparent) 0%,\n    color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 10%, transparent) 100%\n  )",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const header = styles.class("weatherwidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  marginBottom: "0",
  minWidth: "0",
  flexShrink: "0",
});

export const location = styles.class("weatherwidget-location", {
  fontWeight: "600",
  fontSize: "1rem",
  color: "var(--var-ui-color-tone-warning-foreground)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: "0",
});

export const current = styles.class("weatherwidget-current", {
  flex: "0 0 auto",
  minHeight: "0",
  minWidth: "0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  gap: "0.5rem",
});

export const mainTemp = styles.class("weatherwidget-mainTemp", {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  minWidth: "0",
});

export const temperature = styles.class("weatherwidget-temperature", {
  fontSize: "clamp(2rem, 5vw, 3rem)",
  fontWeight: "300",
  lineHeight: "1",
  background:
    "linear-gradient(\n    135deg,\n    var(--var-ui-color-tone-warning-foreground) 0%,\n    var(--var-ui-color-tone-accent-foreground) 100%\n  )",
  "-webkit-background-clip": "text",
  "-webkit-text-fill-color": "transparent",
  backgroundClip: "text",
});

export const condition = styles.class("weatherwidget-condition", {
  fontSize: "1rem",
  color: "var(--var-ui-color-text-secondary)",
});

export const transparent = styles.class("weatherwidget-transparent", {
  background: "transparent",
});

export const details = styles.class("weatherwidget-details", {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  minWidth: "0",
});

export const alignCenter = styles.class("weatherwidget-alignCenter", {
  textAlign: "center",
  [`& .${header}`]: {
    justifyContent: "center",
  },
  [`& .${current}`]: {
    alignItems: "center",
  },
  [`& .${mainTemp}`]: {
    alignItems: "center",
  },
  [`& .${details}`]: {
    justifyContent: "center",
  },
});

export const alignRight = styles.class("weatherwidget-alignRight", {
  textAlign: "right",
  [`& .${header}`]: {
    justifyContent: "flex-end",
  },
  [`& .${current}`]: {
    alignItems: "flex-end",
  },
  [`& .${mainTemp}`]: {
    alignItems: "flex-end",
  },
  [`& .${details}`]: {
    justifyContent: "flex-end",
  },
});

export const detailItem = styles.class("weatherwidget-detailItem", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  color: "var(--var-ui-color-text-secondary)",
});

export const hourlySection = styles.class("weatherwidget-hourlySection", {
  paddingTop: "1.25rem",
  borderTop: "1px solid var(--var-ui-color-border-default)",
  flexShrink: "0",
  minWidth: "0",
});

export const hourly = styles.class("weatherwidget-hourly", {
  display: "flex",
  gap: "0.35rem",
  overflowX: "auto",
  overflowY: "hidden",
  paddingBottom: "0.25rem",
  "-webkit-overflow-scrolling": "touch",
  scrollbarWidth: "thin",
});

export const forecastHour = styles.class("weatherwidget-forecastHour", {
  flex: "0 0 auto",
  minWidth: "3.25rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.2rem",
  padding: "0.4rem 0.35rem",
  background: "var(--var-ui-color-background-surface)",
  borderRadius: "var(--var-ui-radius-sm)",
});

export const forecast = styles.class("weatherwidget-forecast", {
  display: "flex",
  gap: "0.5rem",
  paddingTop: "1.25rem",
  borderTop: "1px solid var(--var-ui-color-border-default)",
  overflowX: "auto",
  flexShrink: "0",
});

export const forecastDay = styles.class("weatherwidget-forecastDay", {
  flex: "1",
  minWidth: "0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.35rem",
  padding: "0.6rem 0.5rem",
  background: "var(--var-ui-color-background-surface)",
  borderRadius: "var(--var-ui-radius-sm)",
});

export const forecastDayName = styles.class("weatherwidget-forecastDayName", {
  textAlign: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "100%",
});

export const forecastDayBody = styles.class("weatherwidget-forecastDayBody", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
});

export const forecastDayTemps = styles.class("weatherwidget-forecastDayTemps", {
  display: "flex",
  flexDirection: "row",
  alignItems: "baseline",
  gap: "0.2rem",
  whiteSpace: "nowrap",
});

export const iconSunny = styles.class("weatherwidget-iconSunny", {
  color: "var(--var-ui-color-tone-warning-foreground)",
});

export const iconMoon = styles.class("weatherwidget-iconMoon", {
  color: "var(--var-ui-color-tone-accent-foreground)",
});

export const iconCloudy = styles.class("weatherwidget-iconCloudy", {
  color: "var(--var-ui-color-text-secondary)",
});

export const iconRainy = styles.class("weatherwidget-iconRainy", {
  color: "var(--var-ui-color-tone-info-foreground, var(--var-ui-color-tone-accent-foreground))",
});

export const iconSnowy = styles.class("weatherwidget-iconSnowy", {
  color: "var(--var-ui-color-tone-info-foreground, var(--var-ui-color-tone-accent-foreground))",
});

export const iconStormy = styles.class("weatherwidget-iconStormy", {
  color: "var(--var-ui-color-tone-accent-foreground)",
});

export const empty = styles.class("weatherwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.5rem",
});

export const emptyIcon = styles.class("weatherwidget-emptyIcon", {
  color: "var(--var-ui-color-tone-warning-foreground)",
  opacity: "0.5",
});

export const loading = styles.class("weatherwidget-loading", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const error = styles.class("weatherwidget-error", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const searchResults = styles.class("weatherwidget-searchResults", {
  background: "var(--var-ui-color-background-popover, var(--var-ui-color-background-surface))",
  border: "1px solid var(--var-ui-color-border-default)",
  maxHeight: "200px",
  overflowY: "auto",
});

export const searchResult = styles.class("weatherwidget-searchResult", {
  color: "var(--var-ui-color-text-secondary)",
  fontWeight: "normal",
  "&:hover": {
    color: "var(--var-ui-color-text-primary)",
    background: "color-mix(in srgb, var(--var-ui-color-tone-accent-foreground) 12%, transparent)",
  },
});

export const currentLocation = styles.class("weatherwidget-currentLocation", {
  background: "var(--var-ui-color-tone-warning-subtleBackground)",
  border: "1px solid var(--var-ui-color-tone-warning-border)",
});

export const aqiBadge = styles.class("weatherwidget-aqiBadge", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.25rem 0.6rem",
  border: "1px solid",
  borderRadius: "999px",
  width: "fit-content",
});

export const aqiDot = styles.class("weatherwidget-aqiDot", {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  flexShrink: "0",
});

export const compact = styles.class("weatherwidget-compact", {
  padding: "0.5rem 0.75rem",
  justifyContent: "center",
  overflow: "hidden",
  [`& .${header}`]: {
    marginBottom: "0",
    flexShrink: "0",
  },
  [`& .${location}`]: {
    fontSize: "0.75rem",
    lineHeight: "1.2",
  },
  [`& .${current}`]: {
    flex: "0 1 auto",
    justifyContent: "flex-start",
  },
  [`& .${mainTemp}`]: {
    gap: "0.5rem",
    alignItems: "center",
  },
  [`& .${temperature}`]: {
    fontSize: "1.5rem",
    lineHeight: "1.1",
  },
  [`& .${condition}`]: {
    fontSize: "0.75rem",
    marginTop: "0.125rem",
  },
});

export const alignLeft = styles.class("weatherwidget-alignLeft", {
  textAlign: "left",
  [`& .${header}`]: {
    alignItems: "flex-start",
  },
  [`& .${current}`]: {
    alignItems: "flex-start",
  },
  [`& .${mainTemp}`]: {
    alignItems: "flex-start",
  },
  [`& .${details}`]: {
    justifyContent: "flex-start",
  },
});
