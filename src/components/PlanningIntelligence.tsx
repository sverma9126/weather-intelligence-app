import React from 'react';
import {
  Sparkles,
  Activity,
  Shirt,
  Moon,
  Sun,
  Car,
  Glasses,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
} from 'lucide-react';
import { WeatherData, UnitSystem, PlanningRating } from '../types';
import { generatePlanningRecommendations } from '../utils/intelligence';

interface PlanningIntelligenceProps {
  weather: WeatherData;
  unit: UnitSystem;
}

export const PlanningIntelligence: React.FC<PlanningIntelligenceProps> = ({ weather, unit }) => {
  const recommendations = generatePlanningRecommendations(weather, unit);

  const getRatingBadge = (rating: PlanningRating) => {
    switch (rating) {
      case 'optimal':
        return {
          label: 'Optimal',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500',
        };
      case 'good':
        return {
          label: 'Good',
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          dot: 'bg-blue-500',
        };
      case 'moderate':
        return {
          label: 'Moderate',
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-500',
        };
      case 'unfavorable':
        return {
          label: 'Unfavorable',
          bg: 'bg-orange-50 border-orange-200 text-orange-700',
          dot: 'bg-orange-500',
        };
      case 'warning':
        return {
          label: 'Warning',
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          dot: 'bg-rose-500 animate-ping',
        };
      default:
        return {
          label: 'Neutral',
          bg: 'bg-slate-100 border-slate-200 text-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-blue-600' };
    switch (iconName) {
      case 'Activity':
        return <Activity {...props} />;
      case 'Shirt':
        return <Shirt {...props} />;
      case 'Moon':
        return <Moon {...props} />;
      case 'Sun':
        return <Sun {...props} />;
      case 'Car':
        return <Car {...props} />;
      case 'Glasses':
        return <Glasses {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Smart Planning & Activity Intelligence
          </h3>
          <p className="text-xs text-slate-500">
            Weather-informed recommendations for outdoor activities, travel & lifestyle
          </p>
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((item) => {
          const badge = getRatingBadge(item.rating);

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all group"
            >
              <div>
                {/* Top Row: Icon, Title & Rating Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 transition-colors shadow-2xs">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 flex-shrink-0 ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Summary & Details */}
                <div className="mb-3">
                  <p className="text-xs font-bold text-slate-800 mb-1">
                    {item.summary}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.details}
                  </p>
                </div>

                {/* Optimal Time Window Pill */}
                {item.optimalTimeWindow && (
                  <div className="mb-3 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{item.optimalTimeWindow}</span>
                  </div>
                )}

                {/* Actionable Points */}
                {item.actionables.length > 0 && (
                  <div className="space-y-1.5 pt-2.5 border-t border-slate-200">
                    {item.actionables.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
