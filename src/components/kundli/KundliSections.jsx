import React, { useEffect, useMemo, useState } from 'react'
import KundliChart from './KundliChart'
import { planetFlags, t, yogaGroupName, YOGA_GROUPS } from './kundliLabels'
import { fetchDashaPeriods } from '../../services/kundliApi'

export const fmtDate = (iso, hi) => {
  if (!iso) return '-'
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
const fmtDateTime = (iso, hi) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const Card = ({ id, title, sub, right, children, className = '' }) => (
  <section className={`kd-card ${className}`} id={id}>
    <div className="kd-card__head">
      <h2 className="kd-card__title">{title}</h2>
      {right}
      {sub && <p className="kd-card__sub">{sub}</p>}
    </div>
    <div className="kd-card__body">{children}</div>
  </section>
)

/* ───────────────────────── Vimshottari explorer ───────────────────────── */
export function DashaExplorer({ payload, hi, today }) {
  const [path, setPath] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const levelLabel = { mahadasha: t('mahadasha', hi), antardasha: t('antardasha', hi), pratyantardasha: t('pratyantar', hi), sookshma: t('sookshma', hi), prana: t('prana', hi) }

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchDashaPeriods(payload, path, { signal: ctrl.signal })
      .then(setData)
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [payload, path])

  const nowIso = new Date().toISOString().slice(0, 16)
  return (
    <Card id="dasha-explorer" title={t('dashaExplorer', hi)} sub={t('dashaExplorerSub', hi)}>
      <div className="kd-crumbs">
        <button type="button" onClick={() => setPath([])}>{t('allMaha', hi)}</button>
        {(data?.path || []).map((p, i) => (
          <React.Fragment key={i}>
            <i>›</i>
            <button type="button" onClick={() => setPath(path.slice(0, i + 1))}>{p.lord} <small>({levelLabel[p.level]})</small></button>
          </React.Fragment>
        ))}
        {data && <><i>›</i><b>{levelLabel[data.level]}</b></>}
      </div>
      {loading && <p className="kd-hint">{t('loadingPeriods', hi)}</p>}
      {error && <p className="kd-hint" style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && data && (
        <div className="kd-periods">
          {data.periods.map((p) => {
            const isCurrent = p.start <= nowIso && nowIso < p.end
            const deep = data.level === 'sookshma' || data.level === 'prana'
            return (
              <button type="button" key={`${p.lord_id}-${p.start}`} className={`kd-period${isCurrent ? ' is-current' : ''}`}
                disabled={!p.has_children} onClick={() => p.has_children && setPath([...path, p.lord_id])}>
                <b>{(data.path.length ? data.path.map((x) => x.lord).join(' – ') + ' – ' : '') + p.lord}</b>
                <span>{deep ? fmtDateTime(p.start, hi) : fmtDate(p.start, hi)}</span>
                <span>{deep ? fmtDateTime(p.end, hi) : fmtDate(p.end, hi)}</span>
                <span className="kd-period__go">{p.has_children ? '›' : `${p.duration_days.toFixed(p.duration_days < 10 ? 2 : 0)} ${t('days', hi)}`}</span>
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}

/* ───────────────────────── Yogas & doshas ───────────────────────── */
export function YogaSection({ yogas, summary, hi }) {
  const [all, setAll] = useState(false)
  const [group, setGroup] = useState('all')
  const groups = useMemo(() => {
    const seen = []
    for (const y of yogas) { const g = y.group || 'classical'; if (!seen.includes(g)) seen.push(g) }
    // keep a stable, meaningful order: classical → nabhasa → other → anything new
    const order = Object.keys(YOGA_GROUPS)
    return seen.sort((a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)))
  }, [yogas])
  const groupLabel = (g) => yogaGroupName(yogas.find((y) => (y.group || 'classical') === g) || { group: g }, hi)
  const inGroup = (y) => group === 'all' || (y.group || 'classical') === group
  const shown = yogas.filter((y) => inGroup(y) && (all || y.present))
  const presentCount = summary?.present?.length ?? yogas.filter((y) => y.present).length
  const total = summary?.total_checked ?? yogas.length
  const badWord = hi ? 'अशुभ' : 'inauspicious'
  return (
    <Card id="yogas" title={`${t('yogas', hi)} (${presentCount}/${total})`}
      sub={summary && (summary.auspicious_present != null || summary.inauspicious_present != null)
        ? `${t('yogasSub', hi)} · ${summary.auspicious_present ?? 0} ${t('auspiciousCount', hi)} · ${summary.inauspicious_present ?? 0} ${t('inauspiciousCount', hi)}`
        : t('yogasSub', hi)}
      right={<button type="button" className="kd-btn-ghost" onClick={() => setAll((v) => !v)}>{all ? t('hideAll', hi) : t('showAll', hi)}</button>}>
      {groups.length > 1 && (
        <div className="kd-seg kd-seg--inline" role="group" aria-label={t('yogaGroup', hi)} style={{ marginBottom: 16 }}>
          <button type="button" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>{t('allGroups', hi)} <small>{yogas.filter((y) => y.present).length}</small></button>
          {groups.map((g) => (
            <button type="button" key={g} aria-pressed={group === g} onClick={() => setGroup(g)}>
              {groupLabel(g)} <small>{yogas.filter((y) => (y.group || 'classical') === g && y.present).length}</small>
            </button>
          ))}
        </div>
      )}
      <div className="kd-yogas">
        {shown.map((y) => {
          const bad = y.category === badWord
          return (
            <div key={y.id} className={`kd-yoga ${y.present ? 'is-present' : 'is-absent'}${bad ? ' is-bad' : ''}`}>
              <div className="kd-yoga__head">
                <span className="kd-yoga__name">{y.name}{group === 'all' && y.group && y.group !== 'classical' && <small className="kd-yoga__group">{yogaGroupName(y, hi)}</small>}</span>
                <span className={`kd-badge ${y.present ? (bad ? 'kd-badge--bad' : 'kd-badge--yes') : 'kd-badge--no'}`}>{y.present ? t('present', hi) : t('absent', hi)}</span>
              </div>
              <div className="kd-yoga__desc">{y.description}</div>
              {y.present && y.detail && <div className="kd-yoga__detail">{y.detail}</div>}
            </div>
          )
        })}
        {shown.length === 0 && <p className="kd-hint">{t('absent', hi)}</p>}
      </div>
    </Card>
  )
}

export function DoshaSection({ doshas, hi }) {
  const m = doshas.mangal, k = doshas.kaal_sarp
  return (
    <Card id="doshas" title={t('doshas', hi)}>
      <div className="kd-yogas">
        <div className={`kd-dosha${m.present ? ' is-present' : ''}`}>
          <div className="kd-dosha__title">{m.name}<span className={`kd-badge ${m.present ? 'kd-badge--bad' : 'kd-badge--yes'}`}>{m.present ? m.level : t('none', hi)}</span></div>
          <div className="kd-yoga__desc">{m.description}</div>
          <div className="kd-kv">
            <div><b>{t('marsIn', hi)} ({t('lagna', hi)} / {hi ? 'चंद्र' : 'Moon'} / {hi ? 'शुक्र' : 'Venus'})</b><span>{m.mars_house_from_lagna} / {m.mars_house_from_moon} / {m.mars_house_from_venus}</span></div>
            {Object.keys(m.from).length > 0 && <div><b>{t('from', hi)}</b><span>{Object.entries(m.from).map(([a, b]) => `${a} (${b})`).join(', ')}</span></div>}
            {m.cancellations.length > 0 && <div><b>{t('cancellations', hi)}</b><span>{m.cancellations.join('; ')}</span></div>}
          </div>
        </div>
        <div className={`kd-dosha${k.present || k.partial ? ' is-present' : ''}`}>
          <div className="kd-dosha__title">{k.name}<span className={`kd-badge ${k.present ? 'kd-badge--bad' : k.partial ? 'kd-badge--warn' : 'kd-badge--yes'}`}>{k.present ? t('present', hi) : k.partial ? t('partial', hi) : t('none', hi)}</span></div>
          <div className="kd-yoga__desc">{k.description}</div>
          <div className="kd-kv">
            <div><b>{t('rahuHouse', hi)}</b><span>{k.rahu_house} ({k.type})</span></div>
            <div><b>{t('direction', hi)}</b><span>{k.direction}</span></div>
            {k.planets_outside_axis.length > 0 && <div><b>{t('outsideAxis', hi)}</b><span>{k.planets_outside_axis.join(', ')}</span></div>}
          </div>
        </div>
        {doshas.others.map((d) => (
          <div key={d.id} className={`kd-dosha${d.present ? ' is-present' : ''}`}>
            <div className="kd-dosha__title">{d.name}<span className={`kd-badge ${d.present ? 'kd-badge--bad' : 'kd-badge--yes'}`}>{d.present ? t('present', hi) : t('none', hi)}</span></div>
            <div className="kd-yoga__desc">{d.description}</div>
            {d.present && d.detail && <div className="kd-yoga__detail">{d.detail}</div>}
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SadeSatiSection({ ss, hi }) {
  const [past, setPast] = useState(false)
  const todayIso = new Date().toISOString().slice(0, 10)
  const rows = ss.periods.filter((p) => past || p.end >= todayIso || p.at_birth)
  return (
    <Card id="sadesati" title={t('sadeSati', hi)} sub={ss.description}
      right={<span className={`kd-badge ${ss.current ? 'kd-badge--warn' : 'kd-badge--yes'}`}>{ss.status}</span>}>
      <div className="kd-kv" style={{ marginBottom: 16 }}>
        <div><b>{t('moonSign', hi)}</b><span>{ss.moon_sign}</span></div>
        <div><b>{t('saturnNow', hi)}</b><span>{ss.saturn_sign_now}</span></div>
        {ss.next_sade_sati && <div><b>{hi ? 'अगली साढ़े साती' : 'Next Sade Sati'}</b><span>{fmtDate(ss.next_sade_sati.start, hi)}</span></div>}
      </div>
      <div className="kd-timeline">
        <div className="kd-tl" style={{ background: 'none', border: 0, color: 'var(--ink-4)', fontSize: 'var(--fs-caption)', fontWeight: 600 }}>
          <span>{t('phase', hi)}</span><span>{t('start', hi)}</span><span>{t('end', hi)}</span><span>{t('saturnIn', hi)}</span>
        </div>
        {rows.map((p, i) => (
          <div key={i} className={`kd-tl${p.is_current ? ' is-current' : ''}${p.type === 'dhaiya' ? ' is-dhaiya' : ''}`}>
            <span>{p.phase}{p.at_birth ? ` · ${hi ? 'जन्म के समय' : 'at birth'}` : ''}</span>
            <span>{fmtDate(p.start, hi)}</span><span>{fmtDate(p.end, hi)}</span><span>{p.saturn_sign}</span>
          </div>
        ))}
      </div>
      <button type="button" className="kd-btn-ghost" style={{ marginTop: 12 }} onClick={() => setPast((v) => !v)}>{past ? '−' : '+'} {t('showPast', hi)}</button>
    </Card>
  )
}

/* ───────────────────────── Divisional charts ───────────────────────── */
export function VargaSection({ charts, table, style, hi }) {
  const keys = Object.keys(charts)
  const [sel, setSel] = useState(keys.slice(0, 4))
  const toggle = (k) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))
  return (
    <Card id="vargas" title={t('vargas', hi)}>
      <div className="kd-crumbs" style={{ marginBottom: 16 }}>
        {keys.map((k) => (
          <button type="button" key={k} onClick={() => toggle(k)} style={sel.includes(k) ? { borderColor: 'var(--saffron)', color: 'var(--saffron-deep)', background: 'var(--saffron-50)' } : undefined}>
            {k} · {charts[k].name}
          </button>
        ))}
      </div>
      <div className="kd-vargagrid">
        {sel.map((k) => (
          <div className="kd-chartbox" key={k}>
            <h4>{k} · {charts[k].name}</h4>
            <p>{charts[k].signifies} · {t('lagna', hi)}: {charts[k].ascendant_sign}</p>
            <KundliChart chart={charts[k]} style={style} hi={hi} title={charts[k].name} />
          </div>
        ))}
      </div>
      <h3 className="kd-card__title" style={{ fontSize: '1.05rem', margin: '24px 0 10px' }}>{t('vargaTable', hi)}</h3>
      <div className="kd-tablewrap">
        <table className="kd-table kd-table--compact">
          <thead><tr><th>{t('planet', hi)}</th>{table.vargas.map((v) => <th key={v.key} title={v.name}>{v.key}</th>)}<th>{t('ownVargas', hi)}</th><th>{t('exaltedVargas', hi)}</th></tr></thead>
          <tbody>
            {table.rows.map((r) => (
              <tr key={r.id}><td>{r.name}</td>{table.vargas.map((v) => <td key={v.key}>{r.signs[v.key].slice(0, 3)}</td>)}<td>{r.own_vargas}</td><td>{r.exalted_vargas}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ───────────────────────── Ashtakavarga ───────────────────────── */
export function AshtakavargaSection({ av, hi }) {
  const planets = Object.keys(av.bhinna)
  return (
    <Card id="ashtakavarga" title={t('ashtakavarga', hi)} sub={av.description}>
      <div className="kd-av">
        <div>
          <div className="kd-fld__label" style={{ marginBottom: 8 }}>{t('sarva', hi)} · {t('total', hi)} {av.sarva.total}</div>
          <div className="kd-av__row">
            {av.house_strength.map((h) => (
              <div key={h.house} className={`kd-av__cell${h.points >= 30 ? ' is-strong' : h.points < 25 ? ' is-weak' : ''}`} title={`${h.sign}: ${h.rating}`}>
                {h.points}<small>{t('house', hi)} {h.house}</small><small>{h.sign.slice(0, 3)}</small>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="kd-fld__label" style={{ marginBottom: 8 }}>{t('bhinna', hi)}</div>
          <div className="kd-tablewrap">
            <table className="kd-table kd-table--compact">
              <thead><tr><th>{t('planet', hi)}</th>{av.signs.map((s) => <th key={s}>{s.slice(0, 3)}</th>)}<th>{t('total', hi)}</th></tr></thead>
              <tbody>
                {planets.map((p) => (
                  <tr key={p}><td>{hi ? ({ Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि' })[p] : p}</td>
                    {av.bhinna[p].by_sign.map((v, i) => <td key={i} className={v >= 5 ? 'c-good' : v <= 2 ? 'c-bad' : ''}>{v}</td>)}<td><b>{av.bhinna[p].total}</b></td></tr>
                ))}
                <tr><td><b>{hi ? 'सर्व' : 'Sarva'}</b></td>{av.sarva.by_sign.map((v, i) => <td key={i}><b>{v}</b></td>)}<td><b>{av.sarva.total}</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ───────────────────────── Aspects, friendship, karakas, KP, gems, yogini ───────────────────────── */
export function AspectsSection({ aspects, hi }) {
  return (
    <Card id="aspects" title={t('aspects', hi)}>
      <div className="kd-tablewrap">
        <table className="kd-table kd-table--compact">
          <thead><tr><th>{t('planet', hi)}</th><th>{t('aspectsHouses', hi)}</th><th>{t('aspectsPlanets', hi)}</th></tr></thead>
          <tbody>{aspects.planets.map((a) => <tr key={a.id}><td>{a.planet}</td><td>{a.houses.join(', ')}</td><td>{a.planets.join(', ') || '-'}</td></tr>)}</tbody>
        </table>
      </div>
    </Card>
  )
}

export function FriendshipSection({ fr, hi }) {
  const [kind, setKind] = useState('compound')
  const names = fr.planet_names || fr.planets
  const tone = (v) => /Great Friend|अधिमित्र/.test(v) || /^(Friend|मित्र)$/.test(v) ? 'c-good' : /Enemy|शत्रु/.test(v) ? 'c-bad' : 'c-mid'
  return (
    <Card id="friendship" title={t('friendship', hi)} right={
      <div className="kd-seg" role="group" style={{ minWidth: 300 }}>
        {['natural', 'temporal', 'compound'].map((k) => <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{t(k, hi)}</button>)}
      </div>}>
      <div className="kd-tablewrap">
        <table className="kd-table kd-table--compact">
          <thead><tr><th></th>{names.map((n) => <th key={n}>{n}</th>)}</tr></thead>
          <tbody>{fr.planets.map((a, i) => <tr key={a}><td>{names[i]}</td>{fr.planets.map((b) => <td key={b} className={tone(fr[kind][a][b])}>{fr[kind][a][b]}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </Card>
  )
}

export function KarakaSection({ karakas, gems, hi }) {
  return (
    <div className="kd-two">
      <Card id="karakas" title={t('karakas', hi)}>
        <div className="kd-kv" style={{ gridTemplateColumns: '1fr' }}>
          {karakas.map((c) => <div key={c.abbr}><b>{c.karaka} ({c.abbr}) · <small>{c.signifies}</small></b><span>{c.planet} {c.degrees_in_sign.toFixed(2)}°</span></div>)}
        </div>
      </Card>
      <Card id="gems" title={t('gems', hi)}>
        <div className="kd-kv" style={{ gridTemplateColumns: '1fr' }}>
          {gems.map((g) => <div key={g.type}><b>{g.type} · <small>{t('house', hi)} {g.house} · {g.planet}</small></b><span>{g.gem}{hi ? '' : ` (${g.gem_hindi})`}</span></div>)}
        </div>
      </Card>
    </div>
  )
}

export function KPSection({ kp, hi }) {
  return (
    <Card id="kp-sublords" title={t('kp', hi)}>
      <div className="kd-two">
        <div className="kd-tablewrap">
          <table className="kd-table kd-table--compact">
            <thead><tr><th>{t('planet', hi)}</th><th>{t('signLord', hi)}</th><th>{t('starLord', hi)}</th><th>{t('subLord', hi)}</th><th>{t('subSubLord', hi)}</th></tr></thead>
            <tbody>{kp.planets.map((r) => <tr key={r.id}><td>{r.planet}</td><td>{r.sign_lord}</td><td>{r.star_lord}</td><td>{r.sub_lord}</td><td>{r.sub_sub_lord}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="kd-tablewrap">
          <table className="kd-table kd-table--compact">
            <thead><tr><th>{t('cusp', hi)}</th><th>{t('sign', hi)}</th><th>{t('starLord', hi)}</th><th>{t('subLord', hi)}</th><th>{t('subSubLord', hi)}</th></tr></thead>
            <tbody>{kp.cusps.map((r) => <tr key={r.house}><td>{r.house}</td><td>{r.sign}</td><td>{r.star_lord}</td><td>{r.sub_lord}</td><td>{r.sub_sub_lord}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

export function YoginiSection({ yd, hi }) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <Card id="yogini" title={t('yogini', hi)} right={<span className="kd-hint">{t('balance', hi)}: <strong>{yd.balance_at_birth.yogini} {yd.balance_at_birth.years.toFixed(2)} {t('years', hi)}</strong></span>}>
      <div className="kd-dasha">
        {yd.dashas.slice(0, 16).map((md) => {
          const cur = md.start <= today && today < md.end
          return (
            <details key={`${md.yogini}-${md.start}`} className={`kd-md${cur ? ' is-current' : ''}`} open={cur}>
              <summary><b>{md.yogini} ({md.lord})</b><span>{fmtDate(md.start, hi)}</span><span>{fmtDate(md.end, hi)}</span><span>{md.years} {t('years', hi)}</span></summary>
              <div className="kd-md__body">
                {md.antardashas.map((ad) => (
                  <div key={`${ad.yogini}-${ad.start}`} className={`kd-md__row${ad.start <= today && today < ad.end ? ' is-current' : ''}`}>
                    <span>{md.yogini} – {ad.yogini}</span><span>{fmtDate(ad.start, hi)}</span><span>{fmtDate(ad.end, hi)}</span>
                  </div>
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </Card>
  )
}
