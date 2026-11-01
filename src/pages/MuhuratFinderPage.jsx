import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KV, ToolError, ToolShell } from '../components/tools/ToolShell'
import PlaceField from '../components/tools/PlaceField'
import ScoreRing, { toneFor } from '../components/tools/ScoreRing'
import useStoredState from '../components/tools/useStoredState'
import { ACTIVITY_FALLBACK, DEFAULT_PLACE, activityLabel, canonActivity, monthName, t } from '../components/tools/toolLabels'
import { clock, dayOf, fmtDate, fmtMinutes, monthShort, num, numParam, todayISO } from '../components/tools/format'
import { fetchMuhuratActivities, fetchMuhuratFind } from '../services/kundliApi'
import { Chips, FormCard, MonthGrid, Panel, Skeleton, SplitHero } from '../components/tools/jt'
import { IconCalendar, IconClock, IconSparkle, IconTarget, IconWarn } from '../components/ui/Icons'
import '../styles/kundli.css'
import '../styles/kundli-tools.css'
import '../styles/jyotish-tools.css'

const PREF_KEY = 'jv-muhurat-prefs'
const DEFAULT_PREFS = { activity: 'vivah', days: 90, minScore: 60, place: DEFAULT_PLACE.display_name, placeMeta: DEFAULT_PLACE, location: DEFAULT_PLACE }
const DAY_OPTIONS = [30, 60, 90, 180, 365]
const BADGE = { good: 'yes', warn: 'warn', bad: 'bad' }
const heatOf = (s) => (s >= 90 ? 'h-3' : s >= 75 ? 'h-2' : s >= 60 ? 'h-1' : 'h-w')

const StaticChips = ({ items, tone = '' }) => (
  <div className="kd-chips">{items.map((x, i) => <span key={`${x}-${i}`} className={`kd-chip${tone ? ` kd-chip--${tone}` : ''} kt-chip-static`}>{x}</span>)}</div>
)

/* Windows may run past midnight (day-and-night muhurats): show the date when it differs from the day's. */
const wclock = (iso, base, hi) => (iso && base && iso.slice(0, 10) !== base ? `${clock(iso)}, ${fmtDate(iso, hi, { short: true, year: false })}` : clock(iso))
const flagsOf = (w) => (Array.isArray(w?.flags) ? w.flags : [])
/** Cleanest first: fewest cautions, then longest. */
const sortWindows = (list) => [...list].sort((a, b) => (flagsOf(a).length - flagsOf(b).length) || ((b.minutes || 0) - (a.minutes || 0)))
const bestWindow = (d) => sortWindows(Array.isArray(d.auspicious_windows) ? d.auspicious_windows : [])[0] || null

/** One auspicious window: time, lagna, cautions. */
const GoodWindow = ({ w, base, hi }) => {
  const flags = flagsOf(w)
  return (
    <div className={`jt-win jt-win--good jt-win--card${flags.length === 0 ? ' is-clean' : ''}`}>
      <i aria-hidden="true" />
      <div className="jt-win__main">
        <div className="jt-win__top">
          <b>{wclock(w.start, base, hi)} – {wclock(w.end, base, hi)}</b>
          <span>{w.minutes != null ? fmtMinutes(w.minutes, hi) : ''}</span>
        </div>
        <div className="jt-win__meta">
          {w.lagna && <span><em>{t('lagna', hi)}</em> {w.lagna}</span>}
          {w.bana && <span><em>{t('bana', hi)}</em> {w.bana}</span>}
          {flags.length === 0
            ? <span className="jt-win__clean" title={t('cleanNote', hi)}>✓ {t('clean', hi)}</span>
            : <span className="jt-win__count">{flags.length} {t('cautions', hi)}</span>}
        </div>
        {flags.length > 0 && <ul className="jt-win__flags">{flags.map((f, i) => <li key={i}>{f}</li>)}</ul>}
      </div>
    </div>
  )
}

/** One avoid window: time + reason. Slots that carry a lagna were considered and rejected → greyed. */
const AvoidWindow = ({ w, base, hi }) => (
  <div className={`jt-win jt-win--bad jt-win--card${w.lagna ? ' is-muted' : ''}`}>
    <i aria-hidden="true" />
    <div className="jt-win__main">
      <div className="jt-win__top">
        <b>{wclock(w.start, base, hi)} – {wclock(w.end, base, hi)}</b>
        <span>{w.minutes != null ? fmtMinutes(w.minutes, hi) : ''}</span>
      </div>
      <div className="jt-win__meta">
        {w.lagna && <span><em>{t('lagna', hi)}</em> {w.lagna}</span>}
        {w.bana && <span><em>{t('bana', hi)}</em> {w.bana}</span>}
        {w.reason && <span className="jt-win__reason">{w.reason}</span>}
      </div>
    </div>
  </div>
)

