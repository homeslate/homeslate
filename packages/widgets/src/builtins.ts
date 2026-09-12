import { lazy } from "react";
import { registerWidget } from "./registry";
import type { WidgetRegistryEntry } from "./types";
import type { ClockConfig } from "./widgets/ClockWidget";
import type { CalendarConfig } from "./widgets/CalendarWidget";
import type { GoogleCalendarConfig } from "./widgets/GoogleCalendarWidget";
import type { GoogleCalendarMonthConfig } from "./widgets/GoogleCalendarMonthWidget";
import type { GoogleCalendarDayConfig } from "./widgets/GoogleCalendarDayWidget";
import type { PhotoConfig } from "./widgets/PhotoWidget";
import type { GooglePhotoCollageConfig } from "./widgets/GooglePhotoCollageWidget";
import type { WeatherConfig } from "./widgets/WeatherWidget";
import type { NewsConfig } from "./widgets/NewsWidget";
import type { StocksConfig } from "./widgets/StocksWidget";
import type { WeekCalendarConfig } from "./widgets/WeekCalendarWidget";
import type { TodoConfig } from "./widgets/TodoWidget";
import type { SportsConfig } from "./widgets/SportsWidget";
import type { AlarmsConfig } from "./widgets/AlarmsWidget";
import type { TimersConfig } from "./widgets/TimersWidget";
import type { DailyRoutineConfig } from "./widgets/DailyRoutineWidget";
import type { ChoresConfig } from "./widgets/ChoresWidget";
import type { GroceryConfig } from "./widgets/GroceryWidget";
import type { CountdownConfig } from "./widgets/CountdownWidget";
import type { AnnouncementConfig } from "./widgets/AnnouncementWidget";
import type { CommuteConfig } from "./widgets/CommuteWidget";
import type { WeatherAlertsConfig } from "./widgets/WeatherAlertsWidget";
import type { EmbedConfig } from "./widgets/EmbedWidget";
import { DEFAULT_ROUTINE_STEPS } from "./widgets/dailyRoutine";
import {
  alarmsConfigSchema,
  announcementConfigSchema,
  calendarConfigSchema,
  choresConfigSchema,
  clockConfigSchema,
  commuteConfigSchema,
  countdownConfigSchema,
  embedConfigSchema,
  weatherAlertsConfigSchema,
  dailyRoutineConfigSchema,
  groceryConfigSchema,
  googleCalendarConfigSchema,
  googleCalendarDayConfigSchema,
  googleCalendarMonthConfigSchema,
  googlePhotoCollageConfigSchema,
  newsConfigSchema,
  photoConfigSchema,
  sportsConfigSchema,
  stocksConfigSchema,
  timersConfigSchema,
  todoConfigSchema,
  weatherConfigSchema,
  weekCalendarConfigSchema,
} from "./configSchemas";
import {
  IconClock,
  IconCalendar,
  IconCalendarMonth,
  IconCalendarEvent,
  IconPhoto,
  IconCloudRain,
  IconNews,
  IconChartLine,
  IconBrandGoogle,
  IconCalendarWeek,
  IconLayoutGrid,
  IconCheckbox,
  IconTrophy,
  IconAlarm,
  IconHourglass,
  IconListCheck,
  IconShoppingCart,
  IconHourglassLow,
  IconSpeakerphone,
  IconChecklist,
  IconCar,
  IconAlertTriangle,
  IconAppWindow,
} from "@tabler/icons-react";

// Lazy-load widget components so each widget's bundle is only fetched when
// that widget type is first rendered on screen.
const ClockWidget = lazy(() =>
  import("./widgets/ClockWidget").then((m) => ({ default: m.ClockWidget })),
);
const ClockWidgetSettings = lazy(() =>
  import("./widgets/ClockWidget").then((m) => ({ default: m.ClockWidgetSettings })),
);

const CalendarWidget = lazy(() =>
  import("./widgets/CalendarWidget").then((m) => ({ default: m.CalendarWidget })),
);
const CalendarWidgetSettings = lazy(() =>
  import("./widgets/CalendarWidget").then((m) => ({ default: m.CalendarWidgetSettings })),
);

