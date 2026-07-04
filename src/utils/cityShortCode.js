// A handful of well-known cities have a "canonical" short form that isn't
// derivable from the name itself (NY, BOM's old "Bombay" airport code, etc).
// Everything else falls back to a simple, predictable scheme: first three
// letters of the name with whitespace stripped. That won't match every
// city's colloquial abbreviation, but it's a reasonable default without
// shipping an exhaustive worldwide lookup table.
const CITY_CODE_OVERRIDES = {
  'new york': 'NY',
  'los angeles': 'LA',
  'san francisco': 'SF',
  'las vegas': 'LV',
  'washington': 'DC',
  'washington dc': 'DC',
  'mumbai': 'BOM',
  'bombay': 'BOM',
  'delhi': 'DEL',
  'new delhi': 'DEL',
  'bengaluru': 'BLR',
  'bangalore': 'BLR',
  'kolkata': 'CCU',
  'calcutta': 'CCU',
  'chennai': 'MAA',
  'madras': 'MAA',
  'hyderabad': 'HYD',
  'hong kong': 'HK',
  'rio de janeiro': 'RIO',
  'sao paulo': 'SP',
  'dubai': 'DXB',
  'abu dhabi': 'AUH',
  'saint petersburg': 'SPB',
  'st petersburg': 'SPB',
};

export function getCityShortCode(name) {
  if (!name) return '';
  const normalized = name.trim().toLowerCase();
  if (CITY_CODE_OVERRIDES[normalized]) return CITY_CODE_OVERRIDES[normalized];

  const compact = name.replace(/[^a-zA-Z]/g, '');
  return (compact.slice(0, 3) || name.slice(0, 3)).toUpperCase();
}
