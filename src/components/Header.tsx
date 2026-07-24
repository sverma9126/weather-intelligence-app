import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Bookmark,
  BookmarkCheck,
  RotateCw,
  Sun,
  Cloud,
  ChevronRight,
  Compass,
  X,
  History,
} from 'lucide-react';
import { GeoCity, UnitSystem, FavoriteCity } from '../types';
import { searchCities } from '../services/weatherApi';

interface HeaderProps {
  currentCity: GeoCity;
  onSelectCity: (city: GeoCity) => void;
  onUseLocation: () => void;
  isLoadingLocation: boolean;
  unit: UnitSystem;
  onToggleUnit: (unit: UnitSystem) => void;
  favorites: FavoriteCity[];
  onToggleFavorite: (city: GeoCity) => void;
  isFavorite: boolean;
  onOpenFavorites: () => void;
}

const POPULAR_CITIES: GeoCity[] = [
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, country: 'United Kingdom', admin1: 'England', timezone: 'Europe/London' },
  { id: 5128581, name: 'New York', latitude: 40.7143, longitude: -74.006, country: 'United States', admin1: 'New York', timezone: 'America/New_York' },
  { id: 2988507, name: 'Paris', latitude: 48.8534, longitude: 2.3488, country: 'France', admin1: 'Île-de-France', timezone: 'Europe/Paris' },
  { id: 1275339, name: 'Mumbai', latitude: 19.0728, longitude: 72.8826, country: 'India', admin1: 'Maharashtra', timezone: 'Asia/Kolkata' },
  { id: 2147714, name: 'Sydney', latitude: -33.8678, longitude: 151.2073, country: 'Australia', admin1: 'New South Wales', timezone: 'Australia/Sydney' },
];

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectCity,
  onUseLocation,
  isLoadingLocation,
  unit,
  onToggleUnit,
  favorites,
  onToggleFavorite,
  isFavorite,
  onOpenFavorites,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GeoCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<GeoCity[]>(() => {
    try {
      const saved = localStorage.getItem('weather_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(searchTerm);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCityItem = (city: GeoCity) => {
    onSelectCity(city);
    setSearchTerm('');
    setIsDropdownOpen(false);

    // Update recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.id !== city.id);
      const updated = [city, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo & App Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Weather Intelligence
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Precision forecasts & smart activity insights
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => onToggleFavorite(currentCity)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {isFavorite ? <BookmarkCheck className="w-5 h-5 fill-amber-500/20" /> : <Bookmark className="w-5 h-5" />}
            </button>

            <button
              onClick={onOpenFavorites}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Saved ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Auto-complete */}
        <div className="relative flex-1 max-w-xl" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search city name (e.g. London, Tokyo, San Francisco)..."
              className="w-full bg-slate-100/90 border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-12 p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onUseLocation}
              disabled={isLoadingLocation}
              title="Use current location"
              className="absolute right-2 px-2.5 py-1.5 bg-slate-200/80 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
            >
              <MapPin className={`w-3.5 h-3.5 ${isLoadingLocation ? 'animate-bounce text-blue-600' : ''}`} />
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {isSearching && (
                <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Searching Open-Meteo locations...</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Matching Cities
                  </div>
                  {searchResults.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCityItem(city)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600">
                            {city.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {[city.admin1, city.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-3 text-sm text-amber-700 bg-amber-50">
                  No cities found matching "{searchTerm}". Try checking for spelling or search another city.
                </div>
              )}

              {/* Recent searches section */}
              {recentSearches.length > 0 && !searchTerm && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Recent Searches</span>
                  </div>
                  {recentSearches.map((city) => (
                    <button
                      key={`recent-${city.id}`}
                      onClick={() => handleSelectCityItem(city)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 text-sm"
                    >
                      <span>{city.name}, {city.country || city.admin1}</span>
                      <span className="text-xs text-slate-400">Recent</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular cities shortcuts */}
              {!searchTerm && (
                <div className="py-2.5 px-3 bg-slate-50/80">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Popular Destinations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={`pop-${city.id}`}
                        onClick={() => handleSelectCityItem(city)}
                        className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg shadow-2xs transition-all font-medium"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Unit Switcher & Favorites */}
        <div className="hidden md:flex items-center gap-3">
          {/* Favorite Toggle Button */}
          <button
            onClick={() => onToggleFavorite(currentCity)}
            className={`px-3 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
              isFavorite
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {isFavorite ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span>Save City</span>
              </>
            )}
          </button>

          {/* Saved Drawer Trigger */}
          <button
            onClick={onOpenFavorites}
            className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved ({favorites.length})</span>
          </button>

          {/* Unit Toggle Switch */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 flex items-center">
            <button
              onClick={() => onToggleUnit('metric')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                unit === 'metric'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °C (km/h)
            </button>
            <button
              onClick={() => onToggleUnit('imperial')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                unit === 'imperial'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °F (mph)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
