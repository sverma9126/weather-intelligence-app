import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sunset,
  Umbrella,
  Wind,
  Sun,
  Droplets,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { WeatherData, UnitSystem } from '../types';
import { getWeatherCodeDetails } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatWind } from '../utils/intelligence';

interface DailyForecastProps {
  weather: WeatherData;
  unit: UnitSystem;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ weather, unit }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const daily = weather.daily;
  const timezone = weather.timezone;

  // Calculate overall weekly min and max to anchor visual bar
  const weeklyMin = Math.min(...daily.temperature_2m_min);
  const weeklyMax = Math.max(...daily.temperature_2m_max);
  const tempRange = Math.max(1, weeklyMax - weeklyMin);

  const getDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

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

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-md">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            7-Day Weather Forecast
          </h3>
          <p className="text-xs text-slate-500">
            Daily temperature spectrum and weather breakdown
          </p>
        </div>
      </div>

      {/* Daily Cards List */}
      <div className="space-y-3">
        {daily.time.map((dateStr, index) => {
          const maxTemp = daily.temperature_2m_max[index];
          const minTemp = daily.temperature_2m_min[index];
          const code = daily.weather_code[index];
          const codeDetails = getWeatherCodeDetails(code);
          const precipProb = daily.precipitation_probability_max[index] || 0;
          const windMax = daily.wind_speed_10m_max[index] || 0;
          const uvMax = daily.uv_index_max[index] || 0;
          const isExpanded = expandedIndex === index;

          // Compute left % and width % for horizontal range bar
          const leftPercent = Math.max(0, Math.min(100, ((minTemp - weeklyMin) / tempRange) * 100));
          const rightPercent = Math.max(0, Math.min(100, ((maxTemp - weeklyMin) / tempRange) * 100));
          const widthPercent = Math.max(5, rightPercent - leftPercent);

          return (
            <div
              key={`daily-${dateStr}-${index}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                index === 0
                  ? 'bg-gradient-to-r from-blue-50/80 to-white border-blue-300 shadow-2xs'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
              }`}
            >
              {/* Main Card Row */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                {/* Day & Condition */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex-shrink-0">
                    <WeatherIcon code={code} className="w-8 h-8" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {getDayLabel(dateStr, index)}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {formatDateLabel(dateStr)} • {codeDetails.label}
                    </div>
                  </div>
                </div>

                {/* Rain Probability Pill */}
                <div className="flex items-center gap-3">
                  {precipProb > 10 ? (
                    <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1">
                      <Umbrella className="w-3.5 h-3.5" />
                      <span>{precipProb}%</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium flex items-center gap-1">
                      <Umbrella className="w-3.5 h-3.5" />
                      <span>0%</span>
                    </div>
                  )}

                  {/* Temperature Spectrum Bar */}
                  <div className="flex-1 sm:w-52 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 w-10 text-right">
                      {formatTemp(minTemp, unit)}
                    </span>

                    <div className="flex-1 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs font-bold text-slate-900 w-10">
                      {formatTemp(maxTemp, unit)}
                    </span>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 bg-white/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">Sunrise / Sunset</span>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="flex items-center text-amber-600 gap-1">
                        <Sunrise className="w-3.5 h-3.5" /> {formatSunTime(daily.sunrise[index])}
                      </span>
                      <span className="flex items-center text-indigo-600 gap-1">
                        <Sunset className="w-3.5 h-3.5" /> {formatSunTime(daily.sunset[index])}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">Max UV Index</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{uvMax.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">Max Wind Gusts</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formatWind(windMax, unit)}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">Precipitation Sum</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>{daily.precipitation_sum[index] || 0} mm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
