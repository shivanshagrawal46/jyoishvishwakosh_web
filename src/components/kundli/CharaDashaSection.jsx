import React from 'react'
import { Card, fmtDate } from './KundliSections'
import { planetList, planetName, signName, t } from './kundliLabels'

/** Jaimini Chara dasha — `result.chara_dasha`, same visual pattern as the Vimshottari list. */
export function CharaDashaSection({ cd, hi }) {
  if (!cd || !Array.isArray(cd.mahadashas) || cd.mahadashas.length === 0) return null
  const today = new Date().toISOString().slice(0, 10)
  const cur = cd.current
  const hints = [cd.system, cd.variant, cd.direction].filter(Boolean)
  return (
    <Card id="chara-dasha" title={t('charaDasha', hi)}
      sub={cd.first_cycle_total != null ? `${t('firstCycle', hi)}: ${cd.first_cycle_total} ${t('years', hi)}${cd.lagna ? ` · ${t('lagna', hi)}: ${signName(cd.lagna, hi)}` : ''}` : undefined}
      right={hints.length > 0 ? <span className="kd-hint">{hints.join(' · ')}</span> : null}>
      {cur && (cur.mahadasha || cur.antardasha) && (
        <div className="kd-stats" style={{ marginTop: 0, marginBottom: 20 }}>
          {cur.mahadasha && <div className="kd-stat kd-stat--accent"><b>{t('current', hi)} · {t('mahadasha', hi)}</b><span>{signName(cur.mahadasha, hi)}</span><small>{fmtDate(cur.mahadasha_start, hi)} – {fmtDate(cur.mahadasha_end, hi)}</small></div>}
          {cur.antardasha && <div className="kd-stat"><b>{t('antardasha', hi)}</b><span>{signName(cur.antardasha, hi)}</span><small>{fmtDate(cur.antardasha_start, hi)} – {fmtDate(cur.antardasha_end, hi)}</small></div>}
        </div>
      )}
      <div className="kd-dasha">
        {cd.mahadashas.map((md, i) => {
          const isCur = md.is_current ?? (md.start <= today && today < md.end)
          return (
            <details key={`${md.sign}-${md.start}-${i}`} className={`kd-md${isCur ? ' is-current' : ''}`} open={!!isCur}>
              <summary>
                <b>{signName(md.sign, hi)} <small style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--ink-3)' }}>({planetName(md.lord, hi)}{md.cycle > 1 ? ` · ${t('cycle', hi)} ${md.cycle}` : ''})</small></b>
                <span>{fmtDate(md.start, hi)}</span><span>{fmtDate(md.end, hi)}</span><span>{md.years} {t('years', hi)}</span>
              </summary>
              <div className="kd-md__body">
                {(md.basis || md.planets_in_sign?.length > 0) && (
                  <p className="kd-hint" style={{ margin: '6px 0 8px' }}>
                    {md.basis && <>{t('basis', hi)}: {md.basis}</>}
                    {md.basis && md.planets_in_sign?.length > 0 && ' · '}
                    {md.planets_in_sign?.length > 0 && <>{t('planetsInSign', hi)}: {planetList(md.planets_in_sign, hi)}</>}
                  </p>
                )}
                <div className="kd-md__row is-head"><span>{t('antardasha', hi)}</span><span>{t('start', hi)}</span><span>{t('end', hi)}</span></div>
                {(md.antardashas || []).map((ad, j) => (
                  <div key={`${ad.sign}-${ad.start}-${j}`} className={`kd-md__row${(ad.is_current ?? (ad.start <= today && today < ad.end)) ? ' is-current' : ''}`}>
                    <span>{signName(md.sign, hi)} – {signName(ad.sign, hi)} <small style={{ color: 'var(--ink-4)' }}>({planetName(ad.lord, hi)})</small></span>
                    <span>{fmtDate(ad.start, hi)}</span><span>{fmtDate(ad.end, hi)}</span>
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

export default CharaDashaSection
