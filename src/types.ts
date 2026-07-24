export type UnitSystem = 'metric' | 'imperial';

export interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string; // State/Province
  admin2?: string;
  admin3?: string;
  timezone?: string;
  population?: number;
}

export interface CurrentWeatherMetrics {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyWeatherMetrics {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  pressure_msl: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_speed_10m: number[];
  uv_index: number[];
}

export interface DailyWeatherMetrics {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  current: CurrentWeatherMetrics;
  hourly: HourlyWeatherMetrics;
  daily: DailyWeatherMetrics;
  city: GeoCity;
}

export interface WeatherCodeDetails {
  code: number;
  label: string;
  description: string;
  iconName: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  themeGradient: string;
  cardBg: string;
}

export type PlanningRating = 'optimal' | 'good' | 'moderate' | 'unfavorable' | 'warning';

export interface PlanningRecommendation {
  id: string;
  title: string;
  category: string;
  rating: PlanningRating;
  summary: string;
  details: string;
  icon: string;
  optimalTimeWindow?: string;
  actionables: string[];
}

export interface FavoriteCity {
  id: string; // key like lat,lon or city id
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  addedAt: number;
}
