import React, { useState, useEffect } from 'react';
import { RotateCw, AlertCircle, Bookmark, Compass } from 'lucide-react';
import { GeoCity, WeatherData, UnitSystem, FavoriteCity } from './types';
import { searchCities, reverseGeocode, fetchWeatherData } from './services/weatherApi';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherCharts } from './components/WeatherCharts';
import { PlanningIntelligence } from './components/PlanningIntelligence';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ErrorMessage } from './components/ErrorMessage';
import { WeatherBackground } from './components/WeatherBackground';

const DEFAULT_CITY: GeoCity = {
  id: 2643743,
  name: 'London',
  latitude: 51.5085,
  longitude: -0.1257,
  country: 'United Kingdom',
  admin1: 'England',
  country_code: 'GB',
  timezone: 'Europe/London',
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeoCity>(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Unit System (°C Metric or °F Imperial)
  const [unit, setUnit] = useState<UnitSystem>(() => {
    try {
      return (localStorage.getItem('weather_unit_system') as UnitSystem) || 'metric';
    } catch {
      return 'metric';
    }
  });

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => {
    try {
      const saved = localStorage.getItem('weather_favorite_cities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);

  // Toggle unit system
  const handleToggleUnit = (newUnit: UnitSystem) => {
    setUnit(newUnit);
    try {
      localStorage.setItem('weather_unit_system', newUnit);
    } catch {}
  };

  // Toggle favorite status for current city
  const handleToggleFavorite = (city: GeoCity) => {
    const favKey = `${city.latitude.toFixed(2)},${city.longitude.toFixed(2)}`;
    const exists = favorites.some((f) => f.id === favKey);

    let updated: FavoriteCity[];
    if (exists) {
      updated = favorites.filter((f) => f.id !== favKey);
    } else {
      const newFav: FavoriteCity = {
        id: favKey,
        name: city.name,
        country: city.country,
        admin1: city.admin1,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
        addedAt: Date.now(),
      };
      updated = [newFav, ...favorites];
    }

    setFavorites(updated);
    try {
      localStorage.setItem('weather_favorite_cities', JSON.stringify(updated));
    } catch {}
  };

  const isCurrentFavorite = favorites.some(
    (f) => f.id === `${selectedCity.latitude.toFixed(2)},${selectedCity.longitude.toFixed(2)}`
  );

  // Load weather for selected city
  const loadWeather = async (city: GeoCity) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
      setSelectedCity(city);
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError(
        err.message ||
          `Unable to retrieve forecast for "${city.name}". Please verify the location or try again later.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Geolocation GPS button
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your current browser environment.');
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locCity = await reverseGeocode(lat, lon);
          await loadWeather(locCity);
        } catch (err: any) {
          setError('Failed to fetch weather for your exact GPS coordinates.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (geoErr) => {
        setIsLoadingLocation(false);
        let msg = 'Unable to access your current location.';
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          msg = 'Location permission was denied by browser. Search for your city in the search bar above.';
        }
        setError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // On initial mount: load default city
  useEffect(() => {
    loadWeather(DEFAULT_CITY);
  }, []);

  // Handle selecting city by name from error suggestions
  const handleSelectSuggestedCity = async (cityName: string) => {
    try {
      const results = await searchCities(cityName);
      if (results.length > 0) {
        loadWeather(results[0]);
      } else {
        loadWeather(DEFAULT_CITY);
      }
    } catch {
      loadWeather(DEFAULT_CITY);
    }
  };

  const isNight = weatherData ? weatherData.current.is_day === 0 : false;
  const weatherCode = weatherData ? weatherData.current.weather_code : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative pb-16 overflow-x-hidden">
      {/* Dynamic Ambient Background */}
      <WeatherBackground weatherCode={weatherCode} isNight={isNight} />

      {/* Main Header */}
      <Header
        currentCity={selectedCity}
        onSelectCity={(city) => loadWeather(city)}
        onUseLocation={handleUseLocation}
        isLoadingLocation={isLoadingLocation}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isCurrentFavorite}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />

      {/* Primary Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 relative z-10 space-y-8">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
              <RotateCw className="w-10 h-10 text-sky-400 animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Fetching Weather Intelligence</h3>
              <p className="text-xs text-slate-400">Loading current metrics & forecast for {selectedCity.name}...</p>
            </div>
          </div>
        )}

        {/* Error Fallback State */}
        {!isLoading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => loadWeather(selectedCity)}
            onSelectSuggestedCity={handleSelectSuggestedCity}
          />
        )}

        {/* Main Dashboard Layout */}
        {!isLoading && !error && weatherData && (
          <>
            {/* Hero Current Weather Section */}
            <CurrentWeatherCard weather={weatherData} unit={unit} />

            {/* 24-Hour Timeline */}
            <HourlyForecast weather={weatherData} unit={unit} />

            {/* Smart Activity & Lifestyle Recommendations */}
            <PlanningIntelligence weather={weatherData} unit={unit} />

            {/* Weather Analytics Charts */}
            <WeatherCharts weather={weatherData} unit={unit} />

            {/* 7-Day Forecast */}
            <DailyForecast weather={weatherData} unit={unit} />
          </>
        )}
      </main>

      {/* Saved Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectFavorite={(fav) => {
          loadWeather({
            id: Number(fav.id.replace(',', '')),
            name: fav.name,
            latitude: fav.latitude,
            longitude: fav.longitude,
            country: fav.country,
            admin1: fav.admin1,
            timezone: fav.timezone,
          });
        }}
        onRemoveFavorite={(id) => {
          const updated = favorites.filter((f) => f.id !== id);
          setFavorites(updated);
          try {
            localStorage.setItem('weather_favorite_cities', JSON.stringify(updated));
          } catch {}
        }}
      />
    </div>
  );
}
