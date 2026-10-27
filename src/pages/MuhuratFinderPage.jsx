import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KV, ToolError, ToolShell } from '../components/tools/ToolShell'
import PlaceField from '../components/tools/PlaceField'
import ScoreRing, { toneFor } from '../components/tools/ScoreRing'
import useStoredState from '../components/tools/useStoredState'
import { ACTIVITY_FALLBACK, DEFAULT_PLACE, activityLabel, monthName, t } from '../components/tools/toolLabels'
import { clock, dayOf, fmtDate, fmtMinutes, monthShort, num, numParam, todayISO } from '../components/tools/format'
import { fetchMuhuratActivities, fetchMuhuratFind } from '../services/kundliApi'
import { Chips, FormCard, MonthGrid, Panel, Skeleton, SplitHero } from '../components/tools/jt'
import { IconCalendar, IconClock, IconSparkle, IconTarget, IconWarn } from '../components/ui/Icons'
import '../styles/kundli.css'
import '../styles/kundli-tools.css'
import '../styles/jyotish-tools.css'

const PREF_KEY = 'jv-muhurat-prefs'
const DEFAULT_PREFS = { activity: 'marriage', days: 90, minScore: 60, place: DEFAULT_PLACE.display_name, placeMeta: DEFAULT_PLACE, location: DEFAULT_PLACE }
const DAY_OPTIONS = [30, 60, 90, 180, 365]
const BADGE = { good: 'yes', warn: 'warn', bad: 'bad' }
const heatOf = (s) => (s >= 90 ? 'h-3' : s >= 75 ? 'h-2' : s >= 60 ? 'h-1' : 'h-w')

const StaticChips = ({ items, tone = '' }) => (
  <div className="kd-chips">{items.map((x, i) => <span key={`${x}-${i}`} className={`kd-chip${tone ? ` kd-chip--${tone}` : ''} kt-chip-static`}>{x}</span>)}</div>
)

const Windows = ({ list, tone, hi }) => (
  <div className="jt-wins">
    {list.map((w, i) => (
      <div key={`${w.start}-${i}`} className={`jt-win jt-win--${tone}`}>
        <i aria-hidden="true" />
        <b>{clock(w.start)} – {clock(w.end)}</b>
        <span>{w.minutes != null ? fmtMinutes(w.minutes, hi) : ''}</span>
      </div>
    ))}
  </div>
)

const bestWindow = (d) => {
  const wins = Array.isArray(d.auspicious_windows) ? d.auspicious_windows : []
  return wins.reduce((b, w) => (!b || (w.minutes || 0) > (b.minutes || 0) ? w : b), null)
}

