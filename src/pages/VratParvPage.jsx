import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Skeleton, ToolError, ToolHero, ToolShell } from '../components/tools/ToolShell'
import PlaceField from '../components/tools/PlaceField'
import useStoredState from '../components/tools/useStoredState'
import { DEFAULT_PLACE, monthName, t } from '../components/tools/toolLabels'
import { clock, dayOf, fmtDate, todayISO } from '../components/tools/format'
import { fetchFestivals } from '../services/kundliApi'
import '../styles/kundli.css'
import '../styles/kundli-tools.css'

const PREF_KEY = 'jv-vrat-prefs'
const DEFAULT_PREFS = { place: DEFAULT_PLACE.display_name, placeMeta: DEFAULT_PLACE, location: DEFAULT_PLACE, includeMonthly: true }
const MIN_YEAR = 1700, MAX_YEAR = 2200
const clampYear = (y) => Math.min(MAX_YEAR, Math.max(MIN_YEAR, y))

const LunarStrip = ({ months, hi, nowISO }) => {
  if (!Array.isArray(months) || months.length === 0) return null
  return (
    <div className="kt-lunar" aria-label={t('lunarMonths', hi)}>
      <div className="kd-eyebrow">{t('lunarMonths', hi)}</div>
      <div className="kt-lunar__track no-bar">
        {months.map((m, i) => {
          const current = m.start && m.end && m.start.slice(0, 10) <= nowISO && nowISO < m.end.slice(0, 10)
          return (
            <div key={`${m.amanta_en || m.amanta}-${m.start || i}`} className={`kt-lunar__chip${current ? ' is-current' : ''}${m.adhik ? ' is-adhik' : ''}`}>
              <b>{m.amanta ?? m.amanta_en ?? '-'}</b>
              {m.adhik && <span className="kd-badge kd-badge--warn">{t('adhik', hi)}</span>}
              {m.kshaya && <span className="kd-badge kd-badge--bad">{t('kshaya', hi)}</span>}
              <small>{fmtDate(m.start, hi, { short: true, year: false })} – {fmtDate(m.end, hi, { short: true, year: false })}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Event = ({ e, hi, isToday }) => (
  <li className={`kt-ev${isToday ? ' is-today' : ''}`} id={isToday ? 'kt-today' : undefined}>
    <div className="kt-ev__date"><b>{dayOf(e.date)}</b><small>{e.weekday ?? ''}</small></div>
    <div className="kt-ev__body">
      <div className="kt-ev__title">
        <h3>{e.name ?? e.name_en ?? '-'}</h3>
        {e.name_en && e.name_en !== e.name && <small>{e.name_en}</small>}
      </div>
      <div className="kt-ev__tags">
        {(e.category_label ?? e.category) && <span className={`kd-badge kt-cat kt-cat--${e.category || 'other'}`}>{e.category_label ?? e.category}</span>}
        {(e.rule_label ?? e.rule) && <span className="kd-badge kd-badge--no">{e.rule_label ?? e.rule}</span>}
        {isToday && <span className="kd-badge kd-badge--warn">{t('today', hi)}</span>}
      </div>
      <p className="kt-ev__meta">
        {e.tithi_at_sunrise && <span><b>{t('tithiSunrise', hi)}</b> {e.tithi_at_sunrise}</span>}
        {e.nakshatra_at_sunrise && <span><b>{t('nakSunrise', hi)}</b> {e.nakshatra_at_sunrise}</span>}
        {e.lunar_month_amanta && <span><b>{t('lunarMonth', hi)}</b> {e.lunar_month_amanta}</span>}
      </p>
      {e.sankranti_time && <p className="kt-ev__extra">☀ {t('sankrantiAt', hi)} <b>{clock(e.sankranti_time)}</b></p>}
      {e.vaishnava_date && <p className="kt-ev__extra">{t('vaishnava', hi)}: <b>{fmtDate(e.vaishnava_date, hi, { short: true, weekday: true })}</b></p>}
      {e.note && <p className="kt-ev__note">{e.note}</p>}
    </div>
  </li>
)

const VratParvPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const onLanguage = (lang) => { setLanguage(lang); if (setLanguageProp) setLanguageProp(lang) }

  const [params, setParams] = useSearchParams()
  const nowISO = todayISO()
  const thisYear = Number(nowISO.slice(0, 4)), thisMonth = Number(nowISO.slice(5, 7))
  const year = clampYear(Number(params.get('year')) || thisYear)
  const monthParam = params.get('month')
  const month = monthParam == null ? thisMonth : monthParam === 'all' ? 0 : Math.min(12, Math.max(0, Number(monthParam) || 0))
  const setQuery = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v == null ? next.delete(k) : next.set(k, String(v))))
    setParams(next, { replace: true })
  }

  const [prefs, setPrefs] = useStoredState(PREF_KEY, DEFAULT_PREFS)
  const loc = prefs.location && Number.isFinite(Number(prefs.location.latitude)) ? prefs.location : DEFAULT_PLACE
  const [cats, setCats] = useState(() => new Set())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  // One call per year/place/toggle; month and category filter client-side so switching is instant.
  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchFestivals({
      year, latitude: loc.latitude, longitude: loc.longitude, timezone: loc.timezone || undefined,
      language: hi ? 'hi' : 'en', include_monthly: prefs.includeMonthly ? 'true' : 'false',
    }, { signal: ctrl.signal })
      .then((d) => setData(d))
      .catch((err) => { if (err.name !== 'AbortError') { setData(null); setError(err.status ? err.message : t('offline', hi)) } })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [year, loc.latitude, loc.longitude, loc.timezone, prefs.includeMonthly, hi, attempt])

  const events = useMemo(() => (Array.isArray(data?.events) ? data.events : []), [data])
  const categories = useMemo(() => [...new Map(events.filter((e) => e.category).map((e) => [e.category, e.category_label ?? e.category]))], [events])
  const filtered = useMemo(() => events.filter((e) =>
    (month === 0 || Number(e.date?.slice(5, 7)) === month) && (cats.size === 0 || cats.has(e.category))), [events, month, cats])
  const groups = useMemo(() => {
    const map = new Map()
    filtered.forEach((e) => { const k = (e.date || '').slice(0, 7); if (!map.has(k)) map.set(k, []); map.get(k).push(e) })
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])
  const hasToday = filtered.some((e) => e.date === nowISO)

  const toggleCat = (id) => setCats((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const jumpToday = () => document.getElementById('kt-today')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <ToolShell language={language} onLanguage={onLanguage} active="vratparv" wide>
      <ToolHero badge={t('vBadge', hi)} title={t('vTitle', hi)} subtitle={t('vSubtitle', hi)} hi={hi} />

      <div className="calc-form-card kt-formcard">
        <div className="kt-controls">
          <div className="kd-fld">
            <label className="kd-fld__label" htmlFor="vp-year">{t('year', hi)}</label>
            <div className="kt-stepper">
              <button type="button" aria-label="−1" onClick={() => setQuery({ year: clampYear(year - 1) })} disabled={year <= MIN_YEAR}>−</button>
              <input id="vp-year" type="number" inputMode="numeric" min={MIN_YEAR} max={MAX_YEAR} value={year}
                onChange={(e) => { const y = Number(e.target.value); if (y >= MIN_YEAR && y <= MAX_YEAR) setQuery({ year: y }) }} />
              <button type="button" aria-label="+1" onClick={() => setQuery({ year: clampYear(year + 1) })} disabled={year >= MAX_YEAR}>+</button>
            </div>
          </div>
          <div className="kd-fld">
            <label className="kd-fld__label" htmlFor="vp-month">{t('month', hi)}</label>
            <select id="vp-month" value={month} onChange={(e) => setQuery({ month: Number(e.target.value) === 0 ? 'all' : e.target.value })}>
              <option value={0}>{t('allMonths', hi)}</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{monthName(i + 1, hi)}</option>)}
            </select>
          </div>
          <PlaceField id="vp-place" hi={hi} label={t('location', hi)} value={prefs.place || ''} meta={prefs.placeMeta} span={false} className="kt-controls__place"
            onChange={(v) => setPrefs((p) => ({ ...p, place: v, placeMeta: null }))}
            onPick={(p) => setPrefs((pr) => ({ ...pr, place: p.display_name, placeMeta: p, location: p }))} />
          <label className="kd-check kt-check">
            <input type="checkbox" checked={!!prefs.includeMonthly} onChange={(e) => setPrefs((p) => ({ ...p, includeMonthly: e.target.checked }))} />
            <span><b>{t('monthly', hi)}</b><small>{t('monthlySub', hi)}</small></span>
          </label>
        </div>
      </div>

      {loading && <Skeleton rows={6} height={92} text={t('vWorking', hi)} />}
      {!loading && error && <ToolError message={error} onRetry={() => setAttempt((a) => a + 1)} retryLabel={t('retry', hi)} />}

      {!loading && data && (
        <div className="kd-results kt-vrat">
          <LunarStrip months={data.lunar_months} hi={hi} nowISO={nowISO} />

          {categories.length > 0 && (
            <div className="kt-filter">
              <div className="kd-eyebrow">{t('category', hi)}</div>
              <div className="kd-chips">
                <button type="button" className={`kd-chip${cats.size === 0 ? ' kd-chip--warn' : ''}`} aria-pressed={cats.size === 0} onClick={() => setCats(new Set())}>{t('all', hi)}</button>
                {categories.map(([id, label]) => (
                  <button type="button" key={id} className={`kd-chip${cats.has(id) ? ' kd-chip--warn' : ''}`} aria-pressed={cats.has(id)} onClick={() => toggleCat(id)}>{label}</button>
                ))}
              </div>
            </div>
          )}

          <div className="kt-summary">
            <span><strong>{filtered.length}</strong> {t('eventsCount', hi)} · {month === 0 ? year : `${monthName(month, hi)} ${year}`}</span>
            {hasToday && <button type="button" className="kd-link" onClick={jumpToday}>{t('jumpToday', hi)} ↓</button>}
          </div>

          {groups.length === 0 && <p className="kt-empty">{t('noEvents', hi)}</p>}
          {groups.map(([ym, list]) => (
            <section key={ym} className="kt-month">
              <h2 className="kt-month__head"><span>{monthName(Number(ym.slice(5, 7)), hi)} {ym.slice(0, 4)}</span><small>{list.length}</small></h2>
              <ul className="kt-evlist">
                {list.map((e, i) => <Event key={`${e.date}-${e.name_en || e.name}-${i}`} e={e} hi={hi} isToday={e.date === nowISO} />)}
              </ul>
            </section>
          ))}

          <p className="kd-foot">{loc.display_name || `${loc.latitude}, ${loc.longitude}`} · {t('footnote', hi)}</p>
        </div>
      )}
    </ToolShell>
  )
}

export default VratParvPage
