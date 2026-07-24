import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  SunDim,
} from 'lucide-react';
import { getWeatherCodeDetails } from '../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isNight?: boolean;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, isNight = false, className = 'w-8 h-8' }) => {
  const details = getWeatherCodeDetails(code, isNight);

  switch (details.iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400`} />;
    case 'Moon':
      return <Moon className={`${className} text-indigo-300`} />;
    case 'SunDim':
      return <SunDim className={`${className} text-amber-300`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-sky-300`} />;
    case 'CloudMoon':
      return <CloudMoon className={`${className} text-indigo-200`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-teal-300`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-300`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-400`} />;
    case 'CloudRainWind':
      return <CloudRainWind className={`${className} text-blue-500`} />;
    case 'CloudSnow':
      return <CloudSnow className={`${className} text-cyan-200`} />;
    case 'Snowflake':
      return <Snowflake className={`${className} text-sky-200`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-amber-500`} />;
    case 'Cloud':
    default:
      return <Cloud className={`${className} text-slate-300`} />;
  }
};
