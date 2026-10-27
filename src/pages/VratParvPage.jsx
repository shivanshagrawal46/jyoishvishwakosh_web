import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolError, ToolShell } from '../components/tools/ToolShell'
import useStoredState from '../components/tools/useStoredState'
import { DEFAULT_PLACE, monthName, t } from '../components/tools/toolLabels'
import { clock, dayOf, fmtDate, todayISO } from '../components/tools/format'
import { fetchFestivals } from '../services/kundliApi'
import { MonthBar } from '../components/panchang/Day'
import { Chips, MonthGrid, Panel, Skeleton } from '../components/tools/jt'
import { IconSunrise } from '../components/ui/Icons'
import '../styles/kundli.css'
import '../styles/kundli-tools.css'
import '../styles/jyotish-tools.css'

const PREF_KEY = 'jv-vrat-prefs'
const DEFAULT_PREFS = { place: DEFAULT_PLACE.display_name, placeMeta: DEFAULT_PLACE, location: DEFAULT_PLACE, includeMonthly: true }
const MIN_YEAR = 1700, MAX_YEAR = 2200
const clampYear = (y) => Math.min(MAX_YEAR, Math.max(MIN_YEAR, y))

/** Calendar dot / chip colour per API category. */
const TONE = {
  festival: 'saffron', jayanti: 'gold', sankranti: 'bad',
  purnima: 'good', amavasya: 'good', shivaratri: 'good',
  ekadashi: 'indigo', vrat: 'indigo', pradosh: 'indigo', chaturthi: 'indigo', ashtami: 'indigo', shashthi: 'indigo',
}
const TONE_VAR = { saffron: 'var(--saffron)', gold: 'var(--gold)', bad: 'var(--vermilion)', good: 'var(--jade)', indigo: 'var(--indigo)' }
const toneOf = (cat) => TONE[cat] || 'saffron'

const LunarStrip = ({ months, hi, nowISO }) => {
  if (!Array.isArray(months) || months.length === 0) return null
  return (
    <div className="jt-lunar" aria-label={t('lunarMonths', hi)}>
      {months.map((m, i) => {
        const current = m.start && m.end && m.start.slice(0, 10) <= nowISO && nowISO < m.end.slice(0, 10)
        return (
          <div key={`${m.amanta_en || m.amanta}-${m.start || i}`} className={`jt-lunar__chip${current ? ' is-current' : ''}${m.adhik ? ' is-adhik' : ''}`}>
            <b>{m.amanta ?? m.amanta_en ?? '-'}{m.adhik && <span className="kd-badge kd-badge--warn">{t('adhik', hi)}</span>}{m.kshaya && <span className="kd-badge kd-badge--bad">{t('kshaya', hi)}</span>}</b>
            <small>{fmtDate(m.start, hi, { short: true, year: false })} – {fmtDate(m.end, hi, { short: true, year: false })}</small>
          </div>
        )
      })}
    </div>
  )
}

const Event = ({ e, hi }) => (
  <div className="jt-ev">
    <div className="jt-ev__name">
      <h3>{e.name ?? e.name_en ?? '-'}</h3>
      {e.name_en && e.name_en !== e.name && <small>{e.name_en}</small>}
    </div>
    <div className="jt-ev__cat">
      {(e.category_label ?? e.category) && <span className={`kd-badge kt-cat kt-cat--${e.category || 'other'}`}>{e.category_label ?? e.category}</span>}
    </div>
    <div className="jt-ev__meta">
      {e.tithi_at_sunrise && <span><b>{t('tithiSunrise', hi)}</b>{e.tithi_at_sunrise}</span>}
      {e.nakshatra_at_sunrise && <span><b>{t('nakSunrise', hi)}</b>{e.nakshatra_at_sunrise}</span>}
      {(e.rule_label ?? e.rule) && <span><b>{t('rule', hi)}</b>{e.rule_label ?? e.rule}</span>}
      {e.sankranti_time && <span><IconSunrise s={13} style={{ verticalAlign: '-2px', marginRight: 4, color: 'var(--saffron)' }} />{t('sankrantiAt', hi)} <em>{clock(e.sankranti_time)}</em></span>}
      {e.vaishnava_date && <span><b>{t('vaishnava', hi)}</b><em>{fmtDate(e.vaishnava_date, hi, { short: true, weekday: true })}</em></span>}
    </div>
    {e.note && <p className="jt-ev__note">{e.note}</p>}
  </div>
)