const GoogleCalendarWidget = lazy(() =>
  import("./widgets/GoogleCalendarWidget").then((m) => ({ default: m.GoogleCalendarWidget })),
);
const GoogleCalendarWidgetSettings = lazy(() =>
  import("./widgets/GoogleCalendarWidget").then((m) => ({
    default: m.GoogleCalendarWidgetSettings,
  })),
);

const GoogleCalendarMonthWidget = lazy(() =>
  import("./widgets/GoogleCalendarMonthWidget").then((m) => ({
    default: m.GoogleCalendarMonthWidget,
  })),
);
const GoogleCalendarMonthWidgetSettings = lazy(() =>
  import("./widgets/GoogleCalendarMonthWidget").then((m) => ({
    default: m.GoogleCalendarMonthWidgetSettings,
  })),
);

const GoogleCalendarDayWidget = lazy(() =>
  import("./widgets/GoogleCalendarDayWidget").then((m) => ({ default: m.GoogleCalendarDayWidget })),
);
const GoogleCalendarDayWidgetSettings = lazy(() =>
  import("./widgets/GoogleCalendarDayWidget").then((m) => ({
    default: m.GoogleCalendarDayWidgetSettings,
  })),
);

const PhotoWidget = lazy(() =>
  import("./widgets/PhotoWidget").then((m) => ({ default: m.PhotoWidget })),
);
const PhotoWidgetSettings = lazy(() =>
  import("./widgets/PhotoWidget").then((m) => ({ default: m.PhotoWidgetSettings })),
);

const GooglePhotoCollageWidget = lazy(() =>
  import("./widgets/GooglePhotoCollageWidget").then((m) => ({
    default: m.GooglePhotoCollageWidget,
  })),
);
const GooglePhotoCollageWidgetSettings = lazy(() =>
  import("./widgets/GooglePhotoCollageWidget").then((m) => ({
    default: m.GooglePhotoCollageWidgetSettings,
  })),
);

const WeatherWidget = lazy(() =>
  import("./widgets/WeatherWidget").then((m) => ({ default: m.WeatherWidget })),
);
const WeatherWidgetSettings = lazy(() =>
  import("./widgets/WeatherWidget").then((m) => ({ default: m.WeatherWidgetSettings })),
);

const NewsWidget = lazy(() =>
  import("./widgets/NewsWidget").then((m) => ({ default: m.NewsWidget })),
);
const NewsWidgetSettings = lazy(() =>
  import("./widgets/NewsWidget").then((m) => ({ default: m.NewsWidgetSettings })),
);

const StocksWidget = lazy(() =>
  import("./widgets/StocksWidget").then((m) => ({ default: m.StocksWidget })),
);
const StocksWidgetSettings = lazy(() =>
  import("./widgets/StocksWidget").then((m) => ({ default: m.StocksWidgetSettings })),
);

const WeekCalendarWidget = lazy(() =>
  import("./widgets/WeekCalendarWidget").then((m) => ({ default: m.WeekCalendarWidget })),
);
const WeekCalendarWidgetSettings = lazy(() =>
  import("./widgets/WeekCalendarWidget").then((m) => ({ default: m.WeekCalendarWidgetSettings })),
);

const TodoWidget = lazy(() =>
  import("./widgets/TodoWidget").then((m) => ({ default: m.TodoWidget })),
);
const TodoWidgetSettings = lazy(() =>
  import("./widgets/TodoWidget").then((m) => ({ default: m.TodoWidgetSettings })),
);

const SportsWidget = lazy(() =>
  import("./widgets/SportsWidget").then((m) => ({ default: m.SportsWidget })),
);
const SportsWidgetSettings = lazy(() =>
  import("./widgets/SportsWidget").then((m) => ({ default: m.SportsWidgetSettings })),
);

const AlarmsWidget = lazy(() =>
  import("./widgets/AlarmsWidget").then((m) => ({ default: m.AlarmsWidget })),
);
const AlarmsWidgetSettings = lazy(() =>
  import("./widgets/AlarmsWidget").then((m) => ({ default: m.AlarmsWidgetSettings })),
);

const TimersWidget = lazy(() =>
  import("./widgets/TimersWidget").then((m) => ({ default: m.TimersWidget })),
);
const TimersWidgetSettings = lazy(() =>
  import("./widgets/TimersWidget").then((m) => ({ default: m.TimersWidgetSettings })),
);

