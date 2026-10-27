/**
 * Client for the Kundli API (FastAPI + Swiss Ephemeris, repo: kundli_api).
 *
 * The API runs on the server at http://139.59.39.65:47821 (systemd: kundli-api.service).
 *
 * Development: Vite proxies `/kundli-api/*` to that server (vite.config.js).
 * Production:  nginx for jyotishvishwakosh.com proxies `/kundli-api/*` to 127.0.0.1:47821,
 *              so the HTTPS site calls it same-origin (no mixed-content block, no CORS).
 *              Set VITE_KUNDLI_API_BASE_URL only to override this with a different host.
 */

const isDev = () => {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === ''
}

export const KUNDLI_API_BASE_URL = (() => {
  const env = import.meta.env.VITE_KUNDLI_API_BASE_URL
  if (env) return env.replace(/\/$/, '')
  return '/kundli-api'
})()

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${KUNDLI_API_BASE_URL}${path}`, {
    method,
    signal,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch { /* non-JSON error body */ }
  if (!res.ok) {
    const detail = data?.detail
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => d.msg?.replace(/^Value error, /, '')).filter(Boolean).join('; ')
        : `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return data
}

/** City autocomplete. Returns [{ display_name, latitude, longitude, timezone, match, ... }]. */
export const searchPlaces = (q, { limit = 8, countryCode, signal } = {}) => {
  const params = new URLSearchParams({ q, limit: String(limit) })
  if (countryCode) params.set('country_code', countryCode)
  return request(`/api/v1/places?${params}`, { signal }).then((d) => d.results || [])
}

/**
 * Full Kundli. `payload` = { name, gender, date: 'YYYY-MM-DD', time: 'HH:MM', place,
 * latitude?, longitude?, timezone?, ayanamsa?, node_type?, include_outer_planets?, dasha_levels? }
 */
export const fetchKundli = (payload, { signal } = {}) =>
  request('/api/v1/kundli', { method: 'POST', body: payload, signal })

/** Sub-periods under a lord path: [] mahadashas, ['Rahu'] antardashas ... up to 4 lords (prana). */
export const fetchDashaPeriods = (payload, path = [], { signal } = {}) =>
  request('/api/v1/dasha/periods', { method: 'POST', body: { ...payload, path }, signal })

export const fetchKundliHealth = () => request('/health')

/* ───────────── Panchang / Muhurat / Festivals / Matching (Kundli API v0.3) ───────────── */

const qs = (params) => {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)) })
  return p.toString()
}

/**
 * Full-day panchang. `opts` = { date: 'YYYY-MM-DD', latitude, longitude, timezone?, place?, language: 'hi'|'en', ayanamsa?, sunrise_method? }
 * Either latitude+longitude or place is required.
 */
export const fetchPanchangFull = (opts, { signal } = {}) => request(`/api/v1/panchang/full?${qs(opts)}`, { signal })

/** Muhurat windows of one day. Same options as fetchPanchangFull. */
export const fetchMuhuratDay = (opts, { signal } = {}) => request(`/api/v1/muhurat?${qs(opts)}`, { signal })

/** Auspicious days for an activity. `opts` adds { activity, days (1-366), min_score? }. */
export const fetchMuhuratFind = (opts, { signal } = {}) => request(`/api/v1/muhurat/find?${qs(opts)}`, { signal })

/** Vrat / Parv calendar. `opts` = { year, month?, latitude, longitude | place, timezone?, language, include_monthly? } */
export const fetchFestivals = (opts, { signal } = {}) => request(`/api/v1/festivals?${qs(opts)}`, { signal })

/** Kundli matching. `boy` / `girl` are KundliRequest payloads (same shape as fetchKundli). */
export const fetchMatching = (boy, girl, language = 'en', { signal } = {}) =>
  request('/api/v1/matching', { method: 'POST', body: { boy, girl, language }, signal })

/** Muhurat activity ids -> labels (from /api/v1/ephemeris). */
export const fetchMuhuratActivities = () => request('/api/v1/ephemeris').then((d) => d.muhurat_activities || {})
