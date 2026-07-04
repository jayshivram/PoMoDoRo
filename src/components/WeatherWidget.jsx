import { useWeather } from '../context/WeatherContext';
import {
  WiDaySunny, WiDayCloudy, WiDayFog, WiDayRain, WiDaySnow, WiDayThunderstorm,
  WiNightClear, WiNightAltCloudy, WiNightFog, WiNightAltRain, WiNightAltSnow, WiNightAltThunderstorm,
} from 'react-icons/wi';
import { FiMapPin } from 'react-icons/fi';
import { getCityShortCode } from '../utils/cityShortCode';

function WeatherConditionIcon({ condition = '', isDay = true, className }) {
  const lower = condition.toLowerCase();

  if (lower.includes('thunder')) {
    return isDay ? <WiDayThunderstorm className={className} /> : <WiNightAltThunderstorm className={className} />;
  }
  if (['snow', 'sleet', 'ice', 'blizzard'].some(k => lower.includes(k))) {
    return isDay ? <WiDaySnow className={className} /> : <WiNightAltSnow className={className} />;
  }
  if (['rain', 'drizzle', 'shower'].some(k => lower.includes(k))) {
    return isDay ? <WiDayRain className={className} /> : <WiNightAltRain className={className} />;
  }
  if (['fog', 'mist', 'haze'].some(k => lower.includes(k))) {
    return isDay ? <WiDayFog className={className} /> : <WiNightFog className={className} />;
  }
  if (lower.includes('overcast') || lower.includes('cloud')) {
    return isDay ? <WiDayCloudy className={className} /> : <WiNightAltCloudy className={className} />;
  }
  if (lower.includes('clear') || lower.includes('sunny')) {
    return isDay ? <WiDaySunny className={className} /> : <WiNightClear className={className} />;
  }
  return isDay ? <WiDayCloudy className={className} /> : <WiNightAltCloudy className={className} />;
}

export default function WeatherWidget({ onOpenSettings }) {
  const { city, weather, status, errorMessage } = useWeather();

  if (!city) {
    return (
      <button
        type="button"
        className="navbar-btn weather-widget weather-widget-empty"
        onClick={onOpenSettings}
        title="Set a city in Settings to see weather here"
        aria-label="Set a city to show weather"
        id="weather-widget"
      >
        <FiMapPin />
      </button>
    );
  }

  if (status === 'loading' && !weather) {
    return (
      <div
        className="navbar-btn weather-widget weather-widget-loading"
        title="Loading weather…"
        aria-label="Loading weather"
        id="weather-widget"
      >
        <WiDayCloudy className="weather-icon weather-pulse" />
      </div>
    );
  }

  if (status === 'error' && !weather) {
    return (
      <button
        type="button"
        className="navbar-btn weather-widget weather-widget-error"
        onClick={onOpenSettings}
        title={errorMessage || 'Could not load weather — check the city in Settings'}
        aria-label="Weather unavailable"
        id="weather-widget"
      >
        <FiMapPin />
      </button>
    );
  }

  if (!weather) return null;

  // Disambiguate same-named places (e.g. multiple "Springfield"s) by
  // including the region alongside the resolved city name.
  const place = weather.region && weather.region !== weather.resolvedName
    ? `${weather.resolvedName}, ${weather.region}`
    : weather.resolvedName;

  return (
    <button
      type="button"
      className="navbar-btn weather-widget"
      onClick={onOpenSettings}
      title={`${weather.condition}, feels like ${weather.feelsLikeC}°C — ${place}`}
      aria-label={`Weather in ${place}: ${weather.condition}, ${weather.tempC} degrees Celsius`}
      id="weather-widget"
    >
      <WeatherConditionIcon condition={weather.condition} isDay={weather.isDay} className="weather-icon" />
      <span className="weather-city-full">{weather.resolvedName}</span>
      <span className="weather-city-short">{getCityShortCode(weather.resolvedName)}</span>
      <span className="weather-temp">{weather.tempC}°</span>
    </button>
  );
}
