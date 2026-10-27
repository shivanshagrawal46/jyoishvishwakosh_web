/** Date/time helpers shared by the tool pages. All inputs are API strings. */

const pad = (n) => String(n).padStart(2, '0')

/** Local calendar date as 'YYYY-MM-DD' (not UTC — the user's own day). */
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 'YYYY-MM-DD' or ISO datetime → localized date. */
export const fmtDate = (iso, hi, { short = false, weekday = false, year = true } = {}) => {
  if (!iso || typeof iso !== 'string') return '-'
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: short ? 'short' : 'long', ...(year ? { year: 'numeric' } : {}), ...(weekday ? { weekday: 'long' } : {}),
  })
}

/** 'HH:MM' or 'HH:MM:SS' → 12-hour clock. */
export const fmtTime = (hms) => {
  if (!hms || typeof hms !== 'string') return '-'
  const [h, m] = hms.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return hms
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`
}

/** ISO datetime → 12-hour clock of its local part. */
export const clock = (iso) => (iso && typeof iso === 'string' && iso.length >= 16 ? fmtTime(iso.slice(11, 16)) : '-')

/** ISO datetime → 'd MMM, h:mm AM'. */
export const fmtDateTime = (iso, hi) => (iso ? `${fmtDate(iso, hi, { short: true, year: false })}, ${clock(iso)}` : '-')

/** Short localized month name of an ISO date ('Oct' / 'अक्तू॰'). */
export const monthShort = (iso, hi) => {
  if (!iso || typeof iso !== 'string') return ''
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { month: 'short' })
}

/** Day-of-month from 'YYYY-MM-DD'. */
export const dayOf = (iso) => (iso ? String(Number(iso.slice(8, 10))) : '')

/** Minutes → 'Xh Ym' / 'Ym'. */
export const fmtMinutes = (min, hi) => {
  if (min == null || Number.isNaN(Number(min))) return ''
  const m = Math.round(Number(min)), h = Math.floor(m / 60), r = m % 60
  if (h === 0) return `${r} ${hi ? 'मिनट' : 'min'}`
  return `${h} ${hi ? 'घं' : 'h'} ${r ? `${r} ${hi ? 'मि' : 'm'}` : ''}`.trim()
}

/** Safe number display: never renders NaN/undefined. */
export const num = (v, digits = 0) => (v == null || Number.isNaN(Number(v)) ? '-' : Number(v).toFixed(digits).replace(/\.0+$/, ''))

/** Read a positive float search param, or undefined. */
export const numParam = (params, key) => {
  const v = params.get(key)
  if (v == null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
