import React from 'react'
import { Card, fmtDate } from './KundliSections'
import { falBandTone, falStep, planetList, planetName, signName, t } from './kundliLabels'

/**
 * Faladesh (predictions) — `result.faladesh`. Two areas (marriage, career),
 * each a step-by-step chain the API already narrated; we only lay it out.
 * All display strings arrive localized; ids (step, planet, band) stay English.
 */

const effectTone = (e) => (e === 'positive' ? 'good' : e === 'negative' ? 'bad' : 'mid')
const fmtWeight = (w) => {
  const n = Number(w) || 0
  if (n === 0) return '0'
  const s = Math.abs(n) % 1 === 0 ? Math.abs(n).toFixed(0) : Math.abs(n).toFixed(2).replace(/0$/, '')
  return `${n > 0 ? '+' : '−'}${s}`
}
const fmtScore = (s) => (s == null ? '-' : `${s > 0 ? '+' : s < 0 ? '−' : ''}${Math.abs(Number(s)).toFixed(2)}`)
const strengthTone = (s = '') => (/strong/i.test(s) ? 'yes' : /moderate/i.test(s) ? 'warn' : 'no')

function ListCard({ title, items, tone, icon }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <div className={`kd-fal-list kd-fal-list--${tone}`}>
      <div className="kd-fal-list__title"><i aria-hidden="true">{icon}</i>{title}<small>{items.length}</small></div>
      <ul>{items.map((s, i) => <li key={i}>{s}</li>)}</ul>
    </div>
  )
}