const DailyRoutineWidget = lazy(() =>
  import("./widgets/DailyRoutineWidget").then((m) => ({ default: m.DailyRoutineWidget })),
);
const DailyRoutineWidgetSettings = lazy(() =>
  import("./widgets/DailyRoutineWidget").then((m) => ({ default: m.DailyRoutineWidgetSettings })),
);

const ChoresWidget = lazy(() =>
  import("./widgets/ChoresWidget").then((m) => ({ default: m.ChoresWidget })),
);
const ChoresWidgetSettings = lazy(() =>
  import("./widgets/ChoresWidget").then((m) => ({ default: m.ChoresWidgetSettings })),
);

const GroceryWidget = lazy(() =>
  import("./widgets/GroceryWidget").then((m) => ({ default: m.GroceryWidget })),
);
const GroceryWidgetSettings = lazy(() =>
  import("./widgets/GroceryWidget").then((m) => ({ default: m.GroceryWidgetSettings })),
);

const CountdownWidget = lazy(() =>
  import("./widgets/CountdownWidget").then((m) => ({ default: m.CountdownWidget })),
);
const CountdownWidgetSettings = lazy(() =>
  import("./widgets/CountdownWidget").then((m) => ({ default: m.CountdownWidgetSettings })),
);

const AnnouncementWidget = lazy(() =>
  import("./widgets/AnnouncementWidget").then((m) => ({ default: m.AnnouncementWidget })),
);
const AnnouncementWidgetSettings = lazy(() =>
  import("./widgets/AnnouncementWidget").then((m) => ({ default: m.AnnouncementWidgetSettings })),
);

const CommuteWidget = lazy(() =>
  import("./widgets/CommuteWidget").then((m) => ({ default: m.CommuteWidget })),
);
const CommuteWidgetSettings = lazy(() =>
  import("./widgets/CommuteWidget").then((m) => ({ default: m.CommuteWidgetSettings })),
);

const WeatherAlertsWidget = lazy(() =>
  import("./widgets/WeatherAlertsWidget").then((m) => ({ default: m.WeatherAlertsWidget })),
);
const WeatherAlertsWidgetSettings = lazy(() =>
  import("./widgets/WeatherAlertsWidget").then((m) => ({
    default: m.WeatherAlertsWidgetSettings,
  })),
);

const EmbedWidget = lazy(() =>
  import("./widgets/EmbedWidget").then((m) => ({ default: m.EmbedWidget })),
);
const EmbedWidgetSettings = lazy(() =>
  import("./widgets/EmbedWidget").then((m) => ({ default: m.EmbedWidgetSettings })),
);

// Clock Widget
const clockEntry: WidgetRegistryEntry<ClockConfig> = {
  type: "clock",
  name: "Clock",
  description: "Display current time and date",
  configSchema: clockConfigSchema,
  icon: IconClock,
  component: ClockWidget,
  settingsComponent: ClockWidgetSettings,
  defaultConfig: {
    showSeconds: true,
    showDate: true,
    use24Hour: false,
    timezone: "local",
    transparentBackground: false,
    textAlign: "center",
  },
  defaultLayout: {
    w: 3,
    h: 2,
    minW: 2,
    minH: 2,
  },
};
registerWidget(clockEntry);

// Calendar Widget
const calendarEntry: WidgetRegistryEntry<CalendarConfig> = {
  type: "calendar",
  name: "Calendar",
  description: "Display calendar and events from any iCal feed",
  configSchema: calendarConfigSchema,
  icon: IconCalendar,
  component: CalendarWidget,
  settingsComponent: CalendarWidgetSettings,
  defaultConfig: {
    icalUrl: "",
    showWeekNumbers: false,
    maxEvents: 5,
    daysAhead: 30,
    showCalendar: true,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
  },
};
registerWidget(calendarEntry);

// Google Calendar Widget (OAuth)
const googleCalendarEntry: WidgetRegistryEntry<GoogleCalendarConfig> = {
  type: "google-calendar",
  name: "Google Calendar",
  description: "Display events from your Google Calendar with OAuth",
  configSchema: googleCalendarConfigSchema,
  icon: IconBrandGoogle,
  component: GoogleCalendarWidget,
  settingsComponent: GoogleCalendarWidgetSettings,
  defaultConfig: {
    clientId: "",
    selectedCalendarIds: [],
    maxEvents: 10,
    daysAhead: 30,
    showCalendar: true,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
  },
};
registerWidget(googleCalendarEntry);

