import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCar, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import { WidgetDataStatus } from "../chrome/WidgetDataStatus";
import { useCommute } from "../hooks/useCommute";
import type { WidgetConfig, WidgetProps } from "../types";
import {
  COMMUTE_EMPTY_COPY,
  COMMUTE_MISSING_KEY_COPY,
  formatCommuteDistance,
  formatCommuteDuration,
  type CommuteUnits,
} from "./commute";
import classes from "./CommuteWidget.module.css";

const EMPTY_ROUTES: CommuteRoute[] = [];

export interface CommuteRoute {
  id: string;
  label: string;
  origin: string;
  destination: string;
}

export interface CommuteConfig extends WidgetConfig {
  routes: CommuteRoute[];
  units: CommuteUnits;
  transparentBackground: boolean;
}

export function CommuteWidget({ widget }: WidgetProps<CommuteConfig>) {
  const routes = widget.config.routes ?? EMPTY_ROUTES;
  const units = widget.config.units ?? "imperial";
  const transparentBackground = widget.config.transparentBackground;
  const { results, isLoading, lastUpdated, refresh } = useCommute(routes, units);
  const resultList = [...results.values()];
  const hasMissingKey = resultList.some(({ status }) => status === 501);
  const hasEstimate = resultList.some(({ estimate }) => estimate);
  const fetchError =
    resultList.find(({ error, status }) => error && status !== 501)?.error ?? null;
  const failedWithoutEstimate = routes.filter((route) => {
    const result = results.get(route.id);
    return Boolean(result?.error && !result.estimate && result.status !== 501);
  });
  const wholeWidgetError =
    !hasMissingKey &&
    !hasEstimate &&
    !isLoading &&
    routes.length > 0 &&
    failedWithoutEstimate.length === routes.length
      ? (results.get(failedWithoutEstimate[0].id)?.error ?? "Failed to fetch commute")
      : null;
  const containerClass = `${classes.container} ${transparentBackground ? classes.transparent : ""}`;

  if (routes.length === 0) {
    return (
      <Box className={containerClass}>
        <div className={classes.empty}>
          <IconCar size={40} className={classes.emptyIcon} />
          <Text size="sm" c="dimmed">
            {COMMUTE_EMPTY_COPY}
          </Text>
        </div>
      </Box>
    );
  }

  return (
    <Box className={containerClass}>
      <div className={classes.header}>
        <Text className={classes.title}>
          <IconCar size={18} />
          Commute
        </Text>
        {isLoading && <Loader size="xs" />}
      </div>

      {hasMissingKey && (
        <Paper className={classes.settingsNotice} p="sm">
          <Text size="sm">{COMMUTE_MISSING_KEY_COPY}</Text>
        </Paper>
      )}

      {wholeWidgetError ? (
        <div className={classes.error}>
          <Text size="sm" c="red">
            {wholeWidgetError}
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
      ) : (
        <div className={classes.list}>
          {routes.map((route) => {
            const result = results.get(route.id);
            return (
              <Paper key={route.id} className={classes.route} p="sm">
                <Text size="sm" fw={600} className={classes.label}>
                  {route.label}
                </Text>
                {result?.estimate && (
                  <div className={classes.measurements}>
                    <Text className={classes.duration}>
                      {formatCommuteDuration(result.estimate.durationSeconds)}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {formatCommuteDistance(result.estimate.distanceMeters, units)}
                    </Text>
                  </div>
                )}
                {result?.error && !result.estimate && result.status !== 501 && (
                  <Text size="xs" c="red">
                    {result.error}
                  </Text>
                )}
                {!result && <Loader size="xs" />}
              </Paper>
            );
          })}
        </div>
      )}

      {lastUpdated !== null && (
        <WidgetDataStatus
          widgetId={widget.id}
          lastUpdated={lastUpdated}
          error={hasMissingKey ? null : fetchError}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
}

export function CommuteWidgetSettings({
  widget,
  onConfigChange,
}: WidgetProps<CommuteConfig>) {
  const routes = widget.config.routes ?? EMPTY_ROUTES;
  const units = widget.config.units ?? "imperial";
  const transparentBackground = widget.config.transparentBackground;

  const updateRoute = (id: string, patch: Partial<CommuteRoute>) => {
    onConfigChange({
      routes: routes.map((route) => (route.id === id ? { ...route, ...patch } : route)),
    });
  };

  const removeRoute = (id: string) => {
    onConfigChange({ routes: routes.filter((route) => route.id !== id) });
  };

  const addRoute = () => {
    if (routes.length >= 4) return;
    onConfigChange({
      routes: [...routes, { id: uuidv4(), label: "", origin: "", destination: "" }],
    });
  };

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Origin and destination can be a street address or lat,lon.
      </Text>

      {routes.map((route, index) => (
        <Paper key={route.id} p="sm" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Route {index + 1}
              </Text>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                leftSection={<IconTrash size={14} />}
                onClick={() => removeRoute(route.id)}
              >
                Remove
              </Button>
            </Group>
            <TextInput
              label="Label"
              value={route.label}
              onChange={(event) => updateRoute(route.id, { label: event.currentTarget.value })}
            />
            <TextInput
              label="Origin"
              value={route.origin}
              onChange={(event) => updateRoute(route.id, { origin: event.currentTarget.value })}
            />
            <TextInput
              label="Destination"
              value={route.destination}
              onChange={(event) =>
                updateRoute(route.id, { destination: event.currentTarget.value })
              }
            />
          </Stack>
        </Paper>
      ))}

      <Button
        variant="light"
        leftSection={<IconPlus size={14} />}
        onClick={addRoute}
        disabled={routes.length >= 4}
      >
        Add route
      </Button>

      <Select
        label="Units"
        data={[
          { value: "imperial", label: "Imperial (miles)" },
          { value: "metric", label: "Metric (kilometers)" },
        ]}
        value={units}
        onChange={(value) =>
          onConfigChange({ units: (value as CommuteUnits | null) ?? "imperial" })
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
