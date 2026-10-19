import React from 'react'
import { planetFlags } from './kundliLabels'

/**
 * Vedic chart drawings as inline SVG, sized to be read at a glance: one chart
 * per row on the report, up to 620px wide. Reads the API's `charts.*` shape;
 * names arrive already localized, ids stay English for logic.
 */

const planetLine = (p, hi) => ({
  abbr: p.abbr,
  deg: p.degrees_in_sign_dms ? p.degrees_in_sign_dms.slice(0, 6) : '',
  flags: planetFlags(p, hi).map((f) => f.sym).join(''),
})

function houseLines(h, hi, compact = false) {
  const lines = []
  if (compact) {
    if (h.ascendant_degree_dms) lines.push({ asc: true, text: hi ? 'ल' : 'As' })
    for (const p of h.planets || []) lines.push({ abbr: p.abbr, deg: '', flags: planetFlags(p, hi).map((f) => f.sym).join('') })
    return lines
  }
  if (h.ascendant_degree_dms) lines.push({ asc: true, text: `${hi ? 'ल' : 'As'} ${h.ascendant_degree_dms.slice(0, 6)}` })
  for (const p of h.planets || []) lines.push(planetLine(p, hi))
  return lines
}

/** Stack lines around (x, y); text shrinks as a house fills, never below 9px. */
function Lines({ x, y, lines, max = 6, compact = false }) {
  const shown = lines.slice(0, max)
  const n = shown.length
  const fs = compact ? (n <= 2 ? 22 : n <= 3 ? 18 : 15) : n <= 2 ? 14 : n <= 3 ? 12.5 : n <= 4 ? 11 : 9.5
  const gap = fs + 2.5
  const start = y - ((n - 1) * gap) / 2 + fs * 0.35
  return shown.map((l, i) => (
    <text key={i} x={x} y={start + i * gap} textAnchor="middle" fontSize={fs}
      className={l.asc ? 'kd-chart__asc' : 'kd-chart__planet'}>
      {l.asc ? l.text : (
        <>
          <tspan fontWeight={700}>{l.abbr}</tspan>
          {l.deg && <tspan dx={3} fontSize={fs - 2} className="kd-chart__deg">{l.deg}</tspan>}
          {l.flags && <tspan dx={2} fontSize={fs - 1} className="kd-chart__flag">{l.flags}</tspan>}
        </>
      )}
    </text>
  ))
}

const SignBadge = ({ x, y, n, label }) => (
  <g className="kd-chart__badge">
    <circle cx={x} cy={y} r={label ? 0 : 10} />
    <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9.5">{label || n}</text>
  </g>
)

/** North Indian: fixed houses, house 1 in the top centre, counter-clockwise. */
export function NorthChart({ chart, hi, title, compact = false }) {
  const S = 400
  const pos = [
    [200, 100], [100, 48], [48, 100], [100, 200], [48, 300], [100, 352],
    [200, 300], [300, 352], [352, 300], [300, 200], [352, 100], [300, 48],
  ]
  const badge = [
    [200, 160], [72, 22], [22, 72], [160, 200], [22, 328], [72, 378],
    [200, 240], [328, 378], [378, 328], [240, 200], [378, 72], [328, 22],
  ]
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="kd-chart" role="img" aria-label={title}>
      <rect x="2" y="2" width={S - 4} height={S - 4} rx="4" className="kd-chart__bg" />
      <line x1="2" y1="2" x2={S - 2} y2={S - 2} className="kd-chart__line" />
      <line x1={S - 2} y1="2" x2="2" y2={S - 2} className="kd-chart__line" />
      <polygon points={`${S / 2},2 ${S - 2},${S / 2} ${S / 2},${S - 2} 2,${S / 2}`} className="kd-chart__line" />
      <polygon points={`${S / 2},2 ${S - 2},${S / 2} ${S / 2},${S - 2} 2,${S / 2}`} className="kd-chart__lagna-fill" clipPath="url(#kd-h1)" />
      <defs><clipPath id="kd-h1"><polygon points={`${S / 2},2 ${S * 0.75},${S * 0.25} ${S / 2},${S / 2} ${S * 0.25},${S * 0.25}`} /></clipPath></defs>
      {chart.houses.map((h, i) => (
        <g key={h.house}>
          <SignBadge x={badge[i][0]} y={badge[i][1]} n={h.sign_index} />
          <Lines x={pos[i][0]} y={pos[i][1]} lines={houseLines(h, hi, compact)} compact={compact} />
        </g>
      ))}
    </svg>
  )
}

/** South Indian: fixed signs, Pisces top-left running clockwise; lagna cell tinted. */
export function SouthChart({ chart, hi, title, compact = false }) {
  const S = 400, c = S / 4
  const cell = { 12: [0, 0], 1: [1, 0], 2: [2, 0], 3: [3, 0], 4: [3, 1], 5: [3, 2], 6: [3, 3], 7: [2, 3], 8: [1, 3], 9: [0, 3], 10: [0, 2], 11: [0, 1] }
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="kd-chart" role="img" aria-label={title}>
      <rect x="2" y="2" width={S - 4} height={S - 4} rx="4" className="kd-chart__bg" />
      {chart.houses.map((h) => {
        const [cx, cy] = cell[h.sign_index]
        const x = cx * c, y = cy * c
        return (
          <g key={h.house}>
            {h.house === 1 && <rect x={x + 2} y={y + 2} width={c - 4} height={c - 4} className="kd-chart__lagna-fill" />}
            <rect x={x} y={y} width={c} height={c} className="kd-chart__line" />
            {h.house === 1 && <line x1={x + 2} y1={y + 22} x2={x + 22} y2={y + 2} className="kd-chart__line" strokeWidth="2.5" />}
            <text x={x + c - 6} y={y + 14} textAnchor="end" fontSize="10" className="kd-chart__sign">{h.sign}</text>
            <Lines x={x + c / 2} y={y + c / 2 + 6} lines={houseLines(h, hi, compact)} max={5} compact={compact} />
          </g>
        )
      })}
      <text x={S / 2} y={S / 2 - 8} textAnchor="middle" fontSize="15" className="kd-chart__center">{title}</text>
      <text x={S / 2} y={S / 2 + 14} textAnchor="middle" fontSize="12" className="kd-chart__sign">
        {hi ? 'लग्न' : 'Lagna'}: {chart.ascendant_sign}
      </text>
    </svg>
  )
}

export default function KundliChart({ chart, style = 'north', hi = false, title = '', compact = false }) {
  if (!chart) return null
  return style === 'south'
    ? <SouthChart chart={chart} hi={hi} title={title} compact={compact} />
    : <NorthChart chart={chart} hi={hi} title={title} compact={compact} />
}
