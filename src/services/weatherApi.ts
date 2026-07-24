import { GeoCity, WeatherData } from '../types';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(query: string): Promise<GeoCity[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Geocoding failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      country_code: item.country_code,
      country: item.country,
      admin1: item.admin1,
      admin2: item.admin2,
      timezone: item.timezone || 'auto',
      population: item.population,
    }));
  } catch (err: any) {
    console.error('Error searching cities:', err);
    throw new Error(err.message || 'Unable to fetch matching cities. Please check your network connection.');
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoCity> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      const admin1 = data.principalSubdivision || '';
      return {
        id: Math.floor(lat * 1000 + lon * 1000),
        name: city,
        latitude: lat,
        longitude: lon,
        country,
        admin1,
        timezone: 'auto',
      };
    }
  } catch {
    // Fallback if reverse geocode fails
  }

  return {
    id: Math.floor(lat * 1000 + lon * 1000),
    name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
  };
}

export async function fetchWeatherData(city: GeoCity): Promise<WeatherData> {
  try {
    const params = new URLSearchParams({
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'dew_point_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'pressure_msl',
        'cloud_cover',
        'visibility',
        'wind_speed_10m',
        'uv_index',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'rain_sum',
        'showers_sum',
        'snowfall_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
      ].join(','),
      timezone: city.timezone && city.timezone !== 'auto' ? city.timezone : 'auto',
    });

    const url = `${FORECAST_API_URL}?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Weather forecast API failed with status code ${res.status}`);
    }

    const data = await res.json();

    if (!data.current || !data.hourly || !data.daily) {
      throw new Error('Incomplete weather payload received from API server.');
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      timezone: data.timezone,
      timezone_abbreviation: data.timezone_abbreviation,
      current: data.current,
      hourly: data.hourly,
      daily: data.daily,
      city,
    };
  } catch (err: any) {
    console.error('Failed to load weather data:', err);
    throw new Error(err.message || 'Unable to retrieve weather forecast for the selected city.');
  }
}
