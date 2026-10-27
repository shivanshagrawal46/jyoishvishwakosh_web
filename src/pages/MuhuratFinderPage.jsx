import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, KV, Skeleton, ToolError, ToolHero, ToolShell } from '../components/tools/ToolShell'
import PlaceField from '../components/tools/PlaceField'
import ScoreRing, { toneFor } from '../components/tools/ScoreRing'
import useStoredState from '../components/tools/useStoredState'
import { ACTIVITY_FALLBACK, DEFAULT_PLACE, activityLabel, t } from '../components/tools/toolLabels'
import { clock, dayOf, fmtDate, fmtMinutes, monthShort, num, numParam, todayISO } from '../components/tools/format'
import { fetchMuhuratActivities, fetchMuhuratFind } from '../services/kundliApi'
import '../styles/kundli.css'
import '../styles/kundli-tools.css'

const PREF_KEY = 'jv-muhurat-prefs'
const DEFAULT_PREFS = { activity: 'marriage', days: 90, minScore: 60, place: DEFAULT_PLACE.display_name, placeMeta: DEFAULT_PLACE, location: DEFAULT_PLACE }
const DAY_OPTIONS = [30, 60, 90, 180, 365]
const BADGE = { good: 'yes', warn: 'warn', bad: 'bad' }

const Chips = ({ items, tone = '' }) => (
  <div className="kd-chips">{items.map((x, i) => <span key={`${x}-${i}`} className={`kd-chip${tone ? ` kd-chip--${tone}` : ''} kt-chip-static`}>{x}</span>)}</div>
)

const Windows = ({ list, tone, hi }) => (
  <div className="kt-wins">
    {list.map((w, i) => (
      <span key={`${w.start}-${i}`} className={`kt-win kt-win--${tone}`}>
        {clock(w.start)} – {clock(w.end)}
        {w.minutes != null && <small>{fmtMinutes(w.minutes, hi)}</small>}
      </span>
    ))}
  </div>
)

const Day = ({ d, hi }) => {
  const score = Number(d.score) || 0
  const tone = toneFor(score / 100)
  const reasons = Array.isArray(d.reasons) ? d.reasons : []
  const restrictions = Array.isArray(d.restrictions) ? d.restrictions : []
  const wins = Array.isArray(d.auspicious_windows) ? d.auspicious_windows : []
  const avoid = Array.isArray(d.avoid_windows) ? d.avoid_windows : []
  return (
    <article className={`kd-card kt-day kt-day--${tone}`}>
      <div className="kt-day__head">
        <div className="kt-ev__date"><b>{dayOf(d.date)}</b><small>{monthShort(d.date, hi)}</small></div>
        <div className="kt-day__title">
          <h3>{fmtDate(d.date, hi)}</h3>
          <p>{d.weekday ?? ''}{d.lunar_month ? ` · ${d.lunar_month}` : ''}</p>
        </div>
        <div className="kt-day__score">
          <ScoreRing value={score} max={100} size={62} stroke={6} tone={tone} label={num(score)} />
          {(d.rating_label ?? d.rating) && <span className={`kd-badge kd-badge--${BADGE[tone]}`}>{d.rating_label ?? d.rating}</span>}
        </div>
      </div>
      <div className="kt-day__body">
        <KV className="kt-day__kv" rows={[
          [t('tithi', hi), d.tithi], [t('nakshatra', hi), d.nakshatra], [t('yoga', hi), d.yoga],
          [`${t('sunrise', hi)} / ${t('sunset', hi)}`, `${clock(d.sunrise)} / ${clock(d.sunset)}`],
        ]} />
        {reasons.length > 0 && (<div><div className="kd-eyebrow">{t('reasons', hi)}</div><ul className="kt-list">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div>)}
        {restrictions.length > 0 && (<div><div className="kd-eyebrow">{t('restrictions', hi)}</div><ul className="kt-list kt-list--bad">{restrictions.map((r, i) => <li key={i}>{r}</li>)}</ul></div>)}
        {wins.length > 0 && (<div><div className="kd-eyebrow">{t('windows', hi)}</div><Windows list={wins} tone="ok" hi={hi} /></div>)}
        {avoid.length > 0 && (<div><div className="kd-eyebrow">{t('avoidWindows', hi)}</div><Windows list={avoid} tone="bad" hi={hi} /></div>)}
      </div>
      <footer className="kt-day__foot">
        <Link to={`/panchang?date=${d.date}`} className="kd-link">{t('viewPanchang', hi)} →</Link>
      </footer>
    </article>
  )
}

const MuhuratFinderPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const onLanguage = (lang) => { setLanguage(lang); if (setLanguageProp) setLanguageProp(lang) }

  const [params, setParams] = useSearchParams()
  const [prefs, setPrefs] = useStoredState(PREF_KEY, DEFAULT_PREFS)
  const [date, setDate] = useState(() => params.get('date') || todayISO())
  const [activities, setActivities] = useState(ACTIVITY_FALLBACK)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    fetchMuhuratActivities().then((a) => { if (alive && a && Object.keys(a).length) setActivities(a) }).catch(() => {})
    return () => { alive = false }
  }, [])

  // A shared link seeds the controls from the URL once.
  useEffect(() => {
    if (!params.get('activity')) return
    const lat = numParam(params, 'lat'), lon = numParam(params, 'lon')
    const loc = lat != null && lon != null ? { display_name: params.get('place') || `${lat}, ${lon}`, latitude: lat, longitude: lon, timezone: params.get('tz') || undefined } : null
    setPrefs((p) => ({
      ...p,
      activity: params.get('activity') || p.activity,
      days: DAY_OPTIONS.includes(Number(params.get('days'))) ? Number(params.get('days')) : p.days,
      minScore: params.get('min') != null ? Math.min(100, Math.max(0, Number(params.get('min')) || 0)) : p.minScore,
      ...(loc ? { place: loc.display_name, placeMeta: loc, location: loc } : {}),
    }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const query = useMemo(() => {
    const activity = params.get('activity')
    if (!activity) return null
    const lat = numParam(params, 'lat'), lon = numParam(params, 'lon')
    if (lat == null || lon == null) return null
    return {
      activity, date: params.get('date') || todayISO(),
      days: DAY_OPTIONS.includes(Number(params.get('days'))) ? Number(params.get('days')) : 90,
      min_score: params.get('min') != null ? Math.min(100, Math.max(0, Number(params.get('min')) || 0)) : undefined,
      latitude: lat, longitude: lon, timezone: params.get('tz') || undefined,
    }
  }, [params])

  useEffect(() => {
    if (!query) { setResult(null); setLoading(false); return }
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchMuhuratFind({ ...query, language: hi ? 'hi' : 'en' }, { signal: ctrl.signal })
      .then((d) => setResult(d))
      .catch((err) => { if (err.name !== 'AbortError') { setResult(null); setError(err.status ? err.message : t('offline', hi)) } })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [query, hi, attempt])

  const submit = (e) => {
    e.preventDefault()
    const loc = prefs.location
    if (!loc || !Number.isFinite(Number(loc.latitude))) { setFormError(t('needLocation', hi)); return }
    if (!date) { setFormError(t('needDate', hi)); return }
    setFormError('')
    const p = new URLSearchParams({ activity: prefs.activity, date, days: String(prefs.days), min: String(prefs.minScore), lat: String(loc.latitude), lon: String(loc.longitude) })
    if (loc.timezone) p.set('tz', loc.timezone)
    if (loc.display_name) p.set('place', loc.display_name)
    setParams(p)
  }

  const days = useMemo(() => (Array.isArray(result?.days) ? [...result.days].sort((a, b) => String(a.date).localeCompare(String(b.date))) : []), [result])
  const rules = result?.rules || {}
  const ruleList = (k) => (Array.isArray(rules[k]) ? rules[k] : [])
  const activityIds = Object.keys(activities)
  const resultLabel = result ? activityLabel(result.activity, result.label, hi) : ''

  return (
    <ToolShell language={language} onLanguage={onLanguage} active="muhurat" wide>
      <ToolHero badge={t('muBadge', hi)} title={t('muTitle', hi)} subtitle={t('muSubtitle', hi)} hi={hi} />

      <div className="calc-form-card kt-formcard">
        <form className="calc-form kd-form" onSubmit={submit} noValidate>
          <div className="kt-controls kt-controls--mu">
            <div className="kd-fld">
              <label className="kd-fld__label" htmlFor="mu-activity">{t('activity', hi)}</label>
              <select id="mu-activity" value={activityIds.includes(prefs.activity) ? prefs.activity : activityIds[0]} onChange={(e) => setPrefs((p) => ({ ...p, activity: e.target.value }))}>
                {activityIds.map((id) => <option key={id} value={id}>{activityLabel(id, activities[id], hi)}</option>)}
              </select>
            </div>
            <div className="kd-fld">
              <label className="kd-fld__label" htmlFor="mu-date">{t('startDate', hi)}</label>
              <input id="mu-date" type="date" value={date} min="1700-01-01" max="2200-12-31" onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="kd-fld">
              <label className="kd-fld__label" htmlFor="mu-days">{t('days', hi)}</label>
              <select id="mu-days" value={prefs.days} onChange={(e) => setPrefs((p) => ({ ...p, days: Number(e.target.value) }))}>
                {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d} {t('daysUnit', hi)}</option>)}
              </select>
            </div>
            <div className="kd-fld">
              <label className="kd-fld__label" htmlFor="mu-min">{t('minScore', hi)} · <output htmlFor="mu-min">{prefs.minScore}</output></label>
              <input id="mu-min" className="kt-range" type="range" min="0" max="100" step="5" value={prefs.minScore} onChange={(e) => setPrefs((p) => ({ ...p, minScore: Number(e.target.value) }))} />
            </div>
            <PlaceField id="mu-place" hi={hi} label={t('location', hi)} value={prefs.place || ''} meta={prefs.placeMeta} span={false} className="kt-controls__place"
              onChange={(v) => setPrefs((p) => ({ ...p, place: v, placeMeta: null }))}
              onPick={(p) => setPrefs((pr) => ({ ...pr, place: p.display_name, placeMeta: p, location: p }))} />
          </div>
          {formError && <div className="calc-error-message" role="alert">{formError}</div>}
          <button type="submit" className="calc-form-submit" disabled={loading}>{loading ? t('muWorking', hi) : t('find', hi)}</button>
        </form>
      </div>

      {loading && <Skeleton rows={4} height={150} text={t('muWorking', hi)} />}
      {!loading && error && <ToolError message={error} onRetry={() => setAttempt((a) => a + 1)} retryLabel={t('retry', hi)} />}

      {!loading && result && (
        <div className="kd-results kt-muhurat">
          <div className="kt-summary">
            <span><strong>{Number.isFinite(Number(result.count)) ? result.count : days.length}</strong> {t('daysFound', hi)} · {resultLabel}</span>
            <span className="kd-hint">{fmtDate(result.from, hi, { short: true })} – {fmtDate(result.to, hi, { short: true })}</span>
          </div>

          <details className="kd-card kt-rules" open={days.length === 0}>
            <summary className="kd-card__head"><h2 className="kd-card__title">{t('rules', hi)}</h2><span className="kt-rules__caret" aria-hidden="true">›</span></summary>
            <div className="kd-card__body kt-rules__body">
              {ruleList('nakshatras').length > 0 && <div><div className="kd-eyebrow">{t('approvedNak', hi)}</div><Chips items={ruleList('nakshatras')} tone="good" /></div>}
              {ruleList('tithis').length > 0 && <div><div className="kd-eyebrow">{t('approvedTithi', hi)}</div><Chips items={ruleList('tithis').map(String)} tone="good" /></div>}
              {ruleList('weekdays').length > 0 && <div><div className="kd-eyebrow">{t('approvedWeekday', hi)}</div><Chips items={ruleList('weekdays')} tone="good" /></div>}
              {ruleList('avoid').length > 0 && <div><div className="kd-eyebrow">{t('avoidPeriods', hi)}</div><ul className="kt-list kt-list--bad">{ruleList('avoid').map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
            </div>
          </details>

          {days.length === 0 && <p className="kt-empty">{t('noDays', hi)}</p>}
          <div className="kt-days">{days.map((d) => <Day key={d.date} d={d} hi={hi} />)}</div>

          <p className="kd-foot">{result.place || params.get('place') || ''} · {t('footnote', hi)}</p>
        </div>
      )}
    </ToolShell>
  )
}

export default MuhuratFinderPage
