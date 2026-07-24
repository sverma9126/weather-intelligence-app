import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LineChart as ChartIcon, Thermometer, Umbrella, Wind, Calendar } from 'lucide-react';
import { WeatherData, UnitSystem } from '../types';

interface WeatherChartsProps {
  weather: WeatherData;
  unit: UnitSystem;
}

type ChartTab = 'temp' | 'precip' | 'wind' | '7day';

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ weather, unit }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('temp');
  const { hourly, daily, timezone } = weather;

  // Format 24-hour data for recharts
  const hourlyData = hourly.time.slice(0, 24).map((timeIso, index) => {
    let hourStr = '';
    try {
      hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: true,
      }).format(new Date(timeIso));
    } catch {
      hourStr = timeIso.split('T')[1]?.substring(0, 5) || timeIso;
    }

    const rawTemp = hourly.temperature_2m[index];
    const rawFeels = hourly.apparent_temperature[index];
    const rawWind = hourly.wind_speed_10m[index];

    const temp = unit === 'imperial' ? Math.round((rawTemp * 9) / 5 + 32) : Math.round(rawTemp);
    const feels = unit === 'imperial' ? Math.round((rawFeels * 9) / 5 + 32) : Math.round(rawFeels);
    const wind = unit === 'imperial' ? Math.round(rawWind * 0.621371) : Math.round(rawWind);

    return {
      time: hourStr,
      temp,
      feelsLike: feels,
      precipProb: hourly.precipitation_probability[index] || 0,
      precipVol: hourly.precipitation[index] || 0,
      windSpeed: wind,
      uv: hourly.uv_index[index] || 0,
    };
  });

  // Format 7-day data for recharts
  const dailyData = daily.time.map((dateStr, index) => {
    let dayStr = '';
    try {
      dayStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
      }).format(new Date(dateStr));
    } catch {
      dayStr = dateStr;
    }

    const rawMax = daily.temperature_2m_max[index];
    const rawMin = daily.temperature_2m_min[index];

    const maxTemp = unit === 'imperial' ? Math.round((rawMax * 9) / 5 + 32) : Math.round(rawMax);
    const minTemp = unit === 'imperial' ? Math.round((rawMin * 9) / 5 + 32) : Math.round(rawMin);

    return {
      day: dayStr,
      maxTemp,
      minTemp,
      rainProb: daily.precipitation_probability_max[index] || 0,
    };
  });

  const tempUnitLabel = unit === 'imperial' ? '°F' : '°C';
  const windUnitLabel = unit === 'imperial' ? 'mph' : 'km/h';

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-md">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Weather Analytics & Visual Trends
            </h3>
            <p className="text-xs text-slate-500">
              Interactive meteorological metrics over time
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'temp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>24h Temperature</span>
          </button>

          <button
            onClick={() => setActiveTab('precip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'precip'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Umbrella className="w-3.5 h-3.5" />
            <span>Precipitation Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('wind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'wind'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Speed</span>
          </button>

          <button
            onClick={() => setActiveTab('7day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === '7day'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day High/Low</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temp' ? (
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit={tempUnitLabel} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                name={`Temperature (${tempUnitLabel})`}
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
              <Area
                type="monotone"
                dataKey="feelsLike"
                name={`Feels Like (${tempUnitLabel})`}
                stroke="#4f46e5"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#feelsGradient)"
              />
            </AreaChart>
          ) : activeTab === 'precip' ? (
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="precipProb"
                name="Rain Probability (%)"
                fill="#0284c7"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          ) : activeTab === 'wind' ? (
            <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit={windUnitLabel} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                name={`Wind Speed (${windUnitLabel})`}
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: '#16a34a', r: 3 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="maxTempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="minTempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit={tempUnitLabel} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="maxTemp"
                name={`Max Temp (${tempUnitLabel})`}
                stroke="#e11d48"
                strokeWidth={3}
                fill="url(#maxTempGrad)"
              />
              <Area
                type="monotone"
                dataKey="minTemp"
                name={`Min Temp (${tempUnitLabel})`}
                stroke="#2563eb"
                strokeWidth={3}
                fill="url(#minTempGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