function Periods({ periods, hi }) {
  if (!Array.isArray(periods) || periods.length === 0) return null
  const rows = [...periods].sort((a, b) => (a.start || '').localeCompare(b.start || ''))
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="kd-fal-list kd-fal-list--gold">
      <div className="kd-fal-list__title"><i aria-hidden="true">◷</i>{t('favourablePeriods', hi)}<small>{rows.length}</small></div>
      <div className="kd-fal-periods">
        {rows.map((p, i) => {
          const cur = p.start <= today && today < p.end
          const past = p.end < today
          return (
            <div key={i} className={`kd-fal-period${cur ? ' is-current' : ''}${past ? ' is-past' : ''}`}>
              <b>{p.mahadasha_label ?? planetName(p.mahadasha, hi)} – {p.antardasha_label ?? planetName(p.antardasha, hi)}</b>
              <span>{fmtDate(p.start, hi)} – {fmtDate(p.end, hi)}</span>
              <span>{p.age != null ? `${t('age', hi)} ${Math.round(p.age)}` : ''}</span>
              <em className={`kd-badge kd-badge--${strengthTone(p.strength)}`}>{p.strength_label ?? p.strength}</em>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Chain({ factors, hi }) {
  if (!Array.isArray(factors) || factors.length === 0) return null
  return (
    <ol className="kd-steps">
      {factors.map((f, i) => {
        const tone = effectTone(f.effect)
        return (
          <li key={`${f.step}-${i}`} className={`kd-step kd-step--${tone}`}>
            <span className="kd-step__dot" aria-hidden="true">{tone === 'good' ? '+' : tone === 'bad' ? '−' : '•'}</span>
            <div className="kd-step__card">
              <div className="kd-step__head">
                <div>
                  <div className="kd-step__title">{i + 1}. {falStep(f.step, hi)}</div>
                  {f.detail && <div className="kd-step__detail">{f.detail}</div>}
                </div>
                <span className={`kd-step__w kd-flag kd-flag--${tone}`} title={`${t('weight', hi)} · ${t(f.effect || 'neutral', hi)}`}>{fmtWeight(f.weight)}</span>
              </div>
              {f.text && <p className="kd-step__text">{f.text}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Area({ id, area, kind, hi }) {
  if (!area) return null
  const band = area.band_label ?? area.band
  const tone = falBandTone(area.band)
  const dv = area.divisional
  const facts = [
    [t('house', hi), `${area.house ?? '-'} · ${area.house_sign_label ?? signName(area.house_sign, hi)}`],
    [t('houseLord', hi), `${area.house_lord_label ?? planetName(area.house_lord, hi)} · ${t('house', hi)} ${area.house_lord_house ?? '-'} (${area.house_lord_sign_label ?? signName(area.house_lord_sign, hi)})${area.house_lord_dignity_label || area.house_lord_dignity ? ` · ${area.house_lord_dignity_label ?? area.house_lord_dignity}` : ''}`],
    [t('planetsInHouse', hi), planetList(area.planets_in_house, hi) || t('empty', hi)],
    [`${t('house', hi)} · ${t('aspectedBy', hi)}`, planetList(area.house_aspected_by, hi) || t('none', hi)],
    ...(area.house_lord_conjunct?.length ? [[`${t('houseLord', hi)} · ${t('conjunct', hi)}`, planetList(area.house_lord_conjunct, hi)]] : []),
    ...(area.house_lord_aspected_by?.length ? [[`${t('houseLord', hi)} · ${t('aspectedBy', hi)}`, planetList(area.house_lord_aspected_by, hi)]] : []),
    [t('karaka', hi), planetList(area.karakas, hi) || '-'],
    ...(dv ? [[`${t('divisional', hi)} ${dv.varga_label ?? dv.varga ?? ''}`, `${dv.lord_label ?? planetName(dv.lord, hi)} · ${dv.sign_label ?? signName(dv.sign, hi)} · ${t('house', hi)} ${dv.house ?? '-'}${dv.dignity_label || dv.dignity ? ` · ${dv.dignity_label ?? dv.dignity}` : ''}`]] : []),
  ]
  return (
    <Card id={id} title={area.label || t(kind, hi)} className="kd-fal"
      right={<span className={`kd-badge kd-badge--${tone}`}>{band}</span>}>
      <div className={`kd-fal-hero kd-fal-hero--${tone}`}>
        <div className="kd-fal-hero__band">
          <b>{t('verdict', hi)}</b>
          <span>{band}</span>
          <small>{t('score', hi)} {fmtScore(area.score)}</small>
        </div>
        <div className="kd-fal-hero__result">
          <b>{t('endResult', hi)}</b>
          <p>{area.end_result}</p>
        </div>
      </div>

      <div className="kd-kv kd-fal-facts">
        {facts.map(([k, v]) => <div key={k}><b>{k}</b><span>{v}</span></div>)}
      </div>

      <div className="kd-eyebrow" style={{ marginTop: 20 }}>{t('chain', hi)} · {area.factors?.length ?? 0}</div>
      <Chain factors={area.factors} hi={hi} />

      <div className="kd-fal-grid">
        <ListCard title={t('strengths', hi)} items={area.strengths} tone="good" icon="✦" />
        <ListCard title={t('cautions', hi)} items={area.cautions} tone="bad" icon="!" />
        <ListCard title={t('remedies', hi)} items={area.remedies} tone="warn" icon="ॐ" />
        <Periods periods={area.favourable_periods} hi={hi} />
        {kind === 'career' && Array.isArray(area.suggested_fields) && area.suggested_fields.length > 0 && (
          <div className="kd-fal-list kd-fal-list--mid">
            <div className="kd-fal-list__title"><i aria-hidden="true">⚒</i>{t('suggestedFields', hi)}</div>
            <div className="kd-chips">
              {area.suggested_fields.map((f, i) => (
                <span key={`${f.field}-${i}`} className="kd-chip kd-chip--good" style={{ cursor: 'default' }}>{f.label ?? f.field}{f.weight != null && <small>· {f.weight}</small>}</span>
              ))}
            </div>
            {(area.strongest_influence_label || area.strongest_influence) && (
              <p className="kd-hint" style={{ marginTop: 10 }}>{t('strongestInfluence', hi)}: <strong>{area.strongest_influence_label ?? planetName(area.strongest_influence, hi)}</strong></p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export function FaladeshSection({ fal, hi }) {
  if (!fal || (!fal.marriage && !fal.career)) return null
  const bands = fal.band_labels || fal.bands
  return (
    <>
      <div className="kd-toolbar">
        <div>
          <h2 className="kd-card__title">{t('faladesh', hi)}</h2>
          <p className="kd-hint" style={{ marginTop: 2 }}>{t('faladeshSub', hi)}</p>
        </div>
        <div className="kd-chips">
          {fal.marriage && <a className="kd-chip" href="#faladesh-marriage" onClick={(e) => { e.preventDefault(); document.getElementById('faladesh-marriage')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>💍 {t('marriage', hi)}</a>}
          {fal.career && <a className="kd-chip" href="#faladesh-career" onClick={(e) => { e.preventDefault(); document.getElementById('faladesh-career')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>💼 {t('career', hi)}</a>}
        </div>
      </div>
      <Area id="faladesh-marriage" area={fal.marriage} kind="marriage" hi={hi} />
      <Area id="faladesh-career" area={fal.career} kind="career" hi={hi} />
      {(fal.method || bands) && (
        <details className="kd-adv kd-fal-method">
          <summary>{t('howComputed', hi)}</summary>
          <div style={{ paddingTop: 12, display: 'grid', gap: 10 }}>
            {fal.method && <p className="kd-yoga__desc"><b>{t('method', hi)}:</b> {fal.method}</p>}
            {Array.isArray(bands) && bands.length > 0 && (
              <div className="kd-chips" aria-label={t('bands', hi)}>
                <span className="kd-hint" style={{ alignSelf: 'center' }}>{t('bands', hi)}:</span>
                {bands.map((b, i) => <span key={i} className={`kd-badge kd-badge--${falBandTone(fal.bands?.[i] ?? b)}`}>{b}</span>)}
              </div>
            )}
          </div>
        </details>
      )}
    </>
  )
}

/** Compact overview card: band + end result for each area, button opens the tab. */
export function FaladeshPreview({ fal, hi, onOpen }) {
  if (!fal || (!fal.marriage && !fal.career)) return null
  const areas = [['marriage', fal.marriage, '💍'], ['career', fal.career, '💼']].filter(([, a]) => a)
  return (
    <Card title={t('faladeshPreview', hi)} right={<button type="button" className="kd-link" onClick={onOpen}>{t('openFaladesh', hi)} →</button>}>
      <div className="kd-fal-preview">
        {areas.map(([k, a, icon]) => (
          <button type="button" key={k} className={`kd-fal-preview__item kd-fal-preview__item--${falBandTone(a.band)}`} onClick={onOpen}>
            <div className="kd-fal-preview__head">
              <span className="kd-fal-preview__name"><i aria-hidden="true">{icon}</i>{t(k, hi)}</span>
              <span className={`kd-badge kd-badge--${falBandTone(a.band)}`}>{a.band_label ?? a.band}</span>
            </div>
            <p>{a.end_result}</p>
          </button>
        ))}
      </div>
    </Card>
  )
}

export default FaladeshSection
