import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Eye,
  Gauge,
  Cloud,
  Sunrise,
  Sunset,
  Thermometer,
  Compass,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
  Umbrella,
} from 'lucide-react';
import { WeatherData, UnitSystem } from '../types';
import { getWeatherCodeDetails } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatWind } from '../utils/intelligence';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  unit: UnitSystem;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ weather, unit }) => {
  const { current, daily, city, timezone } = weather;
  const isNight = current.is_day === 0;
  const codeDetails = getWeatherCodeDetails(current.weather_code, isNight);

  const todayMax = daily.temperature_2m_max[0];
  const todayMin = daily.temperature_2m_min[0];

  // Format local date and time using city timezone
  const getLocalDateTime = () => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(now);
    } catch {
      return new Date().toLocaleString();
    }
  };

  // Convert wind degrees to cardinal direction
  const getWindCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  // Format sunrise / sunset
  const formatSunTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return isoString.split('T')[1]?.substring(0, 5) || isoString;
    }
  };

  // UV level tag
  const getUvBadge = (uv: number) => {
    if (uv >= 11) return { text: 'Extreme', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    if (uv >= 8) return { text: 'Very High', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (uv >= 6) return { text: 'High', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (uv >= 3) return { text: 'Moderate', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    return { text: 'Low', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  const uvMax = daily.uv_index_max[0] || 0;
  const uvBadge = getUvBadge(uvMax);

  // Visibility conversion
  const visibilityMeters = weather.hourly.visibility[0] || 10000;
  const visibilityValue =
    unit === 'imperial'
      ? `${(visibilityMeters / 1609.34).toFixed(1)} mi`
      : `${(visibilityMeters / 1000).toFixed(1)} km`;

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200/90 ${codeDetails.cardBg} bg-white bg-gradient-to-br ${codeDetails.themeGradient} p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all`}>
      {/* Background ambient glow effect */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Location & Time Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {city.name}
              </h2>
              {city.country_code && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                  {city.country_code}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 font-medium">
              {[city.admin1, city.country].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{getLocalDateTime()}</span>
        </div>
      </div>

      {/* Main Temp & Weather Condition Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <WeatherIcon code={current.weather_code} isNight={isNight} className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-sm" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tighter">
                {formatTemp(current.temperature_2m, unit)}
              </span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-1">
              {codeDetails.label}
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-3 mt-1 font-medium">
              <span>Feels like <strong className="text-slate-900 font-bold">{formatTemp(current.apparent_temperature, unit)}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5 text-rose-500 inline" /> {formatTemp(todayMax, unit)}
                <ArrowDown className="w-3.5 h-3.5 text-blue-600 inline ml-1" /> {formatTemp(todayMin, unit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
          <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-2 flex items-center justify-between">
            <span>Weather Summary</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${uvBadge.color}`}>
              UV: {uvBadge.text} ({uvMax.toFixed(1)})
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {codeDetails.description}. Expect temperature ranging between {formatTemp(todayMin, unit)} and {formatTemp(todayMax, unit)} today with wind speeds up to {formatWind(current.wind_speed_10m, unit)}.
          </p>
        </div>
      </div>

      {/* Grid of Key Atmospheric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Wind */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Wind</span>
            <Wind className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatWind(current.wind_speed_10m, unit)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-400" />
            <span>{current.wind_direction_10m}° {getWindCardinal(current.wind_direction_10m)}</span>
            {current.wind_gusts_10m > current.wind_speed_10m && (
              <span className="ml-1 text-slate-600">
                (Gusts {formatWind(current.wind_gusts_10m, unit)})
              </span>
            )}
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {current.relative_humidity_2m}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Dew point: {formatTemp(weather.hourly.dew_point_2m[0] || 10, unit)}
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Pressure</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {Math.round(current.pressure_msl || current.surface_pressure)} hPa
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {current.pressure_msl > 1013 ? 'High pressure' : 'Low pressure'}
          </div>
        </div>

        {/* Visibility */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Visibility</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {visibilityValue}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {visibilityMeters >= 10000 ? 'Clear distance' : 'Reduced sight'}
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Cloud Cover</span>
            <Cloud className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {current.cloud_cover}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {current.cloud_cover < 20 ? 'Mostly clear' : current.cloud_cover < 70 ? 'Partly cloudy' : 'Overcast'}
          </div>
        </div>

        {/* Precipitation */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Precipitation</span>
            <Umbrella className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {current.precipitation > 0 ? `${current.precipitation} mm` : '0 mm'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Risk max: {daily.precipitation_probability_max[0] || 0}%
          </div>
        </div>

        {/* Sunrise */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Sunrise</span>
            <Sunrise className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900">
            {formatSunTime(daily.sunrise[0])}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Dawn twilight
          </div>
        </div>

        {/* Sunset */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Sunset</span>
            <Sunset className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-base font-bold text-slate-900">
            {formatSunTime(daily.sunset[0])}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Dusk twilight
          </div>
        </div>
      </div>
    </div>
  );
};
