import React from 'react'
import { Card } from './KundliSections'
import { planetList, planetName, t } from './kundliLabels'

/** Planetary avasthas (BPHS) — `result.avasthas.planets[]`, shown after the planet table. */

const pctTone = (v) => (v >= 60 ? 'good' : v < 35 ? 'bad' : 'mid')

const Two = ({ label, effect }) => (
  <div className="kd-av2">
    <b>{label ?? '-'}</b>
    {effect && <small>{effect}</small>}
  </div>
)

export function AvasthaSection({ av, hi }) {
  const rows = av?.planets
  if (!Array.isArray(rows) || rows.length === 0) return null
  return (
    <Card id="avasthas" title={t('avasthas', hi)} sub={av.description || undefined}>
      <div className="kd-tablewrap">
        <table className="kd-table kd-table--avastha">
          <thead><tr>
            <th>{t('planet', hi)}</th><th>{t('dignity', hi)}</th><th>{t('baladi', hi)}</th><th>{t('jagradadi', hi)}</th>
            <th>{t('deeptadi', hi)}</th><th>{t('lajjitadi', hi)}</th><th>{t('sayanadi', hi)}</th><th>{t('strength', hi)}</th>
          </tr></thead>
          <tbody>
            {rows.map((p) => {
              const pct = Math.max(0, Math.min(100, Number(p.strength_percent) || 0))
              const laj = p.lajjitadi_labels ?? p.lajjitadi ?? []
              return (
                <tr key={p.id ?? p.planet}>
                  <td className="kd-name">
                    {planetName(p.planet ?? p.id, hi)}
                    <small className="kd-av2__meta">{p.sign ?? ''}{p.house != null ? ` · ${t('house', hi)} ${p.house}` : ''}</small>
                    {(p.conjunct?.length || p.aspected_by?.length) ? (
                      <small className="kd-av2__meta">
                        {p.conjunct?.length ? `${t('conjunct', hi)}: ${planetList(p.conjunct, hi)}` : ''}
                        {p.conjunct?.length && p.aspected_by?.length ? ' · ' : ''}
                        {p.aspected_by?.length ? `${t('aspectedBy', hi)}: ${planetList(p.aspected_by, hi)}` : ''}
                      </small>
                    ) : null}
                  </td>
                  <td>{p.dignity_label ?? p.dignity ?? '-'}</td>
                  <td>{p.baladi_label ?? p.baladi ?? '-'}</td>
                  <td><Two label={p.jagradadi_label ?? p.jagradadi} effect={p.jagradadi_effect} /></td>
                  <td><Two label={p.deeptadi_label ?? p.deeptadi} effect={p.deeptadi_effect} /></td>
                  <td>
                    <div className="kd-chips" style={{ gap: 4 }}>
                      {laj.length === 0 && '-'}
                      {laj.map((l, i) => <span key={`${l}-${i}`} className="kd-flag kd-flag--mid" style={{ marginLeft: 0 }} title={p.lajjitadi_effects?.[i] || ''}>{l}</span>)}
                    </div>
                    {Array.isArray(p.lajjitadi_effects) && p.lajjitadi_effects.length > 0 && (
                      <small className="kd-av2__meta">{p.lajjitadi_effects.join(' · ')}</small>
                    )}
                  </td>
                  <td><Two label={p.sayanadi_label ?? p.sayanadi} effect={p.sayanadi_effect} /></td>
                  <td>
                    <div className={`kd-meter kd-meter--${pctTone(pct)}`} role="img" aria-label={`${pct}%`}>
                      <span style={{ width: `${pct}%` }} /><b>{pct}%</b>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default AvasthaSection
