/**
 * Client for the Kundli API (FastAPI + Swiss Ephemeris, repo: kundli_api).
 *
 * Development: Vite proxies `/kundli-api/*` to http://127.0.0.1:8000 (vite.config.js).
 * Production:  set VITE_KUNDLI_API_BASE_URL (e.g. https://kundli.jyotishvishwakosh.in),
 *              or put the API behind the same origin at /kundli-api.
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
