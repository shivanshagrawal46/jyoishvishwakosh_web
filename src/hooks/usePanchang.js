import { useEffect, useMemo, useState } from 'react'
import { fetchPanchangData } from '../services/api'

const BHOPAL = { lat: 23.2599, lon: 77.4126 }

/** The API has shipped several response shapes; unwrap whichever we got. */
function unwrapDetails(payload) {
  if (!payload || typeof payload !== 'object') return null
  return (
    payload.details
    || payload.response?.details
    || payload.data?.details
    || payload.response
    || payload.data
    || payload
  )
}

/** Reads a field tolerating camelCase / UPPER / lower spellings, plus its time. */
function readField(details, key, altKey, samayKey) {
  if (!details) return ''
  const candidates = [key, altKey, key.charAt(0).toLowerCase() + key.slice(1), key.toUpperCase(), key.toLowerCase()]
  let value = ''
  for (const c of candidates) {
    if (!c) continue
    const v = details[c]
    if (v !== null && v !== undefined && v !== '') {
      value = typeof v === 'object' ? '' : String(v).trim()
      if (value) break
    }
  }
  if (!value) return ''

  if (samayKey) {
    const samay = details[samayKey] ?? details[samayKey.toLowerCase()]
    if (samay !== null && samay !== undefined && String(samay).trim() !== '') {
      return `${value} ${String(samay).trim()}`.trim()
    }
  }
  return value
}

const MAIN_FIELDS = [
  { key: 'tithi',     label: 'Tithi',      labelHi: 'तिथि',     samay: 'tithiSamay' },
  { key: 'paksha',    label: 'Paksha',     labelHi: 'पक्ष' },
  { key: 'solarMaah', label: 'Solar Maah', labelHi: 'सौर मास',  alt: 'day' },
  { key: 'nakshatra', label: 'Nakshatra',  labelHi: 'नक्षत्र',   samay: 'nakshatraSamay' },
  { key: 'yoga',      label: 'Yoga',       labelHi: 'योग',      samay: 'yogaSamay' },
  { key: 'ayan',      label: 'Ayan',       labelHi: 'अयन' },
  { key: 'rashi',     label: 'Rashi',      labelHi: 'राशि',     samay: 'rashiSamay' },
  { key: 'karan',     label: 'Karan',      labelHi: 'करण',      samay: 'karanSamay' },
]

/**
 * Today's panchang for a location (Bhopal by default), normalized into
 * display-ready rows. Shared by the hero snapshot and the full panchang card.
 */
export default function usePanchang({ language = 'hindi', lat = BHOPAL.lat, lon = BHOPAL.lon } = {}) {
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPanchangData({ date: new Date(), lat, lon, language })
      .then((data) => {
        if (cancelled) return
        if (!data) throw new Error('No data received')
        setPayload(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load panchang')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [lat, lon, language])

  const details = useMemo(() => unwrapDetails(payload), [payload])

  const rows = useMemo(() => (
    MAIN_FIELDS
      .map((f) => ({
        key: f.key,
        label: f.label,
        labelHi: f.labelHi,
        value: readField(details, f.key, f.alt, f.samay),
      }))
      .filter((r) => r.value)
  ), [details])

  const nakshatraCharan = useMemo(() => {
    if (!details) return []
    return ['padaSamay', 'padaSamay2', 'padaSamay3', 'padaSamay4']
      .map((key, i) => {
        const samay = details[key]
        if (!samay) return null
        const base = parseInt(details.pada || 1, 10)
        return {
          pada: (base + i) % 4 || 4,
          nakshatra: i < 5 - base ? details.nakshatra : (details.nakshatra2 || details.nakshatra),
          samay,
        }
      })
      .filter(Boolean)
  }, [details])

  const summary = useMemo(() => {
    if (!details) return ''
    return [
      details.purnimantMaah || details.solarMaah || details.maas || details.month,
      details.paksha,
      details.tithi,
      details.hinduDay || details.day || details.vaar,
      details.nakshatra,
    ].filter(Boolean).join(', ')
  }, [details])

  /** The four rows worth showing in the hero snapshot. */
  const highlights = useMemo(() => {
    if (!details) return []
    return [
      { label: 'Tithi',     labelHi: 'तिथि',      value: readField(details, 'tithi') },
      { label: 'Nakshatra', labelHi: 'नक्षत्र',    value: readField(details, 'nakshatra') },
      { label: 'Yoga',      labelHi: 'योग',       value: readField(details, 'yoga') },
      {
        label: 'Rahu Kaal', labelHi: 'राहु काल',
        value: readField(details, 'rahuKaal', 'rahukaal') || readField(details, 'rahu'),
      },
    ].filter((r) => r.value)
  }, [details])

  return { details, rows, highlights, nakshatraCharan, summary, loading, error }
}
