/** Chosen panchang place, shared by the panchang / muhurat pages and the home widgets. */

export const DEFAULT_PLACE = Object.freeze({
  display_name: 'New Delhi, Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
})

const KEY = 'jv-panchang-place'

const isPlace = (p) => p && typeof p.latitude === 'number' && typeof p.longitude === 'number' && typeof p.display_name === 'string'

export function loadPlace() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PLACE
    const p = JSON.parse(raw)
    return isPlace(p) ? p : DEFAULT_PLACE
  } catch {
    return DEFAULT_PLACE
  }
}

export function savePlace(p) {
  try {
    if (isPlace(p)) localStorage.setItem(KEY, JSON.stringify({ display_name: p.display_name, latitude: p.latitude, longitude: p.longitude, timezone: p.timezone || null }))
  } catch { /* storage unavailable */ }
}

/** Normalise a /places result into the stored shape. */
export const toPlace = (r) => ({
  display_name: r.display_name || [r.name, r.state, r.country].filter(Boolean).join(', '),
  latitude: Number(r.latitude),
  longitude: Number(r.longitude),
  timezone: r.timezone || null,
})

/** Short city name for compact captions ("New Delhi"). */
export const shortName = (p) => (p?.display_name || '').split(',')[0].trim()
