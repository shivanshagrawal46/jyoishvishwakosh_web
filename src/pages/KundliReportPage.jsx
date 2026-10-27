import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '../components/Header'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import { Mandala } from '../components/ui/Icons'
import KundliChart from '../components/kundli/KundliChart'
import { FLAGS, planetFlags, t } from '../components/kundli/kundliLabels'
import {
  AshtakavargaSection, AspectsSection, Card, DashaExplorer, DoshaSection, FriendshipSection, KPSection,
  KarakaSection, SadeSatiSection, VargaSection, YogaSection, YoginiSection,
} from '../components/kundli/KundliSections'
import { FaladeshPreview, FaladeshSection } from '../components/kundli/FaladeshSection'
import { LalKitabSection } from '../components/kundli/LalKitabSection'
import { KPKundaliSection } from '../components/kundli/KPKundaliSection'
import { AvasthaSection } from '../components/kundli/AvasthaSection'
import { CharaDashaSection } from '../components/kundli/CharaDashaSection'
import { fetchKundli } from '../services/kundliApi'
import '../styles/kundli.css'

const EASE = [0.22, 1, 0.36, 1]
const TABS = ['overview', 'charts', 'planets', 'yogas', 'dasha', 'faladesh', 'lalkitab', 'kp', 'vargas', 'ashtak', 'advanced']
const TAB_LABEL = {
  overview: 'tabOverview', charts: 'tabCharts', planets: 'tabPlanets', yogas: 'tabYogas', dasha: 'tabDasha',
  faladesh: 'tabFaladesh', lalkitab: 'tabLalKitab', kp: 'tabKP', vargas: 'tabVargas', ashtak: 'tabAshtak', advanced: 'tabAdvanced',
}
/** Tabs whose whole content comes from an optional response section (older charts may lack it). */
const TAB_SOURCE = { faladesh: 'faladesh', lalkitab: 'lal_kitab', kp: 'kp_kundali' }

