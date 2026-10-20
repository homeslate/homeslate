import { useEffect } from "react";
import { Text } from "@var-ui/react";

export type WidgetHealthStatus = "idle" | "loading" | "ok" | "stale" | "error";

interface WidgetDataStatusProps {
  widgetId?: string;
  lastUpdated: number | null;
  error?: string | null;
  isLoading?: boolean;
  isStale?: boolean;
  align?: "left" | "center" | "right";
}

export function widgetDataStatus(input: {
  lastUpdated: number | null;
  error?: string | null;
  isLoading?: boolean;
  isStale?: boolean;
}): WidgetHealthStatus {
  if ((input.isStale || input.error) && input.lastUpdated) return "stale";
  if (input.error) return "error";
  if (input.isLoading) return "loading";
  if (input.lastUpdated) return "ok";
  return "idle";
}

function formatLastUpdated(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAge(timestamp: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  return `${minutes}m ago`;
}

export function WidgetDataStatus({
  widgetId,
  lastUpdated,
  error,
  isLoading = false,
  isStale = false,
  align = "left",
}: WidgetDataStatusProps) {
  const status = widgetDataStatus({ lastUpdated, error, isLoading, isStale });

  useEffect(() => {
    if (!widgetId || typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("widget-health-change", {
        detail: { widgetId, status },
      }),
    );
  }, [widgetId, status]);

  if (!lastUpdated) return null;

  const label = error
    ? `Last updated ${formatLastUpdated(lastUpdated)} (showing cached data)`
    : isStale
      ? `Updated ${formatAge(lastUpdated)} (refreshing…)`
      : `Updated ${formatLastUpdated(lastUpdated)}`;

  return (
    <Text size="xs" tone="secondary" style={{ textAlign: align }}>
      {label}
    </Text>
  );
}
