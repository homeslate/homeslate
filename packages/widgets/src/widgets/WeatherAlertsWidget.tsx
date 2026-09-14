import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertTriangle, IconMapPin, IconRefresh } from "@tabler/icons-react";
import { WidgetDataStatus } from "../chrome/WidgetDataStatus";
import { useWeatherAlerts } from "../hooks/useWeatherAlerts";
import { searchLocations, type GeocodingResult } from "../services/weather";
import type { WidgetConfig, WidgetProps } from "../types";
import {
  formatAlertUntil,
  sortWeatherAlerts,
  WEATHER_ALERTS_COVERAGE_COPY,
  WEATHER_ALERTS_EMPTY_COPY,
  WEATHER_ALERTS_NEED_LOCATION_COPY,
  type WeatherAlertSeverity,
} from "./weatherAlerts";
import * as classes from "./WeatherAlertsWidget.styles";

export interface WeatherAlertsConfig extends WidgetConfig {
  location: string;
  latitude: number | null;
  longitude: number | null;
  maxAlerts: number;
  transparentBackground: boolean;
}

function severityClass(severity: WeatherAlertSeverity): string {
  switch (severity) {
    case "extreme":
    case "severe":
      return classes.severityDanger;
    case "moderate":
      return classes.severityWarning;
    case "minor":
      return classes.severityInfo;
    default:
      return classes.severityUnknown;
  }
}

function clampMaxAlerts(maxAlerts: number | undefined): number {
  return Math.min(15, Math.max(1, maxAlerts ?? 5));
}

export function WeatherAlertsWidget({ widget }: WidgetProps<WeatherAlertsConfig>) {
  const {
    location,
    latitude = null,
    longitude = null,
    maxAlerts,
    transparentBackground,
  } = widget.config;
  const { alerts, coverage, isLoading, error, lastUpdated, refresh } = useWeatherAlerts({
    latitude,
    longitude,
  });
  const containerClass = `${classes.container} ${transparentBackground ? classes.transparent : ""}`;
  const visible = sortWeatherAlerts(alerts).slice(0, clampMaxAlerts(maxAlerts));

  if (latitude === null || longitude === null) {
    return (
      <Box className={containerClass}>
        <div className={classes.empty}>
          <IconMapPin size={48} className={classes.emptyIcon} />
          <Text size="sm" c="dimmed">
            {WEATHER_ALERTS_NEED_LOCATION_COPY}
          </Text>
        </div>
      </Box>
    );
  }

  if ((isLoading || coverage === null) && lastUpdated === null && !error) {
    return (
      <Box className={containerClass}>
        <div className={classes.loading}>
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            Loading alerts...
          </Text>
        </div>
      </Box>
    );
  }

  if (error && lastUpdated === null) {
    return (
      <Box className={containerClass}>
        <div className={classes.error}>
          <Text size="sm" c="red">
            {error}
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={refresh}
          >
            Retry
          </Button>
        </div>
      </Box>
    );
  }

  return (
    <Box className={containerClass}>
      <div className={classes.header}>
        <Text className={classes.title}>
          <IconAlertTriangle size={18} />
          {location || "Weather Alerts"}
        </Text>
        {isLoading ? (
          <Loader size="xs" />
        ) : (
          error && (
            <Button
              variant="subtle"
              size="compact-xs"
              leftSection={<IconRefresh size={14} />}
              onClick={refresh}
            >
              Retry
            </Button>
          )
        )}
      </div>

      {coverage === "unavailable" ? (
        <Text size="sm" className={classes.quiet}>
          {WEATHER_ALERTS_COVERAGE_COPY}
        </Text>
      ) : coverage === "us" && visible.length === 0 ? (
        <Text size="sm" className={classes.quiet}>
          {WEATHER_ALERTS_EMPTY_COPY}
        </Text>
      ) : (
        <div className={classes.list}>
          {visible.map((alert) => {
            const until = alert.endsAt ? formatAlertUntil(alert.endsAt) : undefined;
            return (
              <Paper key={alert.id} className={classes.alert} p="sm">
                <Text size="sm" className={`${classes.event} ${severityClass(alert.severity)}`}>
                  {alert.event}
                </Text>
                <Text size="sm" className={classes.headline} lineClamp={2}>
                  {alert.headline}
                </Text>
                {until && (
                  <Text size="xs" className={classes.until}>
                    {until}
                  </Text>
                )}
              </Paper>
            );
          })}
        </div>
      )}

      {lastUpdated !== null && (
        <WidgetDataStatus
          widgetId={widget.id}
          lastUpdated={lastUpdated}
          error={error}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
}

export function WeatherAlertsWidgetSettings({
  widget,
  onConfigChange,
}: WidgetProps<WeatherAlertsConfig>) {
  const { location, maxAlerts, transparentBackground } = widget.config;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    searchLocations(debouncedQuery)
      .then((results) => {
        if (!cancelled) setSearchResults(results);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const selectLocation = (result: GeocodingResult) => {
    const locationString = [result.name, result.admin1, result.country].filter(Boolean).join(", ");
    onConfigChange({
      location: locationString,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Stack gap="md">
      <div>
        <TextInput
          label="Search Location"
          placeholder="Enter city name..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          rightSection={isSearching ? <Loader size="xs" /> : null}
        />

        {searchResults.length > 0 && (
          <Paper className={classes.searchResults} mt="xs" p="xs">
            <Stack gap={4}>
              {searchResults.map((result) => (
                <Button
                  key={result.id}
                  variant="subtle"
                  size="sm"
                  fullWidth
                  justify="flex-start"
                  onClick={() => selectLocation(result)}
                  className={classes.searchResult}
                >
                  <IconMapPin size={14} style={{ marginRight: 8 }} />
                  {result.name}
                  {result.admin1 && `, ${result.admin1}`}
                  {result.country && ` · ${result.country}`}
                </Button>
              ))}
            </Stack>
          </Paper>
        )}
      </div>

      {location && (
        <Paper p="sm" className={classes.currentLocation}>
          <Group gap="xs">
            <IconMapPin size={16} />
            <div>
              <Text size="xs" c="dimmed">
                Current Location
              </Text>
              <Text size="sm" fw={500}>
                {location}
              </Text>
            </div>
          </Group>
        </Paper>
      )}

      <NumberInput
        label="Max alerts"
        min={1}
        max={15}
        value={clampMaxAlerts(maxAlerts)}
        onChange={(value) =>
          onConfigChange({
            maxAlerts: typeof value === "number" ? clampMaxAlerts(value) : 5,
          })
        }
      />

      <Group justify="space-between">
        <Text size="sm">Transparent background</Text>
        <Switch
          checked={transparentBackground}
          onChange={(event) =>
            onConfigChange({ transparentBackground: event.currentTarget.checked })
          }
        />
      </Group>
    </Stack>
  );
}
