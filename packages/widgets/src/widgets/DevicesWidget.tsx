import { Button, HStack, NumberInput, Stack, Switch, Text } from "@var-ui/react";
import { IconBulb, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import type { WidgetConfig, WidgetProps } from "../types";
import { WidgetDataStatus } from "../chrome/WidgetDataStatus";
import { useEntityList, useHomeAssistantService } from "../hooks/useHomeAssistant";
import { AddEntitySelect, SelectedEntityRow } from "./AddEntitySelect";
import {
  DEVICES_EMPTY_COPY,
  DEVICES_MISSING_CONFIG_COPY,
  DEVICE_DOMAINS,
  applyDeviceOverride,
  deviceService,
  deviceStatusLabel,
  getDevicesSizeTier,
  type DeviceDomain,
  type DeviceOverride,
  type HomeAssistantDevice,
} from "./homeAssistantDevice";
import * as classes from "./DevicesWidget.styles";

export interface DevicesConfig extends WidgetConfig {
  domains: DeviceDomain[];
  entityIds: string[];
  showBrightness: boolean;
  columns: number;
  transparentBackground: boolean;
}

const DOMAIN_LABELS: Record<DeviceDomain, string> = {
  light: "Lights",
  switch: "Switches & outlets",
  input_boolean: "Input booleans",
  fan: "Fans",
};

type DeviceOverrideMap = Record<string, DeviceOverride>;

export function DevicesWidget({ widget, isEditing }: WidgetProps<DevicesConfig>) {
  const {
    entityIds = [],
    showBrightness = true,
    columns = 2,
    transparentBackground = false,
  } = widget.config;
  const ids = entityIds.filter(Boolean);
  const { entities, isLoading, error, status, lastUpdated, refresh } =
    useEntityList<HomeAssistantDevice>(ids, { fetchFailureCopy: DEVICES_MISSING_CONFIG_COPY });
  const callService = useHomeAssistantService(DEVICES_MISSING_CONFIG_COPY);
  const [overrides, setOverrides] = useState<DeviceOverrideMap>({});
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);

  const byId = new Map(entities.map((entity) => [entity.entityId, entity]));
  const merged = (entityId: string): HomeAssistantDevice | null => {
    const base = byId.get(entityId);
    if (!base) return null;
    return applyDeviceOverride(base, overrides[entityId]);
  };

  const tier = getDevicesSizeTier(widget.layout.w, widget.layout.h);
  const columnCount = Math.min(4, Math.max(1, Math.round(columns)));
  const showBrightnessControls = tier === "full" && showBrightness;
  const onCount = ids.filter((entityId) => merged(entityId)?.isOn).length;

  const clearOverride = (entityId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[entityId];
      return next;
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[entityId];
      return next;
    });
  };

  const toggle = async (device: HomeAssistantDevice) => {
    if (!device.available || pendingId === device.entityId) return;
    const nextOn = !device.isOn;
    setControlError(null);
    setPendingId(device.entityId);
    setOverrides((prev) => ({
      ...prev,
      [device.entityId]: { ...prev[device.entityId], isOn: nextOn },
    }));
    try {
      await callService(device.domain, deviceService(device.domain, nextOn), device.entityId, {});
    } catch (err) {
      setControlError(err instanceof Error ? err.message : DEVICES_MISSING_CONFIG_COPY);
    } finally {
      await refresh();
      clearOverride(device.entityId);
      setPendingId(null);
    }
  };

  const commitBrightness = async (device: HomeAssistantDevice, value: number) => {
    if (!device.available || pendingId === device.entityId) return;
    const pct = Math.min(100, Math.max(1, Math.round(value)));
    setControlError(null);
    setPendingId(device.entityId);
    setOverrides((prev) => ({
      ...prev,
      [device.entityId]: { ...prev[device.entityId], isOn: true, brightnessPct: pct },
    }));
    try {
      await callService("light", "turn_on", device.entityId, { brightness_pct: pct });
    } catch (err) {
      setControlError(err instanceof Error ? err.message : DEVICES_MISSING_CONFIG_COPY);
    } finally {
      await refresh();
      clearOverride(device.entityId);
      setPendingId(null);
    }
  };

  if (ids.length === 0) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.empty}>
          <IconBulb size={32} className={classes.emptyIcon} />
          <Text className={classes.emptyTitle}>{DEVICES_EMPTY_COPY}</Text>
        </div>
      </div>
    );
  }

  if (status === 501) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.empty}>
          <Text className={classes.emptyTitle}>Home Assistant isn't connected</Text>
          <Text size="sm" tone="secondary">
            {error ?? DEVICES_MISSING_CONFIG_COPY}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      {(error || controlError) && (
        <div className={classes.errorBox}>
          <Text size="sm" tone="danger">
            {controlError ?? error}
          </Text>
          <Button appearance="subtle" size="sm" onPress={refresh} isDisabled={isLoading}>
            <IconRefresh size={14} />
            Retry
          </Button>
        </div>
      )}

      {tier !== "compact" && (
        <div className={classes.header}>
          <Text size="sm" tone="secondary">
            {onCount} on
          </Text>
          {!isEditing && (
            <WidgetDataStatus
              widgetId={widget.id}
              lastUpdated={lastUpdated}
              error={error}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      <div
        className={classes.grid}
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {ids.map((entityId) => {
          const device = merged(entityId);
          if (!device) {
            return (
              <div key={entityId} className={classes.card}>
                <Text size="sm" tone="secondary">
                  Loading…
                </Text>
              </div>
            );
          }
          const pending = pendingId === device.entityId;
          const brightnessValue = drafts[entityId] ?? device.brightnessPct ?? 100;
          return (
            <div
              key={entityId}
              className={`${classes.card} ${device.isOn ? classes.cardOn : ""} ${
                pending ? classes.cardPending : ""
              } ${device.available ? "" : classes.cardUnavailable}`}
            >
              <button
                type="button"
                className={classes.toggleButton}
                onClick={() => void toggle(device)}
                disabled={!device.available || pending}
                aria-pressed={device.isOn}
                aria-label={`Toggle ${device.name}`}
              >
                <span className={classes.deviceDetails}>
                  <span className={classes.deviceName}>{device.name}</span>
                  <span className={classes.deviceState}>{deviceStatusLabel(device)}</span>
                </span>
                {device.domain === "fan" && device.percentage !== null && (
                  <span className={classes.fanChip}>{Math.round(device.percentage)}%</span>
                )}
                <span className={`${classes.pill} ${device.isOn ? classes.pillOn : ""}`}>
                  <span
                    className={`${classes.pillKnob} ${device.isOn ? classes.pillKnobOn : ""}`}
                  />
                </span>
              </button>
              {showBrightnessControls &&
                device.domain === "light" &&
                device.isOn &&
                device.available && (
                  <div className={classes.brightnessRow}>
                    <input
                      type="range"
                      className={classes.range}
                      min={1}
                      max={100}
                      step={1}
                      value={brightnessValue}
                      aria-label={`Brightness for ${device.name}`}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [entityId]: Number(event.target.value),
                        }))
                      }
                      onPointerUp={() => void commitBrightness(device, brightnessValue)}
                      onKeyUp={() => void commitBrightness(device, brightnessValue)}
                    />
                    <Text size="xs" tone="secondary">
                      {Math.round(brightnessValue)}%
                    </Text>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {tier === "compact" && !isEditing && (
        <WidgetDataStatus
          widgetId={widget.id}
          lastUpdated={lastUpdated}
          error={error}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export function DevicesWidgetSettings({ widget, onConfigChange }: WidgetProps<DevicesConfig>) {
  const {
    domains = [...DEVICE_DOMAINS],
    entityIds = [],
    showBrightness = true,
    columns = 2,
    transparentBackground = false,
  } = widget.config;

  const toggleDomain = (domain: DeviceDomain) => {
    const next = domains.includes(domain)
      ? domains.filter((value) => value !== domain)
      : [...domains, domain];
    onConfigChange({ domains: next });
  };

  return (
    <Stack gap="md">
      <Text size="sm">Device types</Text>
      {DEVICE_DOMAINS.map((domain) => (
        <HStack key={domain} justify="between" align="center">
          <Text size="sm">{DOMAIN_LABELS[domain]}</Text>
          <Switch
            aria-label={DOMAIN_LABELS[domain]}
            isSelected={domains.includes(domain)}
            onChange={() => toggleDomain(domain)}
          />
        </HStack>
      ))}

      <AddEntitySelect
        domains={domains}
        value={entityIds}
        onAdd={(entityId) => onConfigChange({ entityIds: [...entityIds, entityId] })}
        failureCopy={DEVICES_MISSING_CONFIG_COPY}
        label="Add device"
      />
      {entityIds.map((entityId) => (
        <SelectedEntityRow
          key={entityId}
          entityId={entityId}
          onRemove={() =>
            onConfigChange({ entityIds: entityIds.filter((value) => value !== entityId) })
          }
        />
      ))}

      <NumberInput
        label="Columns"
        minValue={1}
        maxValue={4}
        value={columns}
        onChange={(value) => {
          const next = Number(value);
          onConfigChange({ columns: Number.isFinite(next) ? Math.min(4, Math.max(1, next)) : 2 });
        }}
      />
      <HStack gap="sm" align="center" justify="between">
        <Text size="sm">Show brightness slider (when large)</Text>
        <Switch
          aria-label="Show brightness slider"
          isSelected={showBrightness}
          onChange={(value) => onConfigChange({ showBrightness: value })}
        />
      </HStack>
      <HStack gap="sm" align="center" justify="between">
        <Text size="sm">Transparent background</Text>
        <Switch
          aria-label="Transparent background"
          isSelected={transparentBackground}
          onChange={(value) => onConfigChange({ transparentBackground: value })}
        />
      </HStack>
    </Stack>
  );
}
