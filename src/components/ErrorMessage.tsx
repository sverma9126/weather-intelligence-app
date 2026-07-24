import React from 'react';
import { AlertCircle, RotateCw, MapPin, Search } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onSelectSuggestedCity?: (cityName: string) => void;
}

const SUGGESTED_CITIES = ['London', 'Tokyo', 'New York', 'Paris', 'Sydney', 'Singapore'];

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onSelectSuggestedCity,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-lg">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Weather</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed font-medium">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all mb-6"
        >
          <RotateCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}

      {onSelectSuggestedCity && (
        <div className="pt-6 border-t border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Or try searching one of these popular cities
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => onSelectSuggestedCity(city)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