// Google Calendar Month Widget
const googleCalendarMonthEntry: WidgetRegistryEntry<GoogleCalendarMonthConfig> = {
  type: "google-calendar-month",
  name: "Google Calendar Month",
  description: "Month calendar view with event indicators and day detail panel",
  configSchema: googleCalendarMonthConfigSchema,
  icon: IconCalendarMonth,
  component: GoogleCalendarMonthWidget,
  settingsComponent: GoogleCalendarMonthWidgetSettings,
  defaultConfig: {
    selectedCalendarIds: [],
    daysAhead: 60,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 4,
    h: 5,
    minW: 3,
    minH: 4,
  },
};
registerWidget(googleCalendarMonthEntry);

// Google Calendar Day Widget
const googleCalendarDayEntry: WidgetRegistryEntry<GoogleCalendarDayConfig> = {
  type: "google-calendar-day",
  name: "Google Calendar Day",
  description: "Upcoming events list grouped by day with add/edit/delete",
  configSchema: googleCalendarDayConfigSchema,
  icon: IconCalendarEvent,
  component: GoogleCalendarDayWidget,
  settingsComponent: GoogleCalendarDayWidgetSettings,
  defaultConfig: {
    selectedCalendarIds: [],
    maxEvents: 10,
    daysAhead: 30,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 3,
    h: 4,
    minW: 2,
    minH: 3,
  },
};
registerWidget(googleCalendarDayEntry);

// Photo Widget (combined: URL photos, Google Photos, and device uploads)
const photoEntry: WidgetRegistryEntry<PhotoConfig> = {
  type: "photo",
  name: "Photos",
  description: "Slideshow with URL, Google Photos, or device uploads",
  configSchema: photoConfigSchema,
  icon: IconPhoto,
  component: PhotoWidget,
  settingsComponent: PhotoWidgetSettings,
  defaultConfig: {
    photos: [],
    interval: 10,
    transition: "fade",
    showCaption: true,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 4,
    h: 3,
    minW: 2,
    minH: 2,
  },
};
registerWidget(photoEntry);

// Google Photo Collage Widget
const googlePhotoCollageEntry: WidgetRegistryEntry<GooglePhotoCollageConfig> = {
  type: "google-photo-collage",
  name: "Photo Collage",
  description:
    "Masonry collage from URL, device uploads, or Google Photos — rotates one photo at a time",
  configSchema: googlePhotoCollageConfigSchema,
  icon: IconLayoutGrid,
  component: GooglePhotoCollageWidget,
  settingsComponent: GooglePhotoCollageWidgetSettings,
  defaultConfig: {
    rotationInterval: 10,
    transparentBackground: false,
    photos: [],
  },
  defaultLayout: {
    w: 5,
    h: 4,
    minW: 3,
    minH: 3,
  },
};
registerWidget(googlePhotoCollageEntry);

// Weather Widget
const weatherEntry: WidgetRegistryEntry<WeatherConfig> = {
  type: "weather",
  name: "Weather",
  description: "Display current weather and forecast",
  configSchema: weatherConfigSchema,
  icon: IconCloudRain,
  component: WeatherWidget,
  settingsComponent: WeatherWidgetSettings,
  defaultConfig: {
    location: "",
    latitude: null,
    longitude: null,
    units: "imperial",
    showForecast: true,
    forecastDays: 5,
    transparentBackground: false,
    showAirQuality: false,
    textAlign: "left",
  },
  defaultLayout: {
    w: 3,
    h: 3,
    minW: 2,
    minH: 2,
  },
};
registerWidget(weatherEntry);

// News Widget
const newsEntry: WidgetRegistryEntry<NewsConfig> = {
  type: "news",
  name: "News",
  description: "Display news from RSS feeds",
  configSchema: newsConfigSchema,
  icon: IconNews,
  component: NewsWidget,
  settingsComponent: NewsWidgetSettings,
  defaultConfig: {
    feedUrls: [],
    maxItems: 10,
    showSource: true,
    showDescription: false,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
  },
};
registerWidget(newsEntry);

