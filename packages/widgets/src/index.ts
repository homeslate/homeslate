import "./builtins"; // side-effect: register built-ins
export const WIDGETS_PACKAGE_NAME = "@homeslate/widgets";
export { registerWidget, getWidgetByType, getWidgetTypes, clearWidgetRegistry } from "./registry";
export type {
  WidgetConfig,
  WidgetDefinition,
  WidgetProps,
  WidgetRegistryEntry,
  TextAlign,
} from "./types";
export { GoogleRuntimeProvider, useGoogleRuntime, DEFAULT_GOOGLE_RUNTIME } from "./googleRuntime";
export type { GoogleRuntime } from "./googleRuntime";
export { HouseholdProvider, useHousehold } from "./household/HouseholdContext";
export { HouseholdEditor } from "./household/HouseholdEditor";
export { AlarmsProvider, useAlarms } from "./alarms/AlarmsContext";
export { AlarmListEditor } from "./alarms/AlarmListEditor";
export { ALARM_TONE_OPTIONS } from "./alarms/tones";
export { TimersProvider, useTimers } from "./timers/TimersContext";
export { coerceTimerPresets } from "./widgets/TimersWidget";
export type { DailyRoutineConfig } from "./widgets/DailyRoutineWidget";
export type { ChoresConfig } from "./widgets/ChoresWidget";
export type { GroceryConfig } from "./widgets/GroceryWidget";
export type { CountdownConfig } from "./widgets/CountdownWidget";
export type { AnnouncementConfig } from "./widgets/AnnouncementWidget";
export type { CommuteConfig } from "./widgets/CommuteWidget";
export type { WeatherAlertsConfig } from "./widgets/WeatherAlertsWidget";
export type { EmbedConfig } from "./widgets/EmbedWidget";
export type { ThermostatConfig } from "./widgets/ThermostatWidget";
export type { SensorsConfig } from "./widgets/SensorsWidget";
export type { ScenesConfig } from "./widgets/ScenesWidget";
export type { PresenceConfig } from "./widgets/PresenceWidget";
export { useThermostat, useClimateEntities } from "./hooks/useThermostat";
export type { UseThermostatResult, UseClimateEntitiesResult } from "./hooks/useThermostat";
export { useHomeAssistantTodo, useTodoEntities } from "./hooks/useHomeAssistantTodo";
export type {
  UseHomeAssistantTodoResult,
  UseTodoEntitiesResult,
} from "./hooks/useHomeAssistantTodo";
export {
  useEntities,
  useEntitiesAcross,
  useEntity,
  useEntityList,
  useHomeAssistantService,
} from "./hooks/useHomeAssistant";
export type {
  HomeAssistantServiceCaller,
  UseEntitiesAcrossResult,
  UseEntitiesResult,
  UseEntityListOptions,
  UseEntityListResult,
  UseEntityOptions,
  UseEntityResult,
} from "./hooks/useHomeAssistant";
export { useHomeAssistantWeather } from "./hooks/useHomeAssistantWeather";
export type { UseHomeAssistantWeatherResult } from "./hooks/useHomeAssistantWeather";
export { useHomeAssistantCalendar } from "./hooks/useHomeAssistantCalendar";
export type { UseHomeAssistantCalendarResult } from "./hooks/useHomeAssistantCalendar";
export type { ClockConfig } from "./widgets/ClockWidget";
export type { TodoItem, TodoConfig, TodoSource } from "./widgets/TodoWidget";
export type { HomeAssistantTodoItem, HomeAssistantTodoStatus } from "./widgets/homeAssistantTodo";
export type { Photo, UrlPhoto, StoredPhoto, PhotoConfig } from "./widgets/PhotoWidget";
export { loadStoredImage } from "./services/googlePhotos";
export { useGooglePhotos } from "./hooks/useGooglePhotos";
export type { PickerStatus, CurrentPhoto } from "./hooks/useGooglePhotos";
export type { WidgetHealthStatus } from "./chrome/WidgetDataStatus";
export {
  DISPLAY_GOOGLE_RECONNECT_MESSAGE,
  DISPLAY_OWNER_SIGN_IN_MESSAGE,
} from "./widgets/googleCalendarError";
export { displayCalendarUrl } from "./hooks/useDisplayCalendar";
export { UnknownWidget } from "./UnknownWidget";
export { OverlayPortalContext, useOverlayPortalContainer } from "./overlayPortal";
