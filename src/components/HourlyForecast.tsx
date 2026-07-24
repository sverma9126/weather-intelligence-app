import React, { useState } from 'react';
import { Clock, Thermometer, Umbrella, Wind } from 'lucide-react';
import { WeatherData, UnitSystem } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatWind } from '../utils/intelligence';

interface HourlyForecastProps {
  weather: WeatherData;
  unit: UnitSystem;
}

type HourlyTab = 'temp' | 'rain' | 'wind';

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather, unit }) => {
  const [activeTab, setActiveTab] = useState<HourlyTab>('temp');
  const hourly = weather.hourly;
  const timezone = weather.timezone;

  // Take next 24 hours
  const hoursCount = 24;
  const times = hourly.time.slice(0, hoursCount);
  const temps = hourly.temperature_2m.slice(0, hoursCount);
  const weatherCodes = hourly.weather_code.slice(0, hoursCount);
  const rainProbs = hourly.precipitation_probability.slice(0, hoursCount);
  const winds = hourly.wind_speed_10m.slice(0, hoursCount);

  const formatHourLabel = (isoString: string, index: number) => {
    if (index === 0) return 'Now';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return isoString.split('T')[1]?.substring(0, 5) || isoString;
    }
  };

  const isNightHour = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const hr = d.getHours();
      return hr < 6 || hr >= 20;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-md">
      {/* Header with metric tab selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              24-Hour Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Hourly weather trends for {weather.city.name}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'temp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp</span>
          </button>

          <button
            onClick={() => setActiveTab('rain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'rain'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Umbrella className="w-3.5 h-3.5" />
            <span>Rain %</span>
          </button>

          <button
            onClick={() => setActiveTab('wind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'wind'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>
        </div>
      </div>

      {/* Scrollable Hourly Strip */}
      <div className="relative overflow-x-auto pb-3 pt-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="flex items-center gap-3 min-w-max px-1">
          {times.map((timeIso, index) => {
            const temp = temps[index];
            const code = weatherCodes[index];
            const rain = rainProbs[index];
            const wind = winds[index];
            const night = isNightHour(timeIso);

            return (
              <div
                key={`hour-${timeIso}-${index}`}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border min-w-[84px] text-center transition-all hover:scale-105 ${
                  index === 0
                    ? 'bg-gradient-to-b from-blue-50 to-white border-blue-300 ring-1 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                {/* Time Label */}
                <span className="text-xs font-bold text-slate-700 mb-2">
                  {formatHourLabel(timeIso, index)}
                </span>

                {/* Dynamic Icon */}
                <div className="my-1.5 p-1.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                  <WeatherIcon code={code} isNight={night} className="w-7 h-7" />
                </div>

                {/* Primary Metric Displayed Based on Tab */}
                {activeTab === 'temp' && (
                  <div className="mt-2">
                    <div className="text-sm font-extrabold text-slate-900">
                      {formatTemp(temp, unit)}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      {rain}% rain
                    </div>
                  </div>
                )}

                {activeTab === 'rain' && (
                  <div className="mt-2">
                    <div
                      className={`text-sm font-bold ${
                        rain > 50 ? 'text-blue-700' : rain > 20 ? 'text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      {rain}%
                    </div>
                    {/* Rain indicator bar */}
                    <div className="w-10 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, rain)}%` }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'wind' && (
                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-800">
                      {formatWind(wind, unit)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Breeze</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
