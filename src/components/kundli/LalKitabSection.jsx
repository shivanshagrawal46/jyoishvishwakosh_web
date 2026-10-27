import React, { useState } from 'react'
import { Card } from './KundliSections'
import { planetName, t } from './kundliLabels'

/**
 * Lal Kitab — `result.lal_kitab`. The API's chart[] is a 12-house list with
 * plain planet ids (no abbreviations / sign_index), so it gets its own
 * 12-cell grid instead of the SVG KundliChart.
 */

const houseList = (arr) => (Array.isArray(arr) && arr.length ? arr.join(', ') : '-')
const relationTone = (r = '') => (/own|friend/i.test(r) ? 'good' : /enemy/i.test(r) ? 'bad' : 'mid')
const statusTone = (s = '') => (/exalt|uchch/i.test(s) ? 'good' : /debil|neech|sleep|sleeping/i.test(s) ? 'bad' : 'mid')

function LKChart({ chart, hi }) {
  if (!Array.isArray(chart) || chart.length === 0) return null
  return (
    <div className="kd-lk-grid">
      {chart.map((h) => (
        <div key={h.house} className={`kd-lk-cell${h.house === 1 ? ' is-lagna' : ''}${h.planets?.length ? '' : ' is-empty'}`}>
          <div className="kd-lk-cell__head">
            <span className="kd-house__n">{h.house}</span>
            <div>
              <div className="kd-lk-cell__sign">{h.sign}</div>
              {h.lal_kitab_lord && <div className="kd-hint">{t('lkLord', hi)}: {planetName(h.lal_kitab_lord, hi)}</div>}
            </div>
          </div>
          <div className="kd-lk-cell__planets">
            {(h.planets || []).length === 0 && <i>{t('empty', hi)}</i>}
            {(h.planets || []).map((p) => <strong key={p}>{planetName(p, hi)}</strong>)}
          </div>
          {h.meaning && <div className="kd-lk-cell__meaning">{h.meaning}</div>}
        </div>
      ))}
    </div>
  )
}

