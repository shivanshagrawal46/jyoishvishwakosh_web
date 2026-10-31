import { useEffect, useMemo, useState } from 'react'
import { fetchPanchangFull } from '../services/kundliApi'
import { loadPlace } from '../components/panchang/place'
import { spanLabel, todayYmd, untilText, whenLabel } from '../components/panchang/format'

/**
 * Today's panchang for a location from the Kundli API (`/api/v1/panchang/full`),
 * normalised into display-ready rows. Shared by the hero snapshot and the home
 * panchang card. Defaults to the place chosen on /panchang, else New Delhi.
 *
 * Returns { details, rows, highlights, nakshatraCharan, summary, loading, error }.
 */
export default function usePanchang({ language = 'hindi', lat, lon, timezone } = {}) {
  const saved = useMemo(() => loadPlace(), [])
  const latitude = lat ?? saved.latitude
  const longitude = lon ?? saved.longitude
  const tz = timezone ?? (lat == null && lon == null ? saved.timezone : undefined)
  const hi = language === 'hindi' || language === 'hi'

  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    fetchPanchangFull({ date: todayYmd(), latitude, longitude, timezone: tz || undefined, language: hi ? 'hi' : 'en' }, { signal: ctrl.signal })
      .then((data) => {
        if (!data) throw new Error('No data received')
        setPayload(data)
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message || 'Failed to load panchang') })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [latitude, longitude, tz, hi])

  const details = payload

  const rows = useMemo(() => {
    if (!details) return []
    const base = details.date
    // API v0.4 entries carry `until` ("upto 2:52 PM" / "14:52 तक") and `whole_day`; fall back to the ISO end.
    const withEnd = (name, it) => { const u = untilText(it, base, hi); return u ? `${name} ${u}` : name }
    const t1 = details.tithi?.[0], n1 = details.nakshatra?.[0], y1 = details.yoga?.[0], k1 = details.karana?.[0], lm = details.lunar_month || {}
    return [
      { key: 'tithi', label: 'Tithi', labelHi: 'तिथि', value: t1 ? withEnd(`${t1.paksha} ${t1.name}`, t1) : '' },
      { key: 'paksha', label: 'Paksha', labelHi: 'पक्ष', value: details.paksha || '' },
      { key: 'month', label: 'Month', labelHi: 'मास', value: lm.purnimanta ? `${lm.purnimanta} (${hi ? 'पूर्णिमांत' : 'Purnimanta'}) · ${lm.amanta} (${hi ? 'अमांत' : 'Amanta'})${lm.adhik ? (hi ? ' · अधिक' : ' · Adhik') : ''}` : '' },
      { key: 'nakshatra', label: 'Nakshatra', labelHi: 'नक्षत्र', value: n1 ? withEnd(n1.name, n1) : '' },
      { key: 'yoga', label: 'Yoga', labelHi: 'योग', value: y1 ? withEnd(y1.name, y1) : '' },
      { key: 'ayana', label: 'Ayana', labelHi: 'अयन', value: details.ayana?.vedic || '' },
      { key: 'rashi', label: 'Rashi', labelHi: 'चंद्र राशि', value: details.moon_sign ? withEnd(details.moon_sign, { end: details.moon_sign_until }) : '' },
      { key: 'karana', label: 'Karana', labelHi: 'करण', value: k1 ? withEnd(k1.name, k1) : '' },
    ].filter((r) => r.value)
  }, [details, hi])

  const nakshatraCharan = useMemo(() => (
    (details?.nakshatra_pada || []).map((x) => ({ pada: x.pada, nakshatra: x.nakshatra, samay: whenLabel(x.end, details.date, hi) }))
  ), [details, hi])

  const summary = useMemo(() => {
    if (!details) return ''
    const t1 = details.tithi?.[0], n1 = details.nakshatra?.[0]
    return [
      details.lunar_month?.purnimanta && `${details.lunar_month.purnimanta} ${hi ? 'मास' : 'month'}`,
      details.paksha && `${details.paksha} ${hi ? 'पक्ष' : 'Paksha'}`,
      t1?.name, details.vara?.name, n1?.name,
    ].filter(Boolean).join(', ')
  }, [details, hi])

  /** The four rows worth showing in the hero snapshot. */
  const highlights = useMemo(() => {
    if (!details) return []
    const t1 = details.tithi?.[0], n1 = details.nakshatra?.[0], y1 = details.yoga?.[0]
    return [
      { label: 'Tithi', labelHi: 'तिथि', value: t1 ? `${t1.paksha} ${t1.name}` : '' },
      { label: 'Nakshatra', labelHi: 'नक्षत्र', value: n1?.name || '' },
      { label: 'Yoga', labelHi: 'योग', value: y1?.name || '' },
      { label: 'Rahu Kaal', labelHi: 'राहु काल', value: details.rahu_kaal ? spanLabel(details.rahu_kaal, details.date, hi) : '' },
    ].filter((r) => r.value)
  }, [details, hi])

  return { details, rows, highlights, nakshatraCharan, summary, loading, error }
}
