import React from 'react';

interface WeatherBackgroundProps {
  weatherCode: number;
  isNight: boolean;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherCode, isNight }) => {
  // Clear/Sunny
  if (!isNight && (weatherCode === 0 || weatherCode === 1)) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-300/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-blue-300/30 rounded-full blur-[100px]" />
      </div>
    );
  }

  // Night
  if (isNight && (weatherCode === 0 || weatherCode === 1 || weatherCode === 2)) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-slate-300/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px]" />
      </div>
    );
  }

  // Rain or Thunderstorm
  if (weatherCode >= 51 && weatherCode <= 99) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute -top-20 left-1/3 w-[600px] h-[400px] bg-blue-200/40 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-sky-200/40 rounded-full blur-[120px]" />
      </div>
    );
  }

  // Cloud / Fog
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[120px]" />
    </div>
  );
};