function PlanetCard({ p, hi }) {
  const status = p.lal_kitab_status_label ?? p.lal_kitab_status
  const rel = p.house_relation_label ?? p.house_relation
  const conj = Array.isArray(p.conjunct) && p.conjunct.length
    ? p.conjunct.map((c) => `${planetName(c, hi)}${p.conjunct_relation_label?.[c] || p.conjunct_relation?.[c] ? ` (${p.conjunct_relation_label?.[c] ?? p.conjunct_relation?.[c]})` : ''}`).join(', ')
    : null
  return (
    <div className={`kd-lk-planet${p.needs_remedy ? ' is-remedy' : ''}`}>
      <div className="kd-lk-planet__head">
        <div>
          <div className="kd-lk-planet__name">{planetName(p.planet ?? p.id, hi)}{p.is_retrograde && <span className="kd-flag kd-flag--warn">*</span>}</div>
          <div className="kd-hint">{t('house', hi)} {p.house ?? '-'} · {p.sign ?? '-'}</div>
        </div>
        <div className="kd-chips" style={{ justifyContent: 'flex-end' }}>
          {status && <span className={`kd-badge kd-badge--${statusTone(p.lal_kitab_status)}`}>{status}</span>}
          {p.in_pakka_ghar && <span className="kd-badge kd-badge--gold">{t('inPakkaGhar', hi)}</span>}
          {p.needs_remedy && <span className="kd-badge kd-badge--warn">{t('needsRemedy', hi)}</span>}
        </div>
      </div>
      <div className="kd-kv kd-lk-planet__kv">
        <div><b>{t('pakkaGhar', hi)}</b><span>{houseList(p.pakka_ghar)}</span></div>
        <div><b>{t('houseRelation', hi)}</b><span className={`c-${relationTone(p.house_relation)}`}>{rel ?? '-'}{p.house_lord ? ` · ${planetName(p.house_lord, hi)}` : ''}</span></div>
        <div><b>{t('exaltedHouse', hi)} / {t('debilitatedHouse', hi)}</b><span>{p.exalted_house ?? '-'} / {p.debilitated_house ?? '-'}</span></div>
        {conj && <div><b>{t('conjunct', hi)}</b><span>{conj}</span></div>}
      </div>
      {p.reading && <p className="kd-lk-planet__reading">{p.reading}</p>}
      {Array.isArray(p.remedies) && p.remedies.length > 0 && (
        <details className="kd-adv" style={{ borderTop: '1px dashed var(--rule)', paddingTop: 8, marginTop: 4 }} open={!!p.needs_remedy}>
          <summary>{t('remedies', hi)} ({p.remedies.length})</summary>
          <ul className="kd-lk-remedies">{p.remedies.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </details>
      )}
    </div>
  )
}

export function LalKitabSection({ lk, hi }) {
  const [allRin, setAllRin] = useState(false)
  if (!lk) return null
  const rin = Array.isArray(lk.rin) ? lk.rin : []
  const presentRin = rin.filter((r) => r.present)
  const shownRin = allRin ? rin : presentRin
  const sub = [lk.system, lk.house_basis].filter(Boolean).join(' · ')
  return (
    <>
      <Card id="lalkitab-chart" title={t('lkChart', hi)} sub={sub || undefined}
        right={Array.isArray(lk.empty_houses) && lk.empty_houses.length > 0 ? <span className="kd-hint">{t('emptyHouses', hi)}: <strong>{lk.empty_houses.join(', ')}</strong></span> : null}>
        <LKChart chart={lk.chart} hi={hi} />
        {lk.description && <p className="kd-hint" style={{ marginTop: 14 }}>{lk.description}</p>}
      </Card>

      {Array.isArray(lk.planets) && lk.planets.length > 0 && (
        <Card id="lalkitab-planets" title={t('lkPlanets', hi)}>
          <div className="kd-lk-planets">
            {lk.planets.map((p) => <PlanetCard key={p.id ?? p.planet} p={p} hi={hi} />)}
          </div>
        </Card>
      )}

      {rin.length > 0 && (
        <Card id="lalkitab-rin" title={`${t('rin', hi)} (${presentRin.length}/${rin.length})`}
          right={<button type="button" className="kd-btn-ghost" onClick={() => setAllRin((v) => !v)}>{allRin ? t('presentRinOnly', hi) : t('showAllRin', hi)}</button>}>
          <div className="kd-yogas">
            {shownRin.map((r) => (
              <div key={r.id} className={`kd-dosha${r.present ? ' is-present' : ''}`} style={r.present ? undefined : { opacity: .7 }}>
                <div className="kd-dosha__title">{r.name}<span className={`kd-badge ${r.present ? 'kd-badge--bad' : 'kd-badge--yes'}`}>{r.present ? t('present', hi) : t('none', hi)}</span></div>
                {r.condition && <div className="kd-yoga__desc"><b style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{t('condition', hi)}:</b> {r.condition}</div>}
                {r.present && Array.isArray(r.remedies) && r.remedies.length > 0 && (
                  <div>
                    <div className="kd-eyebrow" style={{ marginTop: 6 }}>{t('remedies', hi)}</div>
                    <ul className="kd-lk-remedies">{r.remedies.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  </div>
                )}
              </div>
            ))}
            {shownRin.length === 0 && <p className="kd-hint">{t('none', hi)}</p>}
          </div>
        </Card>
      )}

      {Array.isArray(lk.key_remedies) && lk.key_remedies.length > 0 && (
        <Card id="lalkitab-remedies" title={t('keyRemedies', hi)}>
          <div className="kd-yogas">
            {lk.key_remedies.map((k, i) => (
              <div key={`${k.planet}-${i}`} className="kd-yoga is-present">
                <div className="kd-yoga__head"><span className="kd-yoga__name">{planetName(k.planet, hi)}</span>{k.reason && <span className="kd-hint">{k.reason}</span>}</div>
                <ul className="kd-lk-remedies">{(k.remedies || []).map((x, j) => <li key={j}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
          {Array.isArray(lk.rin_present) && lk.rin_present.length > 0 && (
            <p className="kd-hint" style={{ marginTop: 14 }}>{t('rin', hi)}: {lk.rin_present.join(', ')}</p>
          )}
        </Card>
      )}
    </>
  )
}

export default LalKitabSection