// Stocks Widget
const stocksEntry: WidgetRegistryEntry<StocksConfig> = {
  type: "stocks",
  name: "Stocks",
  description: "Display stock market prices",
  configSchema: stocksConfigSchema,
  icon: IconChartLine,
  component: StocksWidget,
  settingsComponent: StocksWidgetSettings,
  defaultConfig: {
    symbols: [],
    apiKey: "",
    showChange: true,
    showDayRange: false,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 3,
    h: 4,
    minW: 2,
    minH: 3,
  },
};
registerWidget(stocksEntry);

// Week Calendar Widget
const weekCalendarEntry: WidgetRegistryEntry<WeekCalendarConfig> = {
  type: "week-calendar",
  name: "Week Calendar",
  description: "Google Calendar week view with timed events and current time indicator",
  configSchema: weekCalendarConfigSchema,
  icon: IconCalendarWeek,
  component: WeekCalendarWidget,
  settingsComponent: WeekCalendarWidgetSettings,
  defaultConfig: {
    selectedCalendarIds: [],
    viewMode: "calendar-week",
    weekStartsOn: 0,
    startHour: 7,
    endHour: 21,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 7,
    h: 6,
    minW: 5,
    minH: 4,
  },
};
registerWidget(weekCalendarEntry);

// To-Do List Widget
const todoEntry: WidgetRegistryEntry<TodoConfig> = {
  type: "todo",
  name: "To-Do List",
  description: "Interactive checklist — check items off in kiosk mode",
  configSchema: todoConfigSchema,
  icon: IconCheckbox,
  component: TodoWidget,
  settingsComponent: TodoWidgetSettings,
  defaultConfig: {
    items: [],
    hideCompleted: false,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 3,
    h: 4,
    minW: 2,
    minH: 3,
  },
};
registerWidget(todoEntry);

// Sports Scores Widget
const sportsEntry: WidgetRegistryEntry<SportsConfig> = {
  type: "sports",
  name: "Sports Scores",
  description: "Live scores and schedules via ESPN (NHL, NFL, NBA, MLB & more)",
  configSchema: sportsConfigSchema,
  icon: IconTrophy,
  component: SportsWidget,
  settingsComponent: SportsWidgetSettings,
  defaultConfig: {
    leagueId: "nhl",
    favoriteTeamIds: [],
    showAllGames: true,
    showCurrentGames: true,
    transparentBackground: false,
  },
  defaultLayout: {
    w: 3,
    h: 4,
    minW: 2,
    minH: 3,
  },
};
registerWidget(sportsEntry);

// Alarms Widget
const alarmsEntry: WidgetRegistryEntry<AlarmsConfig> = {
  type: "alarms",
  name: "Alarms",
  description: "View and manage recurring display alarms",
  configSchema: alarmsConfigSchema,
  icon: IconAlarm,
  component: AlarmsWidget,
  settingsComponent: AlarmsWidgetSettings,
  defaultConfig: {
    transparentBackground: false,
  },
  defaultLayout: {
    w: 3,
    h: 3,
    minW: 2,
    minH: 2,
  },
};
registerWidget(alarmsEntry);

// Timers Widget
const timersEntry: WidgetRegistryEntry<TimersConfig> = {
  type: "timers",
  name: "Timers",
  description: "Countdown timers with shared display alerts",
  configSchema: timersConfigSchema,
  icon: IconHourglass,
  component: TimersWidget,
  settingsComponent: TimersWidgetSettings,
  defaultConfig: {
    presets: [],
    transparentBackground: false,
  },
  defaultLayout: {
    w: 3,
    h: 3,
    minW: 2,
    minH: 2,
  },
};
registerWidget(timersEntry);

const dailyRoutineEntry: WidgetRegistryEntry<DailyRoutineConfig> = {
  type: "daily-routine",
  name: "Daily Routine",
  description: "Numbered morning steps that reset each day",
  configSchema: dailyRoutineConfigSchema,
  icon: IconListCheck,
  component: DailyRoutineWidget,
  settingsComponent: DailyRoutineWidgetSettings,
  defaultConfig: {
    steps: DEFAULT_ROUTINE_STEPS,
    resetHour: 4,
    completionDay: null,
    completedStepIds: [],
    showReset: true,
    transparentBackground: false,
  },
  defaultLayout: { w: 3, h: 5, minW: 2, minH: 3 },
};
registerWidget(dailyRoutineEntry);

