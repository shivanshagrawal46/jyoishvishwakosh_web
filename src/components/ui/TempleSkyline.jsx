import React from 'react'

/**
 * Nagara temple horizon, drawn in the panchayatana arrangement: one tall
 * central shikhara with subsidiary shrines stepping down either side.
 *
 * Rendered as a flat silhouette on purpose. At the low opacity this sits at it
 * reads as a horizon the page is built on rather than as an illustration, which
 * is what keeps it from tipping into clip-art.
 */

const BASE = 220
const PLINTH = 11

/**
 * [centre as a fraction of the width, base width, height]
 * Towers run roughly 2.5x taller than they are wide — squatter than that and
 * the curved profile reads as a dome instead of a spire.
 */
const RIDGE = [
  [0.028, 34, 74], [0.082, 25, 52], [0.145, 46, 112], [0.208, 29, 62],
  [0.272, 38, 88], [0.335, 27, 56], [0.408, 32, 70],
  [0.5, 62, 172],
  [0.592, 32, 70], [0.665, 27, 56], [0.728, 38, 88], [0.792, 29, 62],
  [0.855, 46, 112], [0.918, 25, 52], [0.972, 34, 74],
]

/**
 * The curvilinear tower profile: a short vertical wall at the base, then a
 * concave sweep drawn tight into a point.
 */
const shikhara = (cx, w, h) => {
  const half = w / 2
  const apex = BASE - h
  return [
    `M${cx - half} ${BASE}`,
    `L${cx - half} ${BASE - h * 0.10}`,
    `C${cx - half} ${BASE - h * 0.54} ${cx - half * 0.20} ${apex + h * 0.11} ${cx} ${apex}`,
    `C${cx + half * 0.20} ${apex + h * 0.11} ${cx + half} ${BASE - h * 0.54} ${cx + half} ${BASE - h * 0.10}`,
    `L${cx + half} ${BASE}`,
    'Z',
  ].join(' ')
}

const TempleSkyline = ({ width = 1440, ...p }) => (
  <svg
    viewBox={`0 0 ${width} ${BASE}`}
    preserveAspectRatio="xMidYMax slice"
    fill="currentColor"
    aria-hidden="true"
    {...p}
  >
    {/* The shared platform the complex stands on — without it the towers float. */}
    <rect x="0" y={BASE - PLINTH} width={width} height={PLINTH} />

    {RIDGE.map(([fraction, w, h], i) => {
      const cx = fraction * width
      const apex = BASE - h
      return (
        <g key={i}>
          <path d={shikhara(cx, w, h)} />
          {/* amalaka disc, then the kalasha finial above it */}
          <ellipse cx={cx} cy={apex - 3} rx={w * 0.15} ry="2.2" />
          <path d={`M${cx - 2.2} ${apex - 5.5} h4.4 l-1.1 -5.5 h-2.2 Z`} />
        </g>
      )
    })}
  </svg>
)

export default TempleSkyline
