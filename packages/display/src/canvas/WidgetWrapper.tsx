import { useEffect, useState, Suspense } from "react";
import {
  Button,
  Center,
  Dialog,
  Divider,
  HStack,
  IconButton,
  SimpleTooltip,
  Spinner,
  Stack,
  Surface,
  Switch,
  Text,
} from "@var-ui/react";
import {
  IconSettings,
  IconTrash,
  IconGripVertical,
  IconArrowsMaximize,
  IconCircleFilled,
} from "@tabler/icons-react";
import type { WidgetInstance } from "@homeslate/schema";
import {
  getWidgetByType,
  UnknownWidget,
  type WidgetConfig,
  type WidgetDefinition,
  type WidgetHealthStatus,
} from "@homeslate/widgets";
import * as classes from "./WidgetWrapper.styles";

export type WidgetRegistryApi = {
  getWidgetByType: (type: string) => import("@homeslate/widgets").WidgetRegistryEntry | undefined;
  getWidgetTypes: () => import("@homeslate/widgets").WidgetRegistryEntry[];
};

function WidgetLoader() {
  return (
    <Center style={{ width: "100%", height: "100%" }}>
      <Spinner size="sm" label="Loading widget" />
    </Center>
  );
}

interface WidgetWrapperProps {
  widget: WidgetInstance;
  isEditing: boolean;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  widgetRegistry?: WidgetRegistryApi;
  portalContainer?: Element;
}

export function WidgetWrapper({
  widget,
  isEditing,
  onConfigChange,
  onRemove,
  widgetRegistry,
  portalContainer,
}: WidgetWrapperProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<WidgetHealthStatus>("idle");
  const widgetDef = widget as WidgetDefinition;

  useEffect(() => {
    const onHealthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ widgetId: string; status: WidgetHealthStatus }>;
      if (customEvent.detail?.widgetId === widget.id) {
        setHealthStatus(customEvent.detail.status);
      }
    };

    window.addEventListener("widget-health-change", onHealthChange);
    return () => window.removeEventListener("widget-health-change", onHealthChange);
  }, [widget.id]);

  const lookup = widgetRegistry?.getWidgetByType ?? getWidgetByType;
  const widgetEntry = lookup(widget.type);

  if (!widgetEntry) {
    return (
      <UnknownWidget widget={widgetDef} isEditing={isEditing} onConfigChange={onConfigChange} />
    );
  }

  const WidgetComponent = widgetEntry.component;
  const SettingsComponent = widgetEntry.settingsComponent;
  const isTransparent = widget.config.transparentBackground === true;

  const healthLabel: Record<WidgetHealthStatus, string> = {
    idle: "No recent data yet",
    loading: "Loading data",
    ok: "Healthy",
    stale: "Using cached data",
    error: "Fetch error",
  };

  const healthClass: Record<WidgetHealthStatus, string> = {
    idle: classes.healthIdle,
    loading: classes.healthLoading,
    ok: classes.healthOk,
    stale: classes.healthStale,
    error: classes.healthError,
  };

  return (
    <>
      <Surface
        className={`${classes.wrapper} ${isTransparent ? classes.transparent : ""} ${isEditing ? classes.editing : ""}`}
        data-widget-id={widget.id}
      >
        {isEditing && (
          <>
            <div className={classes.toolbar}>
              <HStack gap="xs" className={classes.toolbarLeft}>
                <div className={`${classes.dragHandle} widget-drag-handle`}>
                  <IconGripVertical size={16} />
                </div>
                <Text size="xs" tone="secondary" className={classes.widgetName}>
                  {widgetEntry.name}
                </Text>
              </HStack>
              <HStack gap="xs" className={classes.toolbarRight}>
                <div className={classes.sizeIndicator} title="Drag edges to resize">
                  <IconArrowsMaximize size={12} />
                  <Text size="xs">
                    {widget.layout.w}×{widget.layout.h}
                  </Text>
                </div>
                <div
                  className={`${classes.healthIndicator} ${healthClass[healthStatus]}`}
                  title={`Data status: ${healthLabel[healthStatus]}`}
                >
                  <IconCircleFilled size={8} />
                </div>
                {SettingsComponent && (
                  <SimpleTooltip
                    content="Settings"
                    placement="bottom"
                    portalContainer={portalContainer}
                  >
                    <IconButton
                      name="wrench"
                      icon={<IconSettings size={16} />}
                      appearance="ghost"
                      size="sm"
                      aria-label={`${widgetEntry.name} settings`}
                      onPress={() => setSettingsOpen(true)}
                      className={classes.toolbarButton}
                    />
                  </SimpleTooltip>
                )}
                <SimpleTooltip
                  content="Remove widget"
                  placement="bottom"
                  portalContainer={portalContainer}
                >
                  <IconButton
                    name="close"
                    icon={<IconTrash size={16} />}
                    appearance="ghost"
                    tone="danger"
                    size="sm"
                    aria-label={`Remove ${widgetEntry.name}`}
                    onPress={() => onRemove?.()}
                    className={classes.toolbarButton}
                  />
                </SimpleTooltip>
              </HStack>
            </div>
            <div className={classes.resizeHint}>Drag edges to resize</div>
          </>
        )}
        <div className={classes.content}>
          <Suspense fallback={<WidgetLoader />}>
            <WidgetComponent
              widget={widgetDef}
              isEditing={isEditing}
              onConfigChange={onConfigChange}
            />
          </Suspense>
        </div>
      </Surface>

      {SettingsComponent && (
        <Dialog.Root
          isOpen={settingsOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSettingsOpen(false);
          }}
          portalContainer={portalContainer}
        >
          <Dialog.Backdrop>
            <Dialog.Popup>
              <Dialog.Title>{widgetEntry.name} Settings</Dialog.Title>
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerMove={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <Stack gap="md">
                  <HStack gap="sm" align="center">
                    <Text size="xs" weight="semibold" tone="secondary">
                      Display
                    </Text>
                    <Divider />
                  </HStack>
                  <HStack justify="between">
                    <Text size="sm">Transparent Background</Text>
                    <Switch
                      aria-label="Transparent Background"
                      isSelected={widget.config.transparentBackground === true}
                      onChange={(selected) => onConfigChange({ transparentBackground: selected })}
                    />
                  </HStack>
                  <HStack gap="sm" align="center">
                    <Text size="xs" weight="semibold" tone="secondary">
                      Settings
                    </Text>
                    <Divider />
                  </HStack>
                  <Suspense fallback={<WidgetLoader />}>
                    <SettingsComponent
                      widget={widgetDef}
                      isEditing={true}
                      onConfigChange={onConfigChange}
                    />
                  </Suspense>
                  <Button onPress={() => setSettingsOpen(false)}>Done</Button>
                </Stack>
              </div>
            </Dialog.Popup>
          </Dialog.Backdrop>
        </Dialog.Root>
      )}
    </>
  );
}