const DayCard = ({ date, list, hi, isToday, selected }) => (
  <article className={`jt-day${isToday ? ' is-today' : ''}${selected ? ' is-selected' : ''}`} id={`vd-${date}`}>
    <div className="jt-day__rail">
      <b>{dayOf(date)}</b>
      <small>{new Date(`${date}T00:00:00`).toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { weekday: 'short' })}</small>
      {isToday && <small style={{ marginTop: 4 }}>{t('today', hi)}</small>}
    </div>
    <div className="jt-day__list">{list.map((e, i) => <Event key={`${e.name_en || e.name}-${i}`} e={e} hi={hi} />)}</div>
  </article>
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
  const setYM = (y, m) => setQuery({ year: y, month: m === 0 ? 'all' : m })

  const [prefs, setPrefs] = useStoredState(PREF_KEY, DEFAULT_PREFS)
  const loc = prefs.location && Number.isFinite(Number(prefs.location.latitude)) ? prefs.location : DEFAULT_PLACE
  const setPlace = (p) => setPrefs((pr) => ({ ...pr, place: p.display_name, placeMeta: p, location: p }))
  const [cats, setCats] = useState(() => new Set())
  const [selected, setSelected] = useState(null)
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
  /** Group by month, then by day. */
  const groups = useMemo(() => {
    const map = new Map()
    filtered.forEach((e) => {
      const ym = (e.date || '').slice(0, 7)
      if (!map.has(ym)) map.set(ym, new Map())
      const days = map.get(ym)
      if (!days.has(e.date)) days.set(e.date, [])
      days.get(e.date).push(e)
    })
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ym, days]) => [ym, [...days.entries()].sort(([a], [b]) => a.localeCompare(b))])
  }, [filtered])
  const hasToday = filtered.some((e) => e.date === nowISO)

  /** Calendar marks for the visible month (or the current month when the whole year is shown). */
  const calMonth = month === 0 ? (year === thisYear ? thisMonth : 1) : month
  const marks = useMemo(() => {
    const m = {}
    events.filter((e) => Number(e.date?.slice(5, 7)) === calMonth && (cats.size === 0 || cats.has(e.category))).forEach((e) => {
      if (!m[e.date]) m[e.date] = { dots: [], label: '' }
      const tone = toneOf(e.category)
      if (!m[e.date].dots.includes(tone)) m[e.date].dots.push(tone)
      m[e.date].label = m[e.date].label ? `${m[e.date].label}, ${e.name}` : e.name
    })
    return m
  }, [events, calMonth, cats])

  const toggleCat = (id) => setCats((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const jumpTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const pickDay = (iso) => {
    setSelected(iso)
    if (month !== 0 && Number(iso.slice(5, 7)) !== month) setYM(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)))
    setTimeout(() => jumpTo(`vd-${iso}`), 60)
  }

  const chipItems = [
    { id: '__all', label: t('all', hi), on: cats.size === 0 },
    ...categories.map(([id, label]) => ({ id, label, on: cats.has(id), dot: TONE_VAR[toneOf(id)], count: events.filter((e) => e.category === id && (month === 0 || Number(e.date?.slice(5, 7)) === month)).length })),
  ]

  return (
    <ToolShell language={language} onLanguage={onLanguage} active="vratparv" wide>
      <div className="jt-pagehead">
        <h1>{t('vTitle', hi)}</h1>
        <p className="jt-pagehead__sub">{t('vSubtitle', hi)}</p>
      </div>

      <MonthBar hi={hi} year={year} month={month} onChange={setYM} place={loc} setPlace={setPlace}
        allLabel={t('allMonths', hi)} monthName={(m) => monthName(m, hi)} min={MIN_YEAR} max={MAX_YEAR} />

      {loading && !data && <Skeleton tiles={0} rows={5} height={110} text={t('vWorking', hi)} />}
      {!loading && error && <ToolError message={error} onRetry={() => setAttempt((a) => a + 1)} retryLabel={t('retry', hi)} />}

      {data && !error && (
        <div className={`jt-vrat${loading ? ' is-busy' : ''}`} aria-busy={loading}>
          <aside className="jt-vrat__aside">
            <Panel title={`${monthName(calMonth, hi)} ${year}`} sub={`${Object.keys(marks).length} ${t('eventsCount', hi)}`}
              right={<label className="jt-switch"><input type="checkbox" checked={!!prefs.includeMonthly} onChange={(e) => setPrefs((p) => ({ ...p, includeMonthly: e.target.checked }))} /><span>{t('monthly', hi)}</span></label>}>
              <MonthGrid year={year} month={calMonth} marks={marks} selected={selected} today={nowISO} hi={hi} onPick={pickDay} />
              <div className="jt-legend">
                {[['festival', 'saffron'], ['ekadashi', 'indigo'], ['purnima', 'good'], ['sankranti', 'bad'], ['jayanti', 'gold']].map(([id, tone]) => {
                  const label = categories.find(([c]) => c === id)?.[1]
                  return label ? <span key={id}><i style={{ background: TONE_VAR[tone] }} />{label}</span> : null
                })}
              </div>
            </Panel>
            <Panel title={t('lunarMonths', hi)} className="jt-only-desktop">
              <LunarStrip months={data.lunar_months} hi={hi} nowISO={nowISO} />
            </Panel>
          </aside>

          <div className="jt-vrat__main">
            {categories.length > 0 && (
              <Chips scroll items={chipItems} onToggle={(id) => (id === '__all' ? setCats(new Set()) : toggleCat(id))} />
            )}

            <div className="jt-section__head">
              <p><strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> {t('eventsCount', hi)} · {month === 0 ? year : `${monthName(month, hi)} ${year}`}</p>
              {hasToday && <button type="button" className="kd-link" onClick={() => jumpTo(`vd-${nowISO}`)}>{t('jumpToday', hi)} ↓</button>}
            </div>

            {groups.length === 0 && <p className="kt-empty">{t('noEvents', hi)}</p>}
            <div className="jt-days">
              {groups.map(([ym, days]) => (
                <React.Fragment key={ym}>
                  {month === 0 && <h2 className="jt-monthhead jt-sticky"><span>{monthName(Number(ym.slice(5, 7)), hi)} {ym.slice(0, 4)}</span><small>{days.reduce((n, [, l]) => n + l.length, 0)}</small></h2>}
                  {days.map(([date, list]) => <DayCard key={date} date={date} list={list} hi={hi} isToday={date === nowISO} selected={date === selected} />)}
                </React.Fragment>
              ))}
            </div>

            <Panel title={t('lunarMonths', hi)} className="jt-only-mobile">
              <LunarStrip months={data.lunar_months} hi={hi} nowISO={nowISO} />
            </Panel>
            <p className="kd-foot">{loc.display_name || `${loc.latitude}, ${loc.longitude}`} · {t('footnote', hi)}</p>
          </div>
        </div>
      )}
    </ToolShell>
  )
}

export default VratParvPage
