import React from 'react'
import { Card } from './KundliSections'
import { kpVerdictTone, planetList, planetName, t } from './kundliLabels'

/** KP Kundali — `result.kp_kundali` (Placidus cusps, 4-level significators, ruling planets, promises). */

const dms = (deg) => {
  if (deg == null || Number.isNaN(Number(deg))) return '-'
  const d = Math.floor(deg), mf = (deg - d) * 60, m = Math.floor(mf), s = Math.round((mf - m) * 60)
  return `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`
}
const nums = (arr) => (Array.isArray(arr) && arr.length ? arr.join(', ') : '-')
const LEVELS = ['A', 'B', 'C', 'D']
const sigKey = { A: 'A_star_lord_occupies', B: 'B_occupies', C: 'C_star_lord_owns', D: 'D_owns' }

function Lords({ o, hi }) {
  return <>{planetName(o.sign_lord, hi)} / {planetName(o.star_lord, hi)} / <strong>{planetName(o.sub_lord, hi)}</strong> / {planetName(o.sub_sub_lord, hi)}</>
}

export function KPKundaliSection({ kp, hi }) {
  if (!kp) return null
  const cuspDms = Object.fromEntries((kp.chart || []).map((c) => [c.house, c.cusp_dms]))
  const levels = kp.significator_levels || {}
  const hs = kp.house_significators || {}
  const rp = kp.ruling_planets
  const asc = kp.ascendant
  const meta = [
    kp.system, kp.house_system && `${t('houseSystem', hi)}: ${kp.house_system}`,
    kp.ayanamsa && `${t('ayanamsa', hi)}: ${kp.ayanamsa}${kp.ayanamsa_value != null ? ` (${dms(kp.ayanamsa_value)})` : ''}`,
  ].filter(Boolean).join(' · ')

  return (
    <>
      {Array.isArray(kp.cusps) && kp.cusps.length > 0 && (
        <Card id="kp-cusps" title={t('cusps', hi)} sub={meta || undefined}
          right={asc ? <span className="kd-hint">{t('lagna', hi)}: <strong>{asc.sign} {dms(asc.longitude % 30)}</strong> · <Lords o={asc} hi={hi} /></span> : null}>
          <div className="kd-tablewrap">
            <table className="kd-table kd-table--compact kd-table--kp">
              <thead><tr>
                <th>{t('cusp', hi)}</th><th>{t('sign', hi)}</th><th>{t('degree', hi)}</th><th>{t('nakshatra', hi)}</th>
                <th>{t('signLord', hi)}</th><th>{t('starLord', hi)}</th><th>{t('subLord', hi)}</th><th>{t('subSubLord', hi)}</th>
              </tr></thead>
              <tbody>
                {kp.cusps.map((c) => (
                  <tr key={c.house}>
                    <td>{c.house}</td><td>{c.sign}</td><td className="kd-deg">{cuspDms[c.house] ?? dms(c.degrees_in_sign)}</td><td>{c.nakshatra ?? '-'}</td>
                    <td>{planetName(c.sign_lord, hi)}</td><td>{planetName(c.star_lord, hi)}</td><td><strong>{planetName(c.sub_lord, hi)}</strong></td><td>{planetName(c.sub_sub_lord, hi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {Array.isArray(kp.planets) && kp.planets.length > 0 && (
        <Card id="kp-planets" title={t('kpPlanets', hi)} sub={LEVELS.filter((l) => levels[l]).map((l) => `${l} = ${levels[l]}`).join(' · ') || undefined}>
          <div className="kd-tablewrap">
            <table className="kd-table kd-table--compact kd-table--kp">
              <thead><tr>
                <th>{t('planet', hi)}</th><th>{t('sign', hi)}</th><th>{t('degree', hi)}</th><th>{t('nakshatra', hi)}</th><th>{t('house', hi)}</th><th>{t('owns', hi)}</th>
                <th>{t('signLord', hi)}</th><th>{t('starLord', hi)}</th><th>{t('subLord', hi)}</th><th>{t('subSubLord', hi)}</th>
                {LEVELS.map((l) => <th key={l} title={levels[l]}>{l}</th>)}<th>{t('all', hi)}</th>
              </tr></thead>
              <tbody>
                {kp.planets.map((p) => (
                  <tr key={p.id ?? p.planet}>
                    <td className="kd-name">{planetName(p.planet ?? p.id, hi)}{p.is_retrograde && <span className="kd-flag kd-flag--warn" title={t('retro', hi)}>*</span>}</td>
                    <td>{p.sign}</td><td className="kd-deg">{dms(p.degrees_in_sign)}</td><td>{p.nakshatra ?? '-'}{p.pada ? `-${p.pada}` : ''}</td>
                    <td><strong>{p.house ?? '-'}</strong></td><td>{nums(p.owns)}</td>
                    <td>{planetName(p.sign_lord, hi)}</td><td>{planetName(p.star_lord, hi)}</td><td><strong>{planetName(p.sub_lord, hi)}</strong></td><td>{planetName(p.sub_sub_lord, hi)}</td>
                    {LEVELS.map((l) => <td key={l}>{nums(p.significators?.[sigKey[l]])}</td>)}
                    <td><strong>{nums(p.significators?.all)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {Object.keys(hs).length > 0 && (
        <Card id="kp-house-sig" title={t('houseSignificators', hi)} sub={kp.description || undefined}>
          <div className="kd-kp-grid">
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).filter((h) => hs[h]).map((h) => (
              <div key={h} className="kd-kp-house">
                <div className="kd-kp-house__n"><span className="kd-house__n">{h}</span><small>{planetList(hs[h].all, hi) || '-'}</small></div>
                <div className="kd-kp-house__levels">
                  {LEVELS.map((l) => (
                    <div key={l} title={levels[l]}><b>{l}</b><span>{planetList(hs[h][l], hi) || <i>-</i>}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(rp || kp.fortuna) && (
        <div className="kd-two">
          {rp && (
            <Card id="kp-ruling" title={t('rulingPlanets', hi)}>
              {Array.isArray(rp.planets) && rp.planets.length > 0 && (
                <div className="kd-chips" style={{ marginBottom: 14 }}>
                  {rp.planets.map((p) => <span key={p} className="kd-chip kd-chip--warn" style={{ cursor: 'default' }}>{planetName(p, hi)}</span>)}
                </div>
              )}
              <div className="kd-kv" style={{ gridTemplateColumns: '1fr' }}>
                {['day_lord', 'lagna_sign_lord', 'lagna_star_lord', 'lagna_sub_lord', 'moon_sign_lord', 'moon_star_lord', 'moon_sub_lord'].filter((k) => rp[k]).map((k) => (
                  <div key={k}><b>{rp.labels?.[k] ?? k.replace(/_/g, ' ')}</b><span>{planetName(rp[k], hi)}</span></div>
                ))}
              </div>
            </Card>
          )}
          {kp.fortuna && (
            <Card id="kp-fortuna" title={t('fortuna', hi)}>
              <div className="kd-kv" style={{ gridTemplateColumns: '1fr' }}>
                <div><b>{t('sign', hi)}</b><span>{kp.fortuna.sign} {dms((kp.fortuna.longitude ?? 0) % 30)}</span></div>
                <div><b>{t('house', hi)}</b><span>{kp.fortuna.house ?? '-'}</span></div>
                <div><b>{t('signLord', hi)}</b><span>{planetName(kp.fortuna.sign_lord, hi)}</span></div>
                <div><b>{t('starLord', hi)}</b><span>{planetName(kp.fortuna.star_lord, hi)}</span></div>
                <div><b>{t('subLord', hi)}</b><span>{planetName(kp.fortuna.sub_lord, hi)}</span></div>
                <div><b>{t('subSubLord', hi)}</b><span>{planetName(kp.fortuna.sub_sub_lord, hi)}</span></div>
              </div>
            </Card>
          )}
        </div>
      )}

      {Array.isArray(kp.promises) && kp.promises.length > 0 && (
        <Card id="kp-promises" title={t('promises', hi)}>
          <div className="kd-yogas">
            {kp.promises.map((p, i) => {
              const tone = kpVerdictTone(p.verdict)
              const fav = new Set(p.favourable_hit || []), unf = new Set(p.unfavourable_hit || [])
              return (
                <div key={`${p.area}-${i}`} className={`kd-yoga is-present kd-promise kd-promise--${tone}`}>
                  <div className="kd-yoga__head">
                    <span className="kd-yoga__name">{p.label ?? p.area}</span>
                    <span className={`kd-badge kd-badge--${tone}`}>{p.verdict_label ?? p.verdict}</span>
                  </div>
                  <div className="kd-yoga__desc">
                    {t('cusp', hi)} <strong>{p.cusp}</strong> · {t('cuspSubLord', hi)} <strong>{planetName(p.sub_lord, hi)}</strong>
                  </div>
                  <div className="kd-promise__houses">
                    <b>{t('signifiesHouses', hi)}</b>
                    <div>
                      {(p.sub_lord_signifies || []).map((h) => (
                        <span key={h} className={`kd-promise__h${fav.has(h) ? ' is-fav' : unf.has(h) ? ' is-unf' : ''}`}>{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="kd-promise__legend">
                    <span><i className="is-fav" />{t('favourable', hi)}: {nums(p.favourable_houses)}{fav.size ? ` (✓ ${[...fav].join(', ')})` : ''}</span>
                    <span><i className="is-unf" />{t('unfavourable', hi)}: {nums(p.unfavourable_houses)}{unf.size ? ` (✗ ${[...unf].join(', ')})` : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </>
  )
}

export default KPKundaliSection
