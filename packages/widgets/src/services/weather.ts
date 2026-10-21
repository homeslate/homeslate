// Open-Meteo Weather API Service
// Free for non-commercial use, commercial plans available
// https://open-meteo.com/

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/province
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
}

export interface HourlyForecast {
  time: string; // ISO datetime
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

export interface AirQualityData {
  usAqi: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  utcOffsetSeconds: number;
  location: {
    name: string;
    country: string;
    admin1?: string;
  };
  units: "imperial" | "metric";
  airQuality?: AirQualityData;
}

// Weather code to description mapping (WMO codes)
export const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "sunny" },
  1: { description: "Mainly clear", icon: "sunny" },
  2: { description: "Partly cloudy", icon: "cloudy" },
  3: { description: "Overcast", icon: "cloudy" },
  45: { description: "Foggy", icon: "cloudy" },
  48: { description: "Depositing rime fog", icon: "cloudy" },
  51: { description: "Light drizzle", icon: "rainy" },
  53: { description: "Moderate drizzle", icon: "rainy" },
  55: { description: "Dense drizzle", icon: "rainy" },
  56: { description: "Light freezing drizzle", icon: "rainy" },
  57: { description: "Dense freezing drizzle", icon: "rainy" },
  61: { description: "Slight rain", icon: "rainy" },
  63: { description: "Moderate rain", icon: "rainy" },
  65: { description: "Heavy rain", icon: "rainy" },
  66: { description: "Light freezing rain", icon: "rainy" },
  67: { description: "Heavy freezing rain", icon: "rainy" },
  71: { description: "Slight snow", icon: "snowy" },
  73: { description: "Moderate snow", icon: "snowy" },
  75: { description: "Heavy snow", icon: "snowy" },
  77: { description: "Snow grains", icon: "snowy" },
  80: { description: "Slight rain showers", icon: "rainy" },
  81: { description: "Moderate rain showers", icon: "rainy" },
  82: { description: "Violent rain showers", icon: "rainy" },
  85: { description: "Slight snow showers", icon: "snowy" },
  86: { description: "Heavy snow showers", icon: "snowy" },
  95: { description: "Thunderstorm", icon: "stormy" },
  96: { description: "Thunderstorm with slight hail", icon: "stormy" },
  99: { description: "Thunderstorm with heavy hail", icon: "stormy" },
};

export function getWeatherDescription(code: number): string {
  return weatherCodeMap[code]?.description ?? "Unknown";
}

export function getWeatherIcon(code: number): string {
  return weatherCodeMap[code]?.icon ?? "cloudy";
}

/**
 * Search for locations by name using Open-Meteo Geocoding API
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "en",
    format: "json",
  });
  const response = await fetch(`/api/weather/geocode?${params}`);

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.results ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

/**
 * Fetch weather data from Open-Meteo API
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  units: "imperial" | "metric" = "imperial",
  locationInfo?: { name: string; country: string; admin1?: string },
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    units,
  });
  const response = await fetch(`/api/weather/forecast?${params}`);

  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.statusText}`);
  }

  const data = await response.json();

  const times: string[] = data.hourly?.time ?? [];
  const mapped: HourlyForecast[] = times.map((time: string, i: number) => ({
    time,
    temperature: Math.round(data.hourly.temperature_2m[i]),
    weatherCode: data.hourly.weather_code[i],
    isDay: data.hourly.is_day[i] === 1,
  }));
  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      precipitationProbability: data.daily.precipitation_probability_max[i],
    })),
    hourly: mapped,
    utcOffsetSeconds: data.utc_offset_seconds ?? 0,
    location: locationInfo ?? {
      name: "Unknown",
      country: "",
    },
    units,
  };
}

/**
 * Fetch US AQI from Open-Meteo Air Quality API
 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  const response = await fetch(`/api/weather/air?${params}`);
  if (!response.ok) throw new Error(`Air quality fetch failed: ${response.statusText}`);
  const data = await response.json();
  return { usAqi: data.current?.us_aqi ?? 0 };
}

export async function fetchWeatherCached(
  latitude: number,
  longitude: number,
  units: "imperial" | "metric" = "imperial",
  locationInfo?: { name: string; country: string; admin1?: string },
): Promise<WeatherData> {
  return fetchWeather(latitude, longitude, units, locationInfo);
}