const DayCard = ({ d, hi, open, onToggle }) => {
  const score = Number(d.score) || 0
  const tone = toneFor(score / 100)
  const reasons = Array.isArray(d.reasons) ? d.reasons : []
  const wins = sortWindows(Array.isArray(d.auspicious_windows) ? d.auspicious_windows : [])
  const avoidAll = Array.isArray(d.avoid_windows) ? d.avoid_windows : []
  const avoidPeriods = avoidAll.filter((w) => !w.lagna).sort((a, b) => String(a.start).localeCompare(String(b.start)))
  const avoidSlots = avoidAll.filter((w) => w.lagna).sort((a, b) => String(a.start).localeCompare(String(b.start)))
  const bw = bestWindow(d)
  return (
    <details className={`jt-mday jt-mday--${tone}`} id={`md-${d.date}`} open={open} onToggle={(e) => onToggle?.(d.date, e.currentTarget.open)}>
      <summary className="jt-mday__sum">
        <div className="jt-mday__date"><b>{dayOf(d.date)}</b><small>{monthShort(d.date, hi)}</small></div>
        <div className="jt-mday__t">
          <h3>{d.weekday ?? fmtDate(d.date, hi, { short: true })}{d.lunar_month ? ` · ${d.lunar_month}` : ''}</h3>
          <p>{d.tithi}{d.nakshatra ? ` · ${d.nakshatra}` : ''}</p>
          {bw && <p><em>{wclock(bw.start, d.date, hi)} – {wclock(bw.end, d.date, hi)}</em>{bw.lagna ? ` · ${bw.lagna} ${t('lagna', hi)}` : ''}{flagsOf(bw).length === 0 ? ` · ${t('clean', hi)}` : ''}</p>}
        </div>
        <div className="jt-mday__score">
          <ScoreRing value={score} max={100} size={50} stroke={5} tone={tone} label={num(score)} />
        </div>
      </summary>
      <div className="jt-mday__body">
        {(d.rating_label ?? d.rating) && <span className={`kd-badge kd-badge--${BADGE[tone]}`} style={{ justifySelf: 'start' }}>{d.rating_label ?? d.rating}</span>}
        <KV rows={[
          [t('tithi', hi), d.tithi], [t('nakshatra', hi), d.nakshatra], [t('yoga', hi), d.yoga],
          d.sun_sign && [t('sunSign', hi), d.sun_sign],
          [`${t('sunrise', hi)} / ${t('sunset', hi)}`, `${clock(d.sunrise)} / ${clock(d.sunset)}`],
        ]} />
        {reasons.length > 0 && (<div><div className="kd-eyebrow">{t('reasons', hi)}</div><ul className="kt-list kt-list--ok">{reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div>)}
        {wins.length > 0 && (<div><div className="kd-eyebrow">{t('windows', hi)} · {wins.length}</div><div className="jt-wins">{wins.map((w, i) => <GoodWindow key={`${w.start}-${i}`} w={w} base={d.date} hi={hi} />)}</div></div>)}
        {avoidPeriods.length > 0 && (<div><div className="kd-eyebrow">{t('avoidWindows', hi)}</div><div className="jt-wins">{avoidPeriods.map((w, i) => <AvoidWindow key={`${w.start}-${i}`} w={w} base={d.date} hi={hi} />)}</div></div>)}
        {avoidSlots.length > 0 && (
          <details className="jt-sub">
            <summary>{t('rejectedLagna', hi)} · {avoidSlots.length}</summary>
            <div className="jt-wins" style={{ marginTop: 8 }}>{avoidSlots.map((w, i) => <AvoidWindow key={`${w.start}-${i}`} w={w} base={d.date} hi={hi} />)}</div>
          </details>
        )}
        <div className="jt-mday__foot">
          <Link to={`/panchang?date=${d.date}`} className="kd-link">{t('viewPanchang', hi)} →</Link>
        </div>
      </div>
    </details>
  )
}

/** Rules panel for the activity (API `rules`, v0.4 shape). */
const RulesPanel = ({ rules, label, hi, open }) => {
  const list = (k) => (Array.isArray(rules?.[k]) ? rules[k] : [])
  const tithis = rules?.tithis && typeof rules.tithis === 'object' && !Array.isArray(rules.tithis) ? rules.tithis : null
  const shukla = tithis ? (tithis.shukla || []).map(String) : []
  const krishna = tithis ? (tithis.krishna || []).map(String) : []
  const legacyTithis = !tithis ? list('tithis').map(String) : []
  const facts = [
    rules?.time_of_day && [t('timeOfDay', hi), rules.time_of_day],
    rules?.vedha_chakra && [t('vedhaChakra', hi), rules.vedha_chakra],
    rules?.bana_avoid && [t('banaAvoid', hi), rules.bana_avoid],
    rules?.uttarayana_only && [t('uttarayanaOnly', hi), hi ? 'हाँ' : 'Yes'],
    rules?.bhadra_mrityulok_avoided && [t('bhadraAvoided', hi), hi ? 'हाँ' : 'Yes'],
  ].filter(Boolean)
  return (
    <details className="jt-mday jt-rules" open={open}>
      <summary className="jt-mday__sum" style={{ gridTemplateColumns: '1fr auto' }}>
        <div className="jt-mday__t"><h3>{t('rules', hi)} · {label}</h3><p>{list('nakshatras').length + list('nakshatras_alternative').length} {t('nakshatra', hi)} · {shukla.length + krishna.length + legacyTithis.length} {t('tithi', hi)} · {list('weekdays').length} {t('weekday', hi)}{list('lagnas').length ? ` · ${list('lagnas').length} ${t('lagna', hi)}` : ''}</p></div>
        <span className="pv-sec__chev" aria-hidden="true">›</span>
      </summary>
      <div className="jt-mday__body">
        {list('nakshatras').length > 0 && <div><div className="kd-eyebrow">{t('approvedNak', hi)}</div><StaticChips items={list('nakshatras')} tone="good" /></div>}
        {list('nakshatras_alternative').length > 0 && <div><div className="kd-eyebrow">{t('altNak', hi)}</div><StaticChips items={list('nakshatras_alternative')} /></div>}
        {shukla.length > 0 && <div><div className="kd-eyebrow">{t('approvedTithiShukla', hi)}</div><StaticChips items={shukla} tone="good" /></div>}
        {krishna.length > 0 && <div><div className="kd-eyebrow">{t('approvedTithiKrishna', hi)}</div><StaticChips items={krishna} tone="good" /></div>}
        {legacyTithis.length > 0 && <div><div className="kd-eyebrow">{t('approvedTithi', hi)}</div><StaticChips items={legacyTithis} tone="good" /></div>}
        {list('weekdays').length > 0 && <div><div className="kd-eyebrow">{t('approvedWeekday', hi)}</div><StaticChips items={list('weekdays')} tone="good" /></div>}
        {list('sun_months').length > 0 && <div><div className="kd-eyebrow">{t('approvedSunMonths', hi)}</div><StaticChips items={list('sun_months')} tone="good" /></div>}
        {list('lagnas').length > 0 && <div><div className="kd-eyebrow">{t('approvedLagnas', hi)}</div><StaticChips items={list('lagnas')} tone="good" /></div>}
        {list('yogas_avoid').length > 0 && <div><div className="kd-eyebrow">{t('avoidYogas', hi)}</div><StaticChips items={list('yogas_avoid')} tone="bad" /></div>}
        {facts.length > 0 && <KV rows={facts} />}
        {list('avoid').length > 0 && <div><div className="kd-eyebrow">{t('avoidPeriods', hi)}</div><ul className="kt-list kt-list--bad">{list('avoid').map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
        {rules?.extra && <p className="kd-hint" style={{ margin: 0 }}><b>{t('note', hi)}:</b> {rules.extra}</p>}
      </div>
    </details>
  )
}

/** Why the rest of the window was rejected (API `rejected_days`). */
const RejectedPanel = ({ list, hi, open }) => {
  const rows = (Array.isArray(list) ? list : []).filter((r) => r && r.reason).sort((a, b) => (Number(b.days) || 0) - (Number(a.days) || 0))
  if (rows.length === 0) return null
  const total = rows.reduce((n, r) => n + (Number(r.days) || 0), 0)
  return (
    <details className="jt-mday jt-rules" open={open}>
      <summary className="jt-mday__sum" style={{ gridTemplateColumns: '1fr auto' }}>
        <div className="jt-mday__t"><h3>{t('rejectedDays', hi)}</h3><p>{t('rejectedDaysSub', hi)}</p></div>
        <span className="pv-sec__chev" aria-hidden="true">›</span>
      </summary>
      <div className="jt-mday__body">
        <div className="jt-rej">
          {rows.map((r) => (
            <div key={r.reason_id || r.reason} className="jt-rej__row">
              <span className="jt-rej__bar" aria-hidden="true"><i style={{ width: `${total ? Math.max(3, Math.round(((Number(r.days) || 0) / total) * 100)) : 0}%` }} /></span>
              <span className="jt-rej__label">{r.reason}</span>
              <b className="jt-rej__n">{num(r.days)} <small>{t('daysUnitShort', hi)}</small></b>
            </div>
          ))}
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

  // Live activity list (25 keys → English label) from /api/v1/ephemeris.
  useEffect(() => {
    let alive = true
    fetchMuhuratActivities().then((a) => { if (alive && a && Object.keys(a).length) setActivities(a) }).catch(() => {})
    return () => { alive = false }
  }, [])

  // A shared link seeds the controls from the URL once. Old activity names map to the new keys.
  useEffect(() => {
    if (!params.get('activity')) return
    const lat = numParam(params, 'lat'), lon = numParam(params, 'lon')
    const loc = lat != null && lon != null ? { display_name: params.get('place') || `${lat}, ${lon}`, latitude: lat, longitude: lon, timezone: params.get('tz') || undefined } : null
    setPrefs((p) => ({
      ...p,
      activity: canonActivity(params.get('activity') || p.activity),
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
      activity: canonActivity(activity), date: params.get('date') || todayISO(),
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

  const activityIds = Object.keys(activities)
  const selectedActivity = activityIds.includes(canonActivity(prefs.activity)) ? canonActivity(prefs.activity) : activityIds[0]

  const submit = (e) => {
    e.preventDefault()
    const loc = prefs.location
    if (!loc || !Number.isFinite(Number(loc.latitude))) { setFormError(t('needLocation', hi)); return }
    if (!date) { setFormError(t('needDate', hi)); return }
    setFormError('')
    const p = new URLSearchParams({ activity: selectedActivity, date, days: String(prefs.days), min: String(prefs.minScore), lat: String(loc.latitude), lon: String(loc.longitude) })
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
  // The response's `activity` is always the canonical key, even when an old name was sent.
  const resultLabel = result ? activityLabel(result.activity, result.label, hi, result.hindi_name) : ''
  const count = Number.isFinite(Number(result?.count)) ? Number(result.count) : days.length
  const fewResults = count <= 5
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
          <Chips items={activityIds.map((id) => ({ id, label: activityLabel(id, activities[id], hi).split(' (')[0], on: selectedActivity === id }))}
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
      {showForm && result && <div style={{ marginTop: 'var(--s-4)' }}>{form}</div>}
      {(loading || error) && !result && <div style={{ marginTop: 'var(--s-4)' }}>{loading ? <Skeleton tiles={3} rows={3} height={120} text={t('muWorking', hi)} /> : <><ToolError message={error} onRetry={() => setAttempt((a) => a + 1)} retryLabel={t('retry', hi)} />{form}</>}</div>}

      {result && (
        <div className={`kd-results jt-muhurat${loading ? ' is-busy' : ''}`} aria-busy={loading}>
          <div className="jt-section__head">
            <p><strong style={{ color: 'var(--ink)' }}>{count}</strong> {t('daysFound', hi)} · {resultLabel}</p>
          </div>

          {days.length === 0 && <p className="kt-empty">{result.rejected_days?.length ? t('noDaysRules', hi) : t('noDays', hi)}</p>}
          {/* With no or few results, the rejection summary is the answer — show it first. */}
          {fewResults && <RejectedPanel list={result.rejected_days} hi={hi} open />}

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
                        {bw && <div className="jt-best__win">{wclock(bw.start, d.date, hi)} – {wclock(bw.end, d.date, hi)}{bw.lagna ? ` · ${bw.lagna}` : ''}</div>}
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

          {!fewResults && <RejectedPanel list={result.rejected_days} hi={hi} open={false} />}
          <RulesPanel rules={result.rules || {}} label={resultLabel} hi={hi} open={days.length === 0} />

          <p className="kd-foot">{result.place || params.get('place') || ''} · {t('footnote', hi)}</p>
        </div>
      )}
    </ToolShell>
  )
}

export default MuhuratFinderPage