const fmtDate = (iso, hi, short = false) => {
  if (!iso) return '-'
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  return d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: short ? 'short' : 'long', year: 'numeric' })
}
const fmtTime = (hms) => {
  if (!hms) return '-'
  const [h, m] = hms.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
const clock = (iso) => (iso ? fmtTime(iso.slice(11, 16)) : '-')
const tzLabel = (bd) => {
  const off = bd.utc_offset_hours, abs = Math.abs(off), h = Math.floor(abs), m = Math.round((abs - h) * 60)
  return `${bd.timezone} (UTC${off >= 0 ? '+' : '-'}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')})`
}

const Flags = ({ p, hi, compact = false }) => planetFlags(p, hi).map((f) => (
  <span key={f.sym} className={`kd-flag kd-flag--${f.tone}`} title={f.label}>{f.sym}{!compact && <span>{f.label}</span>}</span>
))

const Legend = ({ hi }) => (
  <div className="kd-legend" aria-label={t('legend', hi)}>
    <span><b>{hi ? 'ल' : 'As'}</b>{t('lagna', hi)}</span>
    {Object.values(FLAGS).map((f) => <span key={f.sym}><b>{f.sym}</b>{hi ? f.hi : f.en}</span>)}
  </div>
)

const KV = ({ rows }) => (
  <div className="kd-kv">{rows.map(([k, v]) => <div key={k}><b>{k}</b><span>{v ?? '-'}</span></div>)}</div>
)

/* ───────────────────────── Charts ───────────────────────── */
function ChartSection({ id, titleKey, subKey, chart, style, hi }) {
  return (
    <Card id={id} title={t(titleKey, hi)} sub={t(subKey, hi)}
      right={<span className="kd-hint">{t('lagna', hi)}: <strong>{chart.ascendant_sign}</strong>{chart.ascendant_degree_dms ? ` ${chart.ascendant_degree_dms}` : ''}</span>}>
      <div className="kd-chartrow">
        <div className="kd-chartwrap"><KundliChart chart={chart} style={style} hi={hi} title={t(titleKey, hi)} /></div>
        <div>
          <div className="kd-eyebrow">{t('housesTitle', hi)}</div>
          <div className="kd-houses">
            {chart.houses.map((h) => (
              <div key={h.house} className={`kd-house${h.house === 1 ? ' is-lagna' : ''}`}>
                <div className="kd-house__n">{h.house}</div>
                <div>
                  <div className="kd-house__sign">{h.sign} · {h.sign_lord}</div>
                  <div className="kd-house__planets">
                    {h.ascendant_degree_dms && <span className="kd-house__asc">{t('lagna', hi)} <em>{h.ascendant_degree_dms}</em></span>}
                    {h.planets.length === 0 && !h.ascendant_degree_dms && <i>{t('empty', hi)}</i>}
                    {h.planets.map((p) => <span key={p.id}><strong>{p.name}</strong> <em>{p.degrees_in_sign_dms}</em><Flags p={p} hi={hi} compact /></span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Legend hi={hi} />
    </Card>
  )
}

/* ───────────────────────── Tab bar ───────────────────────── */
function TabBar({ active, onChange, hi, counts, tabs = TABS }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current?.querySelector('[aria-selected="true"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])
  const onKey = (e) => {
    const i = tabs.indexOf(active)
    if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length])
    if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length])
  }
  return (
    <div className="kd-tabs" role="tablist" ref={ref} onKeyDown={onKey} aria-label={t('report', hi)}>
      {tabs.map((id) => (
        <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={active === id} aria-controls={`panel-${id}`} tabIndex={active === id ? 0 : -1}
          className={`kd-tab${active === id ? ' is-active' : ''}`} onClick={() => onChange(id)}>
          {active === id && <motion.span layoutId="kd-tab-ink" className="kd-tab__ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
          <span className="kd-tab__label">{t(TAB_LABEL[id], hi)}{counts?.[id] != null && <small>{counts[id]}</small>}</span>
        </button>
      ))}
    </div>
  )
}

/* ───────────────────────── Page ───────────────────────── */
const KundliReportPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [chartStyle, setChartStyle] = useState(() => { try { return localStorage.getItem('jv-chart-style') || 'north' } catch { return 'north' } })
  // Hide tabs whose section is missing from this response (very old charts / trimmed API).
  const tabs = useMemo(() => (result ? TABS.filter((id) => !TAB_SOURCE[id] || result[TAB_SOURCE[id]]) : TABS), [result])
  const tab = tabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview'
  const panelTop = useRef(null)

  const setTab = useCallback((id) => {
    navigate({ search: location.search, hash: id === 'overview' ? '' : `#${id}` }, { replace: true })
    const y = (panelTop.current?.getBoundingClientRect().top || 0) + window.scrollY - 140
    if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  }, [navigate, location.search])

  const handleLanguageChange = (lang) => { setLanguage(lang); if (setLanguageProp) setLanguageProp(lang) }
  useEffect(() => { try { localStorage.setItem('jv-chart-style', chartStyle) } catch {} }, [chartStyle])

  const payload = useMemo(() => {
    const date = params.get('date'), time = params.get('time'), place = params.get('place')
    if (!date || !time || !place) return null
    const p = {
      name: params.get('name') || undefined, gender: params.get('gender') || undefined, date, time, place,
      ayanamsa: params.get('ayanamsa') || 'lahiri', node_type: params.get('node') || 'mean',
      include_outer_planets: params.get('outer') !== '0', dasha_levels: 2, language: hi ? 'hi' : 'en',
    }
    if (params.get('lat') && params.get('lon')) {
      p.latitude = Number(params.get('lat')); p.longitude = Number(params.get('lon'))
      if (params.get('tz')) p.timezone = params.get('tz')
    }
    return p
  }, [params, hi])

  useEffect(() => {
    if (!payload) { setLoading(false); setError(t('missingParams', hi)); return }
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchKundli(payload, { signal: ctrl.signal })
      .then((data) => setResult(data))
      .catch((err) => { if (err.name !== 'AbortError') { setResult(null); setError(err.status ? err.message : t('offline', hi)) } })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [payload]) // eslint-disable-line react-hooks/exhaustive-deps

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  const bd = result?.birth_details, lagna = result?.lagna
  const moon = useMemo(() => result?.planets?.find((p) => p.id === 'Moon'), [result])
  const sun = useMemo(() => result?.planets?.find((p) => p.id === 'Sun'), [result])
  const today = new Date().toISOString().slice(0, 10)
  const formedYogas = result?.yogas?.filter((y) => y.present) || []
  const presentDoshas = result ? [result.doshas.mangal, result.doshas.kaal_sarp, ...result.doshas.others].filter((d) => d.present) : []
  const counts = result ? {
    yogas: result.yoga_summary?.present?.length ?? formedYogas.length, vargas: Object.keys(result.divisional_charts).length,
    ...(Array.isArray(result.kp_kundali?.promises) ? { kp: result.kp_kundali.promises.filter((p) => /^promised$/i.test(p.verdict || '')).length } : {}),
    ...(Array.isArray(result.lal_kitab?.rin) ? { lalkitab: result.lal_kitab.rin.filter((r) => r.present).length } : {}),
  } : null
  const badWord = hi ? 'अशुभ' : 'inauspicious'

  const chartDefs = result ? [
    ['chart-d1', 'lagnaChart', 'lagnaChartSub', result.charts.d1_lagna],
    ['chart-moon', 'chandraChart', 'chandraChartSub', result.charts.chandra],
    ['chart-d9', 'navamsaChart', 'navamsaChartSub', result.charts.d9_navamsa],
    ...(result.charts.chalit ? [['chart-chalit', 'chalitChart', 'chalitChartSub', result.charts.chalit]] : []),
  ] : []

  const styleToggle = (
    <div className="kd-seg" role="group" style={{ minWidth: 240 }}>
      <button type="button" aria-pressed={chartStyle === 'north'} onClick={() => setChartStyle('north')}>{t('north', hi)}</button>
      <button type="button" aria-pressed={chartStyle === 'south'} onClick={() => setChartStyle('south')}>{t('south', hi)}</button>
    </div>
  )

  const renderTab = () => {
    switch (tab) {
      case 'charts':
        return (<>
          <div className="kd-toolbar"><h2 className="kd-card__title">{t('charts', hi)}</h2>{styleToggle}</div>
          {chartDefs.map(([id, tk, sk, ch]) => <ChartSection key={id} id={id} titleKey={tk} subKey={sk} chart={ch} style={chartStyle} hi={hi} />)}
        </>)
      case 'planets':
        return (<>
          <section className="kd-card" id="planets">
            <div className="kd-card__head"><h2 className="kd-card__title">{t('planets', hi)}</h2></div>
            <div className="kd-tablewrap">
              <table className="kd-table">
                <thead><tr>
                  <th>{t('planet', hi)}</th><th>{t('sign', hi)}</th><th>{t('degree', hi)}</th><th>{t('signLord', hi)}</th>
                  <th>{t('nakshatra', hi)}</th><th>{t('pada', hi)}</th><th>{t('nakLord', hi)}</th><th>{t('house', hi)}</th>
                  <th>{t('dignity', hi)}</th><th>{t('nature', hi)}</th><th>{t('avastha', hi)}</th><th>{t('status', hi)}</th>
                </tr></thead>
                <tbody>
                  <tr className="is-asc">
                    <td className="kd-name">{lagna.name}<Flags p={lagna} hi={hi} /></td><td>{lagna.sign}</td><td className="kd-deg">{lagna.degrees_in_sign_dms}</td><td>{lagna.sign_lord}</td>
                    <td>{lagna.nakshatra.name}</td><td>{lagna.nakshatra.pada}</td><td>{lagna.nakshatra.lord}</td><td>1</td>
                    <td>-</td><td>-</td><td>-</td><td>{lagna.is_vargottama ? FLAGS.vargottama[hi ? 'hi' : 'en'] : '-'}</td>
                  </tr>
                  {result.planets.map((p) => (
                    <tr key={p.id}>
                      <td className="kd-name">{p.name}<Flags p={p} hi={hi} /></td><td>{p.sign}</td><td className="kd-deg">{p.degrees_in_sign_dms}</td><td>{p.sign_lord}</td>
                      <td>{p.nakshatra.name}</td><td>{p.nakshatra.pada}</td><td>{p.nakshatra.lord}</td><td>{p.house}</td><td>{p.dignity}</td>
                      <td>{p.nature_id === 'Neutral' ? '-' : <span className={`kd-flag kd-flag--${p.nature_id === 'Benefic' ? 'good' : 'bad'}`} style={{ marginLeft: 0 }}>{p.nature}</span>}</td>
                      <td>{p.avastha}</td><td>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="kd-card__body" style={{ paddingTop: 0 }}><Legend hi={hi} /></div>
          </section>
          <AvasthaSection av={result.avasthas} hi={hi} />
          <AspectsSection aspects={result.aspects} hi={hi} />
        </>)
      case 'yogas':
        return (<>
          <YogaSection yogas={result.yogas} summary={result.yoga_summary} hi={hi} />
          <DoshaSection doshas={result.doshas} hi={hi} />
          <SadeSatiSection ss={result.doshas.sade_sati} hi={hi} />
        </>)
      case 'dasha':
        return (<>
          <Card id="dasha" title={t('dasha', hi)} right={<span className="kd-hint">{t('balance', hi)}: <strong>{result.vimshottari_dasha.balance_at_birth.lord} {result.vimshottari_dasha.balance_at_birth.formatted}</strong></span>}>
            {result.vimshottari_dasha.current && (
              <div className="kd-stats" style={{ marginTop: 0, marginBottom: 20 }}>
                <div className="kd-stat"><b>{t('current', hi)} · {t('mahadasha', hi)}</b><span>{result.vimshottari_dasha.current.mahadasha}</span><small>{fmtDate(result.vimshottari_dasha.current.mahadasha_start, hi, true)} – {fmtDate(result.vimshottari_dasha.current.mahadasha_end, hi, true)}</small></div>
                {result.vimshottari_dasha.current.antardasha && <div className="kd-stat"><b>{t('antardasha', hi)}</b><span>{result.vimshottari_dasha.current.antardasha}</span><small>{fmtDate(result.vimshottari_dasha.current.antardasha_start, hi, true)} – {fmtDate(result.vimshottari_dasha.current.antardasha_end, hi, true)}</small></div>}
              </div>
            )}
            <div className="kd-dasha">
              {result.vimshottari_dasha.mahadashas.map((md) => {
                const cur = md.start <= today && today < md.end
                return (
                  <details key={`${md.lord_id}-${md.start}`} className={`kd-md${cur ? ' is-current' : ''}`} open={cur}>
                    <summary><b>{md.lord} {t('mahadasha', hi)}</b><span>{fmtDate(md.start, hi, true)}</span><span>{fmtDate(md.end, hi, true)}</span><span>{md.years} {t('years', hi)}</span></summary>
                    <div className="kd-md__body">
                      <div className="kd-md__row is-head"><span>{t('antardasha', hi)}</span><span>{t('start', hi)}</span><span>{t('end', hi)}</span></div>
                      {(md.antardashas || []).map((ad) => (
                        <div key={`${ad.lord_id}-${ad.start}`} className={`kd-md__row${ad.start <= today && today < ad.end ? ' is-current' : ''}`}>
                          <span>{md.lord} – {ad.lord}</span><span>{fmtDate(ad.start, hi, true)}</span><span>{fmtDate(ad.end, hi, true)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )
              })}
            </div>
          </Card>
          <DashaExplorer payload={payload} hi={hi} today={today} />
          <YoginiSection yd={result.yogini_dasha} hi={hi} />
          <CharaDashaSection cd={result.chara_dasha} hi={hi} />
        </>)
      case 'faladesh':
        return <FaladeshSection fal={result.faladesh} hi={hi} />
      case 'lalkitab':
        return <LalKitabSection lk={result.lal_kitab} hi={hi} />
      case 'kp':
        return <KPKundaliSection kp={result.kp_kundali} hi={hi} />
      case 'vargas':
        return (<>
          <div className="kd-toolbar"><h2 className="kd-card__title">{t('vargas', hi)}</h2>{styleToggle}</div>
          <VargaSection charts={result.divisional_charts} table={result.shodashvarga} style={chartStyle} hi={hi} />
        </>)
      case 'ashtak':
        return <AshtakavargaSection av={result.ashtakavarga} hi={hi} />
      case 'advanced':
        return (<>
          <FriendshipSection fr={result.friendship} hi={hi} />
          <KPSection kp={result.kp} hi={hi} />
          <KarakaSection karakas={result.jaimini_karakas} gems={result.gemstones} hi={hi} />
        </>)
      default: {
        const cur = result.vimshottari_dasha.current
        return (<>
          <div className="kd-eyebrow">{t('glance', hi)}</div>
          <div className="kd-stats kd-stats--hero">
            <div className="kd-stat"><b>{t('lagna', hi)}</b><span>{lagna.sign}</span><small>{lagna.degrees_in_sign_dms} · {lagna.sign_lord}</small></div>
            <div className="kd-stat"><b>{t('moonSign', hi)}</b><span>{moon?.sign}</span><small>{moon?.sign_lord}</small></div>
            <div className="kd-stat"><b>{t('nakshatra', hi)}</b><span>{moon?.nakshatra?.name}</span><small>{t('pada', hi)} {moon?.nakshatra?.pada} · {moon?.nakshatra?.lord}</small></div>
            <div className="kd-stat"><b>{t('sunSign', hi)}</b><span>{sun?.sign}</span><small>{sun?.degrees_in_sign_dms}</small></div>
            <div className="kd-stat"><b>{t('tithi', hi)}</b><span>{result.panchang.tithi.name}</span><small>{result.panchang.tithi.paksha} · {result.panchang.vara.name}</small></div>
            {cur && <div className="kd-stat kd-stat--accent"><b>{t('dashaNow', hi)}</b><span>{cur.mahadasha}{cur.antardasha ? ` – ${cur.antardasha}` : ''}</span><small>{t('until', hi)} {fmtDate(cur.antardasha_end || cur.mahadasha_end, hi, true)}</small></div>}
          </div>

          <div className="kd-two kd-two--wide">
            <Card title={t('lagnaPreview', hi)} right={<button type="button" className="kd-link" onClick={() => setTab('charts')}>{t('openCharts', hi)} →</button>}>
              <div className="kd-preview"><KundliChart chart={result.charts.d1_lagna} style={chartStyle} hi={hi} title={t('lagnaChart', hi)} compact /></div>
              <Legend hi={hi} />
            </Card>
            <div className="kd-stack">
              <Card title={t('highlights', hi)}>
                <div className="kd-eyebrow">{t('formedYogas', hi)} · {formedYogas.length}</div>
                <div className="kd-chips">
                  {formedYogas.map((y) => <button type="button" key={y.id} className={`kd-chip${y.category === badWord ? ' kd-chip--bad' : ' kd-chip--good'}`} onClick={() => setTab('yogas')}>{y.name}</button>)}
                  {formedYogas.length === 0 && <span className="kd-hint">{t('absent', hi)}</span>}
                </div>
                <div className="kd-eyebrow" style={{ marginTop: 16 }}>{t('doshasPresent', hi)}</div>
                <div className="kd-chips">
                  {presentDoshas.map((d) => <button type="button" key={d.id} className="kd-chip kd-chip--bad" onClick={() => setTab('yogas')}>{d.name}{d.level ? ` · ${d.level}` : ''}</button>)}
                  {presentDoshas.length === 0 && <span className="kd-chip kd-chip--good">{t('noDosha', hi)}</span>}
                </div>
                <div className="kd-eyebrow" style={{ marginTop: 16 }}>{t('sadeStatus', hi)}</div>
                <div className="kd-chips"><button type="button" className={`kd-chip${result.doshas.sade_sati.current ? ' kd-chip--warn' : ''}`} onClick={() => setTab('yogas')}>{result.doshas.sade_sati.status}</button></div>
              </Card>
              <Card title={t('panchang', hi)}>
                <KV rows={[
                  [t('tithi', hi), `${result.panchang.tithi.paksha} ${result.panchang.tithi.name}`],
                  [t('nakshatra', hi), `${result.panchang.nakshatra.name} (${t('pada', hi)} ${result.panchang.nakshatra.pada})`],
                  [t('yoga', hi), result.panchang.yoga.name], [t('karana', hi), result.panchang.karana.name], [t('vara', hi), result.panchang.vara.name],
                  [`${t('sunrise', hi)} / ${t('sunset', hi)}`, `${clock(result.panchang.sunrise)} / ${clock(result.panchang.sunset)}`],
                ]} />
              </Card>
            </div>
          </div>

          <FaladeshPreview fal={result.faladesh} hi={hi} onOpen={() => setTab('faladesh')} />

          <div className="kd-two">
            <Card title={t('basic', hi)}>
              <KV rows={[
                [t('date', hi), fmtDate(bd.date, hi)], [t('time', hi), fmtTime(bd.time)], [t('place', hi), bd.place],
                [t('latlon', hi), `${bd.latitude.toFixed(4)}°, ${bd.longitude.toFixed(4)}°`], [t('tz', hi), tzLabel(bd)],
                [t('ayanamsaVal', hi), bd.ayanamsa_dms], [t('lagnaLord', hi), lagna.sign_lord],
              ]} />
            </Card>
            <Card title={t('avakhada', hi)}>
              <KV rows={[
                [t('varna', hi), result.avakhada.varna], [t('vashya', hi), result.avakhada.vashya], [t('yoni', hi), result.avakhada.yoni],
                [t('gana', hi), result.avakhada.gana], [t('nadi', hi), result.avakhada.nadi], [t('signLord', hi), result.avakhada.sign_lord],
                [t('nakLord', hi), result.avakhada.nakshatra_lord], [t('charan', hi), result.avakhada.charan], [t('nameAlpha', hi), result.avakhada.name_alphabet],
                [t('tatva', hi), result.avakhada.tatva], [t('paya', hi), result.avakhada.paya], [t('yunja', hi), result.avakhada.yunja],
              ]} />
            </Card>
          </div>
        </>)
      }
    }
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <ServicesStrip language={language} activeService="kundli" />

      <main className="calc-page-main kd-report" id="main">
        <div className="calc-page-container">
          {loading && (
            <div className="kd-skeleton" role="status" aria-live="polite">
              <div className="kd-skeleton__hero" />
              <div className="kd-skeleton__row">{Array.from({ length: 5 }, (_, i) => <div key={i} className="kd-skeleton__tile" />)}</div>
              <div className="kd-skeleton__card" />
              <p>{t('working', hi)}</p>
            </div>
          )}

          {!loading && error && (
            <div className="calc-form-card" style={{ textAlign: 'center' }}>
              <div className="calc-error-message" role="alert" style={{ justifyContent: 'center' }}>{error}</div>
              <div style={{ marginTop: 16 }}><Link to="/kundli" className="calc-form-submit">{t('edit', hi)}</Link></div>
            </div>
          )}

          {!loading && result && bd && (
            <div className="kd-results">
              <section className="kd-hero kd-hero--v2">
                <Mandala className="kd-hero__mandala" aria-hidden="true" />
                <div className="kd-hero__text">
                  <div className="kd-hero__eyebrow">{t('report', hi)}</div>
                  <h1 className="kd-hero__name">{bd.name || t('native', hi)}</h1>
                  <p className="kd-hero__line">
                    {t('born', hi)} <b>{fmtDate(bd.date, hi)}</b> {t('at', hi)} <b>{fmtTime(bd.time)}</b> · {bd.place}{bd.gender ? ` · ${bd.gender}` : ''}
                  </p>
                  <p className="kd-hero__meta">{t('lagna', hi)} <b>{lagna.sign} {lagna.degrees_in_sign_dms}</b> · {t('moonSign', hi)} <b>{moon?.sign}</b> · {moon?.nakshatra?.name} {moon?.nakshatra?.pada}</p>
                  <div className="kd-hero__actions">
                    <button type="button" className="kd-btn-ghost" onClick={() => navigate('/kundli')}>✎ {t('edit', hi)}</button>
                    <button type="button" className="kd-btn-ghost" onClick={() => window.print()}>🖨 {t('print', hi)}</button>
                    <button type="button" className="kd-btn-ghost" onClick={copyLink}>🔗 {copied ? t('copied', hi) : t('share', hi)}</button>
                  </div>
                </div>
                <div className="kd-hero__chart" aria-hidden="true">
                  <KundliChart chart={result.charts.d1_lagna} style={chartStyle} hi={hi} title="" compact />
                </div>
              </section>

              <TabBar active={tab} onChange={setTab} hi={hi} counts={counts} tabs={tabs} />

              <div ref={panelTop} />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="kd-panel"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }}>
                  {renderTab()}
                </motion.div>
              </AnimatePresence>

              <p className="kd-foot">{t('generated', hi)} · {t('footnote', hi)}</p>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

export default KundliReportPage