const DayCard = ({ d, hi, open, onToggle }) => {
  const score = Number(d.score) || 0
  const tone = toneFor(score / 100)
  const reasons = Array.isArray(d.reasons) ? d.reasons : []
  const restrictions = Array.isArray(d.restrictions) ? d.restrictions : []
  const wins = Array.isArray(d.auspicious_windows) ? d.auspicious_windows : []
  const avoid = Array.isArray(d.avoid_windows) ? d.avoid_windows : []
  const bw = bestWindow(d)
  return (
    <details className={`jt-mday jt-mday--${tone}`} id={`md-${d.date}`} open={open} onToggle={(e) => onToggle?.(d.date, e.currentTarget.open)}>
      <summary className="jt-mday__sum">
        <div className="jt-mday__date"><b>{dayOf(d.date)}</b><small>{monthShort(d.date, hi)}</small></div>
        <div className="jt-mday__t">
          <h3>{d.weekday ?? fmtDate(d.date, hi, { short: true })}{d.lunar_month ? ` · ${d.lunar_month}` : ''}</h3>
          <p>{d.tithi}{d.nakshatra ? ` · ${d.nakshatra}` : ''}</p>
          {bw && <p><em>{clock(bw.start)} – {clock(bw.end)}</em> · {fmtMinutes(bw.minutes, hi)}</p>}
        </div>
        <div className="jt-mday__score">
          <ScoreRing value={score} max={100} size={50} stroke={5} tone={tone} label={num(score)} />
        </div>
      </summary>
      <div className="jt-mday__body">
        {(d.rating_label ?? d.rating) && <span className={`kd-badge kd-badge--${BADGE[tone]}`} style={{ justifySelf: 'start' }}>{d.rating_label ?? d.rating}</span>}
        <KV rows={[
          [t('tithi', hi), d.tithi], [t('nakshatra', hi), d.nakshatra], [t('yoga', hi), d.yoga],
          [`${t('sunrise', hi)} / ${t('sunset', hi)}`, `${clock(d.sunrise)} / ${clock(d.sunset)}`],
        ]} />
        {reasons.length > 0 && (<div><div className="kd-eyebrow">{t('reasons', hi)}</div><ul className="kt-list">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div>)}
        {restrictions.length > 0 && (<div><div className="kd-eyebrow">{t('restrictions', hi)}</div><ul className="kt-list kt-list--bad">{restrictions.map((r, i) => <li key={i}>{r}</li>)}</ul></div>)}
        {wins.length > 0 && (<div><div className="kd-eyebrow">{t('windows', hi)}</div><Windows list={wins} tone="good" hi={hi} /></div>)}
        {avoid.length > 0 && (<div><div className="kd-eyebrow">{t('avoidWindows', hi)}</div><Windows list={avoid} tone="bad" hi={hi} /></div>)}
        <div className="jt-mday__foot">
          <Link to={`/panchang?date=${d.date}`} className="kd-link">{t('viewPanchang', hi)} →</Link>
        </div>
      </div>
    </details>
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
  const [editing, setEditing] = useState(false)
  const [openDays, setOpenDays] = useState(() => new Set())

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
    setLoading(true); setError(''); setEditing(false); setOpenDays(new Set())
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
  const best = useMemo(() => [...days].sort((a, b) => (Number(b.score) - Number(a.score)) || String(a.date).localeCompare(String(b.date))).slice(0, 3), [days])
  const months = useMemo(() => {
    if (!result?.from || !result?.to) return []
    const out = []
    let y = Number(result.from.slice(0, 4)), m = Number(result.from.slice(5, 7))
    const ey = Number(result.to.slice(0, 4)), em = Number(result.to.slice(5, 7))
    while (y < ey || (y === ey && m <= em)) { out.push([y, m]); m += 1; if (m > 12) { m = 1; y += 1 } }
    return out
  }, [result])
  const marks = useMemo(() => {
    const mk = {}
    days.forEach((d) => { mk[d.date] = { heat: heatOf(Number(d.score) || 0), small: String(num(d.score)), label: `${num(d.score)} · ${d.tithi || ''}` } })
    return mk
  }, [days])
  const rules = result?.rules || {}
  const ruleList = (k) => (Array.isArray(rules[k]) ? rules[k] : [])
  const activityIds = Object.keys(activities)
  const resultLabel = result ? activityLabel(result.activity, result.label, hi) : ''
  const showForm = !result || editing

  const jumpDay = (iso) => {
    setOpenDays((s) => new Set(s).add(iso))
    setTimeout(() => document.getElementById(`md-${iso}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const onToggle = (iso, open) => setOpenDays((s) => { const n = new Set(s); open ? n.add(iso) : n.delete(iso); return n })

  const form = (
    <FormCard title={t('muForm', hi)} sub={t('muFormSub', hi)}
      right={result && <button type="button" className="jt-btn jt-btn--ghost jt-btn--sm" onClick={() => setEditing(false)}>{t('cancel', hi)}</button>}>
      <form className="calc-form kd-form" onSubmit={submit} noValidate>
        <div className="kd-fld">
          <span className="kd-fld__label">{t('activity', hi)}</span>
          <Chips items={activityIds.map((id) => ({ id, label: activityLabel(id, activities[id], hi).split(' (')[0], on: (activityIds.includes(prefs.activity) ? prefs.activity : activityIds[0]) === id }))}
            onToggle={(id) => setPrefs((p) => ({ ...p, activity: id }))} />
        </div>
        <div className="jt-query">
          <div className="kd-fld">
            <label className="kd-fld__label" htmlFor="mu-date">{t('startDate', hi)}</label>
            <input id="mu-date" type="date" value={date} min="1700-01-01" max="2200-12-31" onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="kd-fld">
            <span className="kd-fld__label">{t('days', hi)}</span>
            <div className="kd-seg" role="group" aria-label={t('days', hi)}>
              {DAY_OPTIONS.map((d) => <button key={d} type="button" aria-pressed={prefs.days === d} onClick={() => setPrefs((p) => ({ ...p, days: d }))}>{d}</button>)}
            </div>
          </div>
          <div className="kd-fld jt-range">
            <label className="kd-fld__label" htmlFor="mu-min">{t('minScore', hi)} · <output htmlFor="mu-min">{prefs.minScore}</output></label>
            <input id="mu-min" type="range" min="0" max="100" step="5" value={prefs.minScore} onChange={(e) => setPrefs((p) => ({ ...p, minScore: Number(e.target.value) }))} />
            <div className="jt-range__scale"><span>0</span><span>50</span><span>100</span></div>
          </div>
          <PlaceField id="mu-place" hi={hi} label={t('location', hi)} value={prefs.place || ''} meta={prefs.placeMeta} span={false} className="jt-query__place"
            onChange={(v) => setPrefs((p) => ({ ...p, place: v, placeMeta: null }))}
            onPick={(p) => setPrefs((pr) => ({ ...pr, place: p.display_name, placeMeta: p, location: p }))} />
        </div>
        {formError && <div className="calc-error-message" role="alert">{formError}</div>}
        <button type="submit" className="calc-form-submit" disabled={loading}>{loading ? t('muWorking', hi) : t('find', hi)}</button>
      </form>
    </FormCard>
  )

  return (
    <ToolShell language={language} onLanguage={onLanguage} active="muhurat" wide>
      {!result && !loading && !error && (
        <SplitHero wide eyebrow={t('muBadge', hi)} title={t('muTitle', hi)} subtitle={t('muSubtitle', hi)}
          points={[[IconTarget, t('muVp1', hi), t('muVp1s', hi)], [IconClock, t('muVp2', hi), t('muVp2s', hi)], [IconWarn, t('muVp3', hi), t('muVp3s', hi)], [IconCalendar, t('muVp4', hi), t('muVp4s', hi)]]}>
          {form}
        </SplitHero>
      )}

      {(result || loading || error) && (
        <div className="jt-pagehead">
          <h1>{t('muTitle', hi)}</h1>
          <p className="jt-pagehead__sub">{t('muSubtitle', hi)}</p>
        </div>
      )}

      {result && !editing && (
        <div className="jt-daybar jt-sticky jt-querybar">
          <span className="jt-querybar__ico"><IconSparkle s={18} /></span>
          <div className="jt-querybar__text">
            <b>{resultLabel}</b>
            <span>{fmtDate(result.from, hi, { short: true })} – {fmtDate(result.to, hi, { short: true })} · ≥ {query?.min_score ?? prefs.minScore} · {(result.place || params.get('place') || '').split(',')[0]}</span>
          </div>
          <button type="button" className="jt-btn jt-btn--ghost jt-btn--sm" onClick={() => setEditing(true)}>{t('change', hi)}</button>
        </div>
      )}
      {result && editing && <div style={{ marginTop: 'var(--s-4)' }}>{form}</div>}
      {(loading || error) && !result && <div style={{ marginTop: 'var(--s-4)' }}>{loading ? <Skeleton tiles={3} rows={3} height={120} text={t('muWorking', hi)} /> : <><ToolError message={error} onRetry={() => setAttempt((a) => a + 1)} retryLabel={t('retry', hi)} />{form}</>}</div>}

      {result && (
        <div className={`kd-results jt-muhurat${loading ? ' is-busy' : ''}`} aria-busy={loading}>
          <div className="jt-section__head">
            <p><strong style={{ color: 'var(--ink)' }}>{Number.isFinite(Number(result.count)) ? result.count : days.length}</strong> {t('daysFound', hi)} · {resultLabel}</p>
          </div>

          {days.length === 0 && <p className="kt-empty">{t('noDays', hi)}</p>}

          {best.length > 0 && (
            <section className="jt-section">
              <div className="jt-section__head"><h2 className="jt-h2">{t('bestDays', hi)}</h2><p>{t('bestDaysSub', hi)}</p></div>
              <div className="jt-best">
                {best.map((d, i) => {
                  const bw = bestWindow(d), score = Number(d.score) || 0
                  return (
                    <a key={d.date} href={`#md-${d.date}`} className="jt-best__card" onClick={(e) => { e.preventDefault(); jumpDay(d.date) }}>
                      <ScoreRing value={score} max={100} size={56} stroke={6} tone={toneFor(score / 100)} label={num(score)} />
                      <div className="jt-best__date">
                        <b>{fmtDate(d.date, hi, { short: true, year: false })} · {d.weekday}</b>
                        <small>{d.tithi}{d.nakshatra ? ` · ${d.nakshatra}` : ''}</small>
                        {bw && <div className="jt-best__win">{clock(bw.start)} – {clock(bw.end)} · {fmtMinutes(bw.minutes, hi)}</div>}
                      </div>
                      <span className="jt-best__rank">#{i + 1}</span>
                    </a>
                  )
                })}
              </div>
            </section>
          )}

          {months.length > 0 && days.length > 0 && (
            <Panel title={t('heatmap', hi)} sub={t('heatmapSub', hi)}
              right={<div className="jt-legend" style={{ marginTop: 0 }}><span><i className="jt-cal__cell h-1" style={{ width: 12, height: 12, borderRadius: 3 }} />60+</span><span><i className="jt-cal__cell h-2" style={{ width: 12, height: 12, borderRadius: 3 }} />75+</span><span><i className="jt-cal__cell h-3" style={{ width: 12, height: 12, borderRadius: 3 }} />90+</span></div>}>
              <div className="jt-heat">
                {months.map(([y, m]) => (
                  <MonthGrid key={`${y}-${m}`} year={y} month={m} marks={marks} today={todayISO()} hi={hi} onPick={jumpDay} title={`${monthName(m, hi)} ${y}`}
                    right={<small>{days.filter((d) => d.date.startsWith(`${y}-${String(m).padStart(2, '0')}`)).length}</small>} />
                ))}
              </div>
            </Panel>
          )}

          {days.length > 0 && (
            <section className="jt-section">
              <div className="jt-section__head"><h2 className="jt-h2">{t('allDays', hi)}</h2><p>{days.length}</p></div>
              <div className="jt-mdays">{days.map((d) => <DayCard key={d.date} d={d} hi={hi} open={openDays.has(d.date)} onToggle={onToggle} />)}</div>
            </section>
          )}

          <details className="jt-mday jt-rules" open={days.length === 0}>
            <summary className="jt-mday__sum" style={{ gridTemplateColumns: '1fr auto' }}>
              <div className="jt-mday__t"><h3>{t('rules', hi)} · {resultLabel}</h3><p>{ruleList('nakshatras').length} {t('nakshatra', hi)} · {ruleList('tithis').length} {t('tithi', hi)} · {ruleList('weekdays').length} {t('weekday', hi)}</p></div>
              <span className="pv-sec__chev" aria-hidden="true">›</span>
            </summary>
            <div className="jt-mday__body">
              {ruleList('nakshatras').length > 0 && <div><div className="kd-eyebrow">{t('approvedNak', hi)}</div><StaticChips items={ruleList('nakshatras')} tone="good" /></div>}
              {ruleList('tithis').length > 0 && <div><div className="kd-eyebrow">{t('approvedTithi', hi)}</div><StaticChips items={ruleList('tithis').map(String)} tone="good" /></div>}
              {ruleList('weekdays').length > 0 && <div><div className="kd-eyebrow">{t('approvedWeekday', hi)}</div><StaticChips items={ruleList('weekdays')} tone="good" /></div>}
              {ruleList('avoid').length > 0 && <div><div className="kd-eyebrow">{t('avoidPeriods', hi)}</div><ul className="kt-list kt-list--bad">{ruleList('avoid').map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
            </div>
          </details>

          <p className="kd-foot">{result.place || params.get('place') || ''} · {t('footnote', hi)}</p>
        </div>
      )}
    </ToolShell>
  )
}

export default MuhuratFinderPage
