import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const WeatherContext = createContext();

const LOCATION_STORAGE_KEY = 'focusflow-weather-location';
const CACHE_TTL_MS = 10 * 60 * 1000;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// Open-Meteo reports current conditions as a numeric WMO weather code rather
// than free text. Mapped to short descriptions here so the existing
// keyword-based icon picker in WeatherWidget.jsx keeps working unchanged.
const WMO_CONDITIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function loadStoredLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredLocation(loc) {
  if (!loc) {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } else {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  }
}

// Versioned so switching data sources/shapes never serves a stale entry
// shaped by a previous version of this context.
function cacheKey(key) {
  return `focusflow-weather-cache-v4-${key}`;
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(cacheKey(key));
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  localStorage.setItem(cacheKey(key), JSON.stringify({ data, timestamp: Date.now() }));
}

function formatPlaceLabel(place) {
  const parts = [place.name];
  if (place.admin1 && place.admin1 !== place.name) parts.push(place.admin1);
  if (place.country) parts.push(place.country);
  return parts.join(', ');
}

export function WeatherProvider({ children }) {
  // location: { label, query, lat, lon, region, country } | null
  // lat/lon are only present once the user has picked an exact suggestion —
  // free-text entries carry query only and get geocoded by name on fetch.
  const [location, setLocationState] = useState(loadStoredLocation);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const requestIdRef = useRef(0);

  const fetchWeather = useCallback(async (loc) => {
    if (!loc || !loc.query) {
      requestIdRef.current += 1;
      setWeather(null);
      setStatus('idle');
      setErrorMessage('');
      return;
    }

    const hasCoords = loc.lat != null && loc.lon != null;
    const queryKey = hasCoords
      ? `${loc.lat.toFixed(3)},${loc.lon.toFixed(3)}`
      : loc.query.trim().toLowerCase();

    // Switching to a different place must never keep showing the previous
    // one's reading — only a same-place background refresh should preserve
    // the last-known-good data while the new request is in flight.
    setWeather(prev => (prev && prev._query !== queryKey ? null : prev));

    const cached = readCache(queryKey);
    if (cached) {
      setWeather(cached);
      setStatus('success');
      setErrorMessage('');
      return;
    }

    const requestId = ++requestIdRef.current;
    setStatus('loading');
    try {
      let place;
      if (hasCoords) {
        place = { name: loc.query, latitude: loc.lat, longitude: loc.lon, admin1: loc.region, country: loc.country };
      } else {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(loc.query)}&count=1&language=en&format=json`
        );
        if (!geoRes.ok) throw new Error(`City lookup failed (${geoRes.status})`);
        const geoJson = await geoRes.json();
        place = geoJson.results?.[0];
        if (!place) throw new Error(`Couldn't find "${loc.query}" — try a different spelling`);
      }

      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
      );
      if (!forecastRes.ok) throw new Error(`Weather lookup failed (${forecastRes.status})`);
      const forecastJson = await forecastRes.json();
      const current = forecastJson.current;
      if (!current) throw new Error('No weather data returned');

      const data = {
        _query: queryKey,
        tempC: Math.round(current.temperature_2m),
        feelsLikeC: Math.round(current.apparent_temperature),
        condition: WMO_CONDITIONS[current.weather_code] || 'Unknown',
        humidity: current.relative_humidity_2m,
        windKmph: Math.round(current.wind_speed_10m),
        isDay: current.is_day === 1,
        resolvedName: place.name,
        region: place.admin1 || '',
        country: place.country || '',
      };

      if (requestId !== requestIdRef.current) return; // a newer request has superseded this one

      setWeather(data);
      setStatus('success');
      setErrorMessage('');
      writeCache(queryKey, data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setStatus('error');
      setErrorMessage(err.message || 'Could not load weather');
    }
  }, []);

  // Free-text commit: user typed a city and pressed Enter/blurred without
  // picking a suggestion. Falls back to geocoding by name on fetch.
  const setCity = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setLocationState(null);
      saveStoredLocation(null);
      return;
    }
    const loc = { label: trimmed, query: trimmed, lat: null, lon: null, region: '', country: '' };
    setLocationState(loc);
    saveStoredLocation(loc);
  };

  // Precise commit: user picked an exact suggestion from the autocomplete
  // dropdown, so we already have coordinates and don't need to re-geocode.
  const selectCity = (place) => {
    const loc = {
      label: formatPlaceLabel(place),
      query: place.name,
      lat: place.latitude,
      lon: place.longitude,
      region: place.admin1 || '',
      country: place.country || '',
    };
    setLocationState(loc);
    saveStoredLocation(loc);
  };

  // Fetch whenever the location changes
  useEffect(() => {
    fetchWeather(location);
  }, [location, fetchWeather]);

  // Periodically refresh the current location while the app stays open
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => fetchWeather(location), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [location, fetchWeather]);

  return (
    <WeatherContext.Provider value={{
      city: location?.label || '',
      setCity,
      selectCity,
      weather,
      status,
      errorMessage,
      refresh: () => fetchWeather(location),
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
