import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import { t } from '../components/kundli/kundliLabels'
import { FormCard, SplitHero } from '../components/tools/jt'
import { IconChart, IconClock, IconPin, IconSparkle, IconZodiac } from '../components/ui/Icons'
import { searchPlaces } from '../services/kundliApi'
import '../styles/kundli.css'
import '../styles/jyotish-tools.css'

export const FORM_KEY = 'jv-kundli-form'
const EMPTY = {
  name: '', gender: 'male', date: '', time: '', place: '', placeMeta: null,
  ayanamsa: 'lahiri', node_type: 'mean', include_outer_planets: true,
}

const loadForm = () => {
  try {
    const raw = localStorage.getItem(FORM_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch { return EMPTY }
}

/** Build the report URL so a result is bookmarkable and survives refresh. */
export function reportSearch(form) {
  const p = new URLSearchParams()
  if (form.name.trim()) p.set('name', form.name.trim())
  p.set('gender', form.gender)
  p.set('date', form.date)
  p.set('time', form.time.length === 5 ? `${form.time}:00` : form.time)
  p.set('place', form.placeMeta?.display_name || form.place.trim())
  if (form.placeMeta) {
    p.set('lat', String(form.placeMeta.latitude))
    p.set('lon', String(form.placeMeta.longitude))
    if (form.placeMeta.timezone) p.set('tz', form.placeMeta.timezone)
  }
  if (form.ayanamsa !== 'lahiri') p.set('ayanamsa', form.ayanamsa)
  if (form.node_type !== 'mean') p.set('node', form.node_type)
  if (!form.include_outer_planets) p.set('outer', '0')
  return p.toString()
}

/* ───────────────────────── Place autocomplete ───────────────────────── */
function PlaceField({ value, meta, onChange, onPick, hi }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(-1)
  const ctrl = useRef(null)

  useEffect(() => {
    if (meta || value.trim().length < 2) { setItems([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      ctrl.current?.abort()
      ctrl.current = new AbortController()
      try {
        const results = await searchPlaces(value.trim(), { limit: 8, signal: ctrl.current.signal })
        setItems(results); setIdx(-1); setOpen(results.length > 0)
      } catch (e) {
        if (e.name !== 'AbortError') { setItems([]); setOpen(false) }
      }
    }, 220)
    return () => clearTimeout(timer)
  }, [value, meta])

  const pick = (p) => { onPick(p); setOpen(false) }
  const onKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); pick(items[idx]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="kd-fld kd-span">
      <label className="kd-fld__label" htmlFor="kd-place">{t('place', hi)}</label>
      <input
        id="kd-place" type="text" autoComplete="off" value={value} placeholder={t('placePh', hi)}
        onChange={(e) => onChange(e.target.value)} onKeyDown={onKey}
        onFocus={() => items.length && !meta && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox" aria-expanded={open} aria-controls="kd-place-list" aria-autocomplete="list"
      />
      {open && (
        <ul className="kd-drop" id="kd-place-list" role="listbox">
          {items.map((p, i) => (
            <li key={p.id || i} role="option" aria-selected={i === idx} onMouseDown={(e) => { e.preventDefault(); pick(p) }}>
              <span>{p.display_name}{p.match === 'fuzzy' ? ` · ${t('didYouMean', hi)}?` : ''}</span>
              <small>{p.timezone || ''}</small>
            </li>
          ))}
        </ul>
      )}
      {meta
        ? <span className="kd-pill"><IconPin s={14} />{meta.latitude.toFixed(4)}, {meta.longitude.toFixed(4)} · {meta.timezone}</span>
        : <span className="kd-hint">{t('placeHint', hi)}</span>}
    </div>
  )
}

/* ───────────────────────────── Form page ────────────────────────────── */
const KundliPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const [form, setForm] = useState(loadForm)
  const [error, setError] = useState('')

  const handleLanguageChange = (lang) => { setLanguage(lang); if (setLanguageProp) setLanguageProp(lang) }
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  useEffect(() => { try { localStorage.setItem(FORM_KEY, JSON.stringify(form)) } catch {} }, [form])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.date || !form.time) { setError(t('needDate', hi)); return }
    if (!form.place.trim()) { setError(t('needPlace', hi)); return }
    setError('')
    navigate(`/kundli/report?${reportSearch(form)}`)
  }

  return (
    <div className="app jt-page">
      <Header language={language} setLanguage={handleLanguageChange} />
      <ServicesStrip language={language} activeService="kundli" />

      <main className="calc-page-main" id="main">
        <div className="calc-page-container">
          <SplitHero
            eyebrow={t('badge', hi)} title={t('title', hi)} subtitle={t('subtitle', hi)}
            points={[
              [IconChart, t('vp1', hi), t('vp1s', hi)],
              [IconClock, t('vp2', hi), t('vp2s', hi)],
              [IconZodiac, t('vp3', hi), t('vp3s', hi)],
              [IconSparkle, t('vp4', hi), t('vp4s', hi)],
            ]}
            trust={[t('trust1', hi), t('trust2', hi), t('trust3', hi)]}
          >
          <FormCard title={t('formTitle', hi)} sub={t('formSub', hi)}>
            <form onSubmit={handleSubmit} className="kd-form" noValidate>
              <div className="kd-grid">
                <div className="kd-fld">
                  <label className="kd-fld__label" htmlFor="kd-name">{t('name', hi)}</label>
                  <input id="kd-name" type="text" value={form.name} maxLength={120} placeholder={t('namePh', hi)} onChange={(e) => set({ name: e.target.value })} />
                </div>
                <div className="kd-fld">
                  <span className="kd-fld__label">{t('gender', hi)}</span>
                  <div className="kd-seg" role="group" aria-label={t('gender', hi)}>
                    {['male', 'female', 'other'].map((g) => (
                      <button key={g} type="button" aria-pressed={form.gender === g} onClick={() => set({ gender: g })}>{t(g, hi)}</button>
                    ))}
                  </div>
                </div>
                <div className="kd-fld">
                  <label className="kd-fld__label" htmlFor="kd-date">{t('dob', hi)}</label>
                  <input id="kd-date" type="date" value={form.date} min="1700-01-01" max="2200-12-31" required onChange={(e) => set({ date: e.target.value })} />
                </div>
                <div className="kd-fld">
                  <label className="kd-fld__label" htmlFor="kd-time">{t('tob', hi)}</label>
                  <input id="kd-time" type="time" value={form.time} required onChange={(e) => set({ time: e.target.value })} />
                </div>
                <PlaceField hi={hi} value={form.place} meta={form.placeMeta}
                  onChange={(v) => set({ place: v, placeMeta: null })}
                  onPick={(p) => set({ place: p.display_name, placeMeta: p })} />
              </div>

              <details className="kd-adv">
                <summary>{t('advanced', hi)}</summary>
                <div className="kd-adv__body">
                  <div className="kd-fld">
                    <label className="kd-fld__label" htmlFor="kd-ayan">{t('ayanamsa', hi)}</label>
                    <select id="kd-ayan" value={form.ayanamsa} onChange={(e) => set({ ayanamsa: e.target.value })}>
                      <option value="lahiri">Lahiri (Chitrapaksha)</option>
                      <option value="lahiri_1940">Lahiri 1940</option>
                      <option value="lahiri_icrc">Lahiri ICRC</option>
                      <option value="lahiri_vp285">Lahiri VP285</option>
                      <option value="raman">B.V. Raman</option>
                      <option value="krishnamurti">KP (Krishnamurti)</option>
                      <option value="yukteshwar">Yukteshwar</option>
                      <option value="true_chitra">True Chitra</option>
                    </select>
                  </div>
                  <div className="kd-fld">
                    <span className="kd-fld__label">{t('node', hi)}</span>
                    <div className="kd-seg" role="group">
                      <button type="button" aria-pressed={form.node_type === 'mean'} onClick={() => set({ node_type: 'mean' })}>{t('meanNode', hi)}</button>
                      <button type="button" aria-pressed={form.node_type === 'true'} onClick={() => set({ node_type: 'true' })}>{t('trueNode', hi)}</button>
                    </div>
                  </div>
                  <label className="kd-check">
                    <input type="checkbox" checked={form.include_outer_planets} onChange={(e) => set({ include_outer_planets: e.target.checked })} />
                    {t('outer', hi)}
                  </label>
                </div>
              </details>

              {error && (
                <div className="calc-error-message" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="calc-form-submit">{t('submit', hi)}</button>
            </form>
          </FormCard>
          </SplitHero>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

export default KundliPage
