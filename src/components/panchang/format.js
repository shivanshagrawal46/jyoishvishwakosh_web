/**
 * Time / date helpers for Kundli-API panchang payloads.
 *
 * The API returns local ISO strings without a timezone (`2024-10-31T15:53:23`)
 * plus panchang-style clocks that run past 24:00 for after-midnight moments
 * (`30:33` = 06:33 next morning, `13:16 (-1)` = 13:16 the previous day) and
 * ghati-pala counted from sunrise.
 */

export const pad2 = (n) => String(n).padStart(2, '0')

export const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const todayYmd = () => ymd(new Date())
export const shiftYmd = (s, days) => {
  const [y, m, d] = s.split('-').map(Number)
  return ymd(new Date(y, m - 1, d + days))
}
export const isValidYmd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(new Date(`${s}T00:00:00`).getTime())

/** Long weekday-date label: "गुरुवार, 31 अक्टूबर 2024". */
export const fmtDate = (s, hi, opts = {}) => {
  if (!s) return '-'
  const d = new Date(`${s.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', ...opts })
}
export const fmtDateShort = (s, hi) => fmtDate(s, hi, { month: 'short' })

/** "9 जून 2025, 17:42" from a local ISO string. */
export const fmtDateTime = (iso, hi) => {
  if (!iso) return '-'
  return `${fmtDateShort(iso, hi)}, ${iso.slice(11, 16)}`
}

/** Wall clock "HH:MM" straight from a local ISO string. */
export const hhmm = (iso) => (iso ? iso.slice(11, 16) : '-')

/** Parse a panchang clock. '30:33' → {text:'30:33', wall:'06:33', shift:1}; '13:16 (-1)' → shift -1. */
export function splitClock(c) {
  if (!c) return null
  const m = String(c).match(/^(\d{1,2}):(\d{2})(?:\s*\((-?\d+)\))?$/)
  if (!m) return { text: String(c), wall: null, shift: 0 }
  const h = Number(m[1])
  let shift = m[3] ? Number(m[3]) : 0
  let wall = null
  if (h >= 24) { shift += Math.floor(h / 24); wall = `${pad2(h % 24)}:${m[2]}` }
  return { text: `${pad2(h)}:${m[2]}`, wall, shift }
}

/** Display form: "15:53", "30:33 (अगले दिन 06:33)", "13:16 (पिछले दिन)". */
export function clockLabel(c, hi) {
  const s = splitClock(c)
  if (!s) return '-'
  if (s.shift > 0) return `${s.text} (${hi ? 'अगले दिन' : 'next day'} ${s.wall || s.text})`
  if (s.shift < 0) return `${s.text} (${hi ? 'पिछले दिन' : 'previous day'})`
  return s.text
}

/** Panchang clock derived from an ISO moment relative to the panchang date ('30:33' after midnight). */
export function isoClock(iso, baseYmd) {
  if (!iso) return null
  const day = iso.slice(0, 10)
  let h = Number(iso.slice(11, 13))
  const mm = iso.slice(14, 16)
  if (baseYmd && day !== baseYmd) {
    const diff = Math.round((new Date(`${day}T00:00:00`) - new Date(`${baseYmd}T00:00:00`)) / 86400000)
    if (diff > 0) h += 24 * diff
    else return `${pad2(h)}:${mm} (${diff})`
  }
  return `${pad2(h)}:${mm}`
}

/** Start / end clocks of a window object, preferring the API's own clock strings. */
export const winClocks = (w, baseYmd) => ({
  s: w?.start_clock || isoClock(w?.start, baseYmd),
  e: w?.end_clock || isoClock(w?.end, baseYmd),
})

/** "15:53 – 17:32" with next/previous-day annotations. */
export function rangeLabel(w, hi, baseYmd) {
  if (!w) return '-'
  const { s, e } = winClocks(w, baseYmd)
  return `${clockLabel(s, hi)} – ${clockLabel(e, hi)}`
}

/** Ghati-pala as "23 घटी 23 पल" / "23 gh 23 pal". */
export const gp = (g, hi) => (g && typeof g.ghati === 'number' ? (hi ? `${g.ghati} घटी ${g.pala} पल` : `${g.ghati} gh ${g.pala} pal`) : '')

/** 11.074 hours → "11h 04m". */
export const hoursLabel = (h) => {
  if (typeof h !== 'number') return ''
  const H = Math.floor(h), M = Math.round((h - H) * 60)
  return `${H}h ${pad2(M)}m`
}

export const minutesBetween = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 60000) : 0)

/** "1 घं 12 मि" / "1h 12m" from minutes. */
export const durationLabel = (min, hi) => {
  if (!min && min !== 0) return ''
  const H = Math.floor(min / 60), M = min % 60
  if (hi) return H ? `${H} घं ${M} मि` : `${M} मि`
  return H ? `${H}h ${M}m` : `${M}m`
}

/** Current wall time in a timezone as a local ISO string, comparable to API strings. */
export function nowIsoIn(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz || undefined, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date())
    const g = (type) => parts.find((p) => p.type === type)?.value || '00'
    const h = g('hour') === '24' ? '00' : g('hour')
    return `${g('year')}-${g('month')}-${g('day')}T${h}:${g('minute')}:${g('second')}`
  } catch {
    return null
  }
}

export const isCurrent = (w, nowIso) => Boolean(nowIso && w?.start && w?.end && w.start <= nowIso && nowIso < w.end)

/** Choghadiya / activity tone from API quality ids and scores. */
export const qualityTone = (q) => (q === 'good' ? 'good' : q === 'bad' ? 'bad' : 'mid')
export const scoreTone = (s) => (s >= 75 ? 'good' : s >= 50 ? 'warn' : 'bad')
