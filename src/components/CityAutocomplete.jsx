import { useState, useRef, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export default function CityAutocomplete() {
  const { city, setCity, selectCity } = useWeather();

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Uncontrolled by design, same as before: keyed on `city` so the field
  // resets to the latest stored value whenever it changes externally.
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const searchIdRef = useRef(0);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    const handleDocMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleDocMouseDown);
    return () => document.removeEventListener('mousedown', handleDocMouseDown);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const searchCities = async (query) => {
    const searchId = ++searchIdRef.current;
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (searchId !== searchIdRef.current) return; // a newer keystroke superseded this search
      setSuggestions(json.results || []);
    } catch {
      if (searchId !== searchIdRef.current) return;
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setHighlightedIndex(-1);
    clearTimeout(debounceRef.current);

    if (value.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    debounceRef.current = setTimeout(() => searchCities(value.trim()), DEBOUNCE_MS);
  };

  const commitFreeText = () => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    const trimmed = inputRef.current.value.trim();
    if (trimmed !== city) setCity(trimmed);
  };

  const selectSuggestion = (place) => {
    justSelectedRef.current = true;
    selectCity(place);
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (suggestions.length) {
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      if (suggestions.length) {
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectSuggestion(suggestions[highlightedIndex]);
      } else {
        commitFreeText();
      }
      setShowDropdown(false);
      e.target.blur();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  return (
    <div className="city-autocomplete" ref={wrapperRef}>
      <input
        key={city}
        ref={inputRef}
        type="text"
        className="settings-text-input"
        placeholder="e.g. Dar es Salaam"
        defaultValue={city}
        onChange={handleChange}
        onBlur={commitFreeText}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length) setShowDropdown(true); }}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown && suggestions.length > 0}
        aria-autocomplete="list"
        id="setting-weather-city"
        aria-label="Weather city"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="city-suggestions" role="listbox">
          {suggestions.map((place, i) => (
            <li
              key={`${place.id ?? place.name}-${place.latitude}-${place.longitude}`}
              role="option"
              aria-selected={i === highlightedIndex}
              className={`city-suggestion ${i === highlightedIndex ? 'highlighted' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(i)}
              onClick={() => selectSuggestion(place)}
            >
              <span className="city-suggestion-name">{place.name}</span>
              <span className="city-suggestion-region">
                {[place.admin1, place.country].filter(Boolean).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