const choresEntry: WidgetRegistryEntry<ChoresConfig> = {
  type: "chores",
  name: "Chores",
  description: "Assigned household chores for today",
  configSchema: choresConfigSchema,
  icon: IconChecklist,
  component: ChoresWidget,
  settingsComponent: ChoresWidgetSettings,
  defaultConfig: {
    chores: [],
    completions: [],
    showCompleted: true,
    onlyToday: true,
    transparentBackground: false,
  },
  defaultLayout: { w: 3, h: 4, minW: 2, minH: 3 },
};
registerWidget(choresEntry);

const groceryEntry: WidgetRegistryEntry<GroceryConfig> = {
  type: "grocery",
  name: "Grocery",
  description: "Shared shopping list with optional aisle groups",
  configSchema: groceryConfigSchema,
  icon: IconShoppingCart,
  component: GroceryWidget,
  settingsComponent: GroceryWidgetSettings,
  defaultConfig: {
    items: [],
    hideChecked: false,
    groupByAisle: false,
    transparentBackground: false,
  },
  defaultLayout: { w: 3, h: 4, minW: 2, minH: 3 },
};
registerWidget(groceryEntry);

const countdownEntry: WidgetRegistryEntry<CountdownConfig> = {
  type: "countdown",
  name: "Countdown",
  description: "Count down to a date or event",
  configSchema: countdownConfigSchema,
  icon: IconHourglassLow,
  component: CountdownWidget,
  settingsComponent: CountdownWidgetSettings,
  defaultConfig: {
    target: "",
    allDay: true,
    label: "",
    showSeconds: false,
    transparentBackground: false,
    textAlign: "center",
  },
  defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
};
registerWidget(countdownEntry);

const announcementEntry: WidgetRegistryEntry<AnnouncementConfig> = {
  type: "announcement",
  name: "Announcement",
  description: "A pinned message readable from across the room",
  configSchema: announcementConfigSchema,
  icon: IconSpeakerphone,
  component: AnnouncementWidget,
  settingsComponent: AnnouncementWidgetSettings,
  defaultConfig: {
    body: "",
    textAlign: "left",
    size: "lg",
    transparentBackground: false,
  },
  defaultLayout: { w: 4, h: 2, minW: 2, minH: 1 },
};
registerWidget(announcementEntry);

const commuteEntry: WidgetRegistryEntry<CommuteConfig> = {
  type: "commute",
  name: "Commute",
  description: "Travel times for frequent driving routes",
  configSchema: commuteConfigSchema,
  icon: IconCar,
  component: CommuteWidget,
  settingsComponent: CommuteWidgetSettings,
  defaultConfig: {
    routes: [],
    units: "imperial",
    transparentBackground: false,
  },
  defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 },
};
registerWidget(commuteEntry);

const weatherAlertsEntry: WidgetRegistryEntry<WeatherAlertsConfig> = {
  type: "weather-alerts",
  name: "Weather Alerts",
  description: "Official US weather watches and warnings",
  configSchema: weatherAlertsConfigSchema,
  icon: IconAlertTriangle,
  component: WeatherAlertsWidget,
  settingsComponent: WeatherAlertsWidgetSettings,
  defaultConfig: {
    location: "",
    latitude: null,
    longitude: null,
    maxAlerts: 5,
    transparentBackground: false,
  },
  defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 },
};
registerWidget(weatherAlertsEntry);

const embedEntry: WidgetRegistryEntry<EmbedConfig> = {
  type: "embed",
  name: "Embed",
  description: "Show a page or Home Assistant dashboard in a sandboxed frame",
  configSchema: embedConfigSchema,
  icon: IconAppWindow,
  component: EmbedWidget,
  settingsComponent: EmbedWidgetSettings,
  defaultConfig: {
    url: "",
    refreshSeconds: 0,
    allowInteraction: false,
    transparentBackground: false,
  },
  defaultLayout: { w: 4, h: 4, minW: 2, minH: 2 },
};
registerWidget(embedEntry);
