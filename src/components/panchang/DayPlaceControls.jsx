import React, { useCallback, useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../../services/kundliApi'
import { t } from './labels'
import { isValidYmd, shiftYmd, todayYmd } from './format'
import { loadPlace, savePlace, toPlace } from './place'
import { IconPin } from '../ui/Icons'

/** Date + place state shared by the panchang and muhurat pages (place persisted in localStorage). */
export function usePlaceDate() {
  const [date, setDateRaw] = useState(() => {
    // Deep links (e.g. from the muhurat finder) may pin the day: /panchang?date=YYYY-MM-DD
    try { const d = new URLSearchParams(window.location.search).get('date'); if (isValidYmd(d)) return d } catch { /* no window */ }
    return todayYmd()
  })
  const [place, setPlaceRaw] = useState(loadPlace)
  const setDate = useCallback((d) => { if (isValidYmd(d)) setDateRaw(d) }, [])
  const setPlace = useCallback((p) => { setPlaceRaw(p); savePlace(p) }, [])
  return { date, setDate, place, setPlace }
}

/**
 * Date picker with previous / next / today controls and a city search box backed by
 * the Kundli API `/places` autocomplete. Stores {display_name, latitude, longitude, timezone}.
 */
export default function DayPlaceControls({ hi, date, setDate, place, setPlace }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const boxRef = useRef(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults([]); setBusy(false); setFailed(false); return undefined }
    const ctrl = new AbortController()
    setBusy(true); setFailed(false)
    const id = setTimeout(() => {
      searchPlaces(term, { limit: 8, signal: ctrl.signal })
        .then((rows) => { setResults(rows || []); setOpen(true); setCursor(-1) })
        .catch((e) => { if (e.name !== 'AbortError') { setResults([]); setFailed(true); setOpen(true) } })
        .finally(() => { if (!ctrl.signal.aborted) setBusy(false) })
    }, 280)
    return () => { clearTimeout(id); ctrl.abort() }
  }, [q])

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [])

  const choose = (r) => { setPlace(toPlace(r)); setQ(''); setResults([]); setOpen(false) }

  const onKey = (e) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => (c + 1) % results.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => (c - 1 + results.length) % results.length) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[cursor >= 0 ? cursor : 0]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const isToday = date === todayYmd()

  return (
    <div className="kd-card pv-controls">
      <div className="kd-card__body pv-controls__body">
        <div className="kd-fld">
          <label className="kd-fld__label" htmlFor="pv-date">{t('selectDate', hi)}</label>
          <div className="pv-datebar">
            <button type="button" className="pv-datebtn" onClick={() => setDate(shiftYmd(date, -1))} aria-label={t('prevDay', hi)}>‹</button>
            <input id="pv-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="button" className="pv-datebtn" onClick={() => setDate(shiftYmd(date, 1))} aria-label={t('nextDay', hi)}>›</button>
            <button type="button" className="pv-todaybtn" onClick={() => setDate(todayYmd())} disabled={isToday}>{t('today', hi)}</button>
          </div>
        </div>

        <div className="kd-fld" ref={boxRef}>
          <label className="kd-fld__label" htmlFor="pv-city">{t('selectCity', hi)}</label>
          <input
            id="pv-city" type="text" value={q} autoComplete="off"
            placeholder={place?.display_name || t('searchCity', hi)}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => { if (results.length || failed) setOpen(true) }}
            onKeyDown={onKey}
            role="combobox" aria-expanded={open} aria-controls="pv-city-list" aria-autocomplete="list"
          />
          {open && (q.trim().length >= 2) && (
            <ul className="kd-drop" id="pv-city-list" role="listbox">
              {busy && results.length === 0 && <li className="kd-hint" style={{ cursor: 'default' }}>{t('searching', hi)}</li>}
              {!busy && failed && <li className="kd-hint" style={{ cursor: 'default' }}>{t('searchFailed', hi)}</li>}
              {!busy && !failed && results.length === 0 && <li className="kd-hint" style={{ cursor: 'default' }}>{t('noResults', hi)}</li>}
              {results.map((r, i) => (
                <li key={`${r.display_name}-${r.latitude}-${r.longitude}`} role="option" aria-selected={i === cursor}
                  onMouseEnter={() => setCursor(i)} onClick={() => choose(r)}>
                  <span>{r.display_name}</span>
                  <small>{r.timezone || `${Number(r.latitude).toFixed(2)}, ${Number(r.longitude).toFixed(2)}`}</small>
                </li>
              ))}
            </ul>
          )}
          <span className="kd-pill pv-place">
            <IconPin s={14} /> {place?.display_name}
            {place?.timezone && <small>· {place.timezone}</small>}
          </span>
        </div>
      </div>
    </div>
  )
}
