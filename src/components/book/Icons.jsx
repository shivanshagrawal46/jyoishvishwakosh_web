import React from 'react'

// Compact stroke-icon set for the book section. Every icon inherits colour from
// `currentColor` and takes its size from the `s` prop so callers stay terse.
const Svg = ({ s = 18, children, fill = 'none', ...rest }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
)

export const IconChevronDown = (p) => <Svg {...p}><polyline points="6 9 12 15 18 9" /></Svg>
export const IconChevronRight = (p) => <Svg {...p}><polyline points="9 18 15 12 9 6" /></Svg>
export const IconChevronLeft = (p) => <Svg {...p}><polyline points="15 18 9 12 15 6" /></Svg>
export const IconArrowRight = (p) => <Svg {...p}><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></Svg>
export const IconArrowLeft = (p) => <Svg {...p}><line x1="20" y1="12" x2="5" y2="12" /><polyline points="11 18 5 12 11 6" /></Svg>
export const IconArrowUp = (p) => <Svg {...p}><line x1="12" y1="20" x2="12" y2="5" /><polyline points="6 11 12 5 18 11" /></Svg>

export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="7.5" /><line x1="16.8" y1="16.8" x2="21" y2="21" /></Svg>
export const IconX = (p) => <Svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>
export const IconCheck = (p) => <Svg {...p}><polyline points="4 12.5 9 17.5 20 6.5" /></Svg>

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Svg>
)

export const IconRows = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="6" rx="1.6" />
    <rect x="3" y="13.5" width="18" height="6" rx="1.6" />
  </Svg>
)

export const IconToc = (p) => (
  <Svg {...p}>
    <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4.6" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.6" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.6" cy="18" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconBook = (p) => (
  <Svg {...p}>
    <path d="M4 19.2V5.4A2.4 2.4 0 0 1 6.4 3H19a1 1 0 0 1 1 1v13.5" />
    <path d="M6.4 21H20v-3.5H6.4A2.4 2.4 0 0 0 4 19.9 1.1 1.1 0 0 0 5.1 21Z" />
  </Svg>
)

export const IconBookOpen = (p) => (
  <Svg {...p}>
    <path d="M12 6.5S10 4.4 5.6 4.4A1.6 1.6 0 0 0 4 6v11.4a1.4 1.4 0 0 0 1.5 1.4C9.6 18.6 12 20.6 12 20.6" />
    <path d="M12 6.5s2-2.1 6.4-2.1A1.6 1.6 0 0 1 20 6v11.4a1.4 1.4 0 0 1-1.5 1.4C14.4 18.6 12 20.6 12 20.6" />
    <line x1="12" y1="6.5" x2="12" y2="20.6" />
  </Svg>
)

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="M12 3 3 7.6l9 4.6 9-4.6L12 3Z" />
    <path d="M3 12.4 12 17l9-4.6" />
    <path d="M3 16.8 12 21.4l9-4.6" />
  </Svg>
)

export const IconPages = (p) => (
  <Svg {...p}>
    <path d="M7.5 3.5h7.8L19 7.2v13.3H7.5Z" />
    <path d="M15 3.5v4h4" />
    <path d="M5 6.5v14h1.5" />
  </Svg>
)

export const IconTextSize = (p) => (
  <Svg {...p}>
    <path d="M3 18 7.8 6h1.4L14 18" /><line x1="5.1" y1="14" x2="11.9" y2="14" />
    <path d="M15.4 18 18.6 10h1l3.2 8" /><line x1="16.9" y1="15.4" x2="21.3" y2="15.4" />
  </Svg>
)

export const IconPalette = (p) => (
  <Svg {...p}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2.4-2 3.4-3.7 3.4h-1.8a2 2 0 0 0-1.4 3.4A1.7 1.7 0 0 1 12 21Z" />
    <circle cx="8.2" cy="10.4" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.8" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconBookmark = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6.5 3.8h11a1 1 0 0 1 1 1v15.4l-6.5-4-6.5 4V4.8a1 1 0 0 1 1-1Z" />
  </Svg>
)

export const IconShare = (p) => (
  <Svg {...p}>
    <path d="M12 3.5v11" /><polyline points="8 7.4 12 3.5 16 7.4" />
    <path d="M5.5 12.6V19a1.6 1.6 0 0 0 1.6 1.6h9.8A1.6 1.6 0 0 0 18.5 19v-6.4" />
  </Svg>
)

export const IconUser = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20.5a7.2 7.2 0 0 1 14.4 0" /></Svg>
)

export const IconPress = (p) => (
  <Svg {...p}>
    <path d="M3.5 20.5h17" /><path d="M5.5 20.5V6.2l7-2.7v17" /><path d="M12.5 9.4h6v11.1" />
    <line x1="8.3" y1="9" x2="9.8" y2="9" /><line x1="8.3" y1="12.4" x2="9.8" y2="12.4" />
    <line x1="8.3" y1="15.8" x2="9.8" y2="15.8" /><line x1="15" y1="13" x2="16.2" y2="13" />
  </Svg>
)

export const IconBarcode = (p) => (
  <Svg {...p}>
    <path d="M3.5 6.5v11" /><path d="M6.6 6.5v11" /><path d="M10 6.5v11" />
    <path d="M13.2 6.5v11" /><path d="M17 6.5v11" /><path d="M20.5 6.5v11" />
  </Svg>
)

export const IconSeal = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="9.6" r="5.8" />
    <path d="M8.6 14.6 7.4 21l4.6-2.3L16.6 21l-1.2-6.4" />
    <path d="m10.2 9.6 1.3 1.4 2.4-2.6" />
  </Svg>
)

export const IconQuill = (p) => (
  <Svg {...p}>
    <path d="M4 20.5s.9-5.4 4.6-9.2C12 7.8 16.4 6 20 3.5c0 0-.5 6.7-4.2 10.7-3 3.2-7.3 3.4-9.3 3.4" />
    <line x1="4" y1="20.5" x2="11.5" y2="13" />
  </Svg>
)

export const IconExpand = (p) => (
  <Svg {...p}><polyline points="7 10 12 15 17 10" /><polyline points="7 4 12 9 17 4" transform="translate(0 -1)" /></Svg>
)

export const IconCollapse = (p) => (
  <Svg {...p}><polyline points="7 14 12 9 17 14" /><polyline points="7 20 12 15 17 20" /></Svg>
)

export const IconFocus = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5" /><path d="M15.5 4H18a2 2 0 0 1 2 2v2.5" />
    <path d="M20 15.5V18a2 2 0 0 1-2 2h-2.5" /><path d="M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
  </Svg>
)

export const IconSort = (p) => (
  <Svg {...p}>
    <line x1="4" y1="7" x2="14" y2="7" /><line x1="4" y1="12" x2="11" y2="12" /><line x1="4" y1="17" x2="8" y2="17" />
    <path d="M17 5.5v13" /><polyline points="14.2 15.6 17 18.5 19.8 15.6" />
  </Svg>
)

export const IconGlobe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" /><line x1="3.4" y1="12" x2="20.6" y2="12" />
    <path d="M12 3.4a13.2 13.2 0 0 1 0 17.2 13.2 13.2 0 0 1 0-17.2Z" />
  </Svg>
)

export const IconWarn = (p) => (
  <Svg {...p}>
    <path d="M12 4.2 21 19.6H3L12 4.2Z" /><line x1="12" y1="10" x2="12" y2="14" />
    <circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" />
  </Svg>
)

/** Om glyph inside a lotus ring — used for cover fallbacks and empty states. */
export const IconOrnament = ({ s = 34, ...p }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none" stroke="currentColor"
    strokeWidth="1.3" strokeLinecap="round" aria-hidden="true" {...p}>
    <circle cx="24" cy="24" r="15.5" strokeDasharray="2 4" opacity=".7" />
    <path d="M24 8.5c2.6 3 4 6.4 4 8.8M24 39.5c-2.6-3-4-6.4-4-8.8" opacity=".5" />
    <path d="M17.5 20.5c1.6-2.6 5-2.4 5.6.4.5 2.4-2.2 3.2-3.6 2.2-1.6-1.1-1-3.8 1.6-4.3 3.4-.6 5.6 2 5.6 4.7 0 3.2-2.6 5.4-5.8 5.4-3.6 0-6.2-2.8-6.2-6.4" />
    <path d="M27.4 17.6c1.2-1 3-1 3.9.3M30.6 13.9h.02" />
  </svg>
)

/** Large decorative mandala for the library hero backdrop. */
export const Mandala = (p) => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".9" aria-hidden="true" {...p}>
    <circle cx="100" cy="100" r="96" />
    <circle cx="100" cy="100" r="76" strokeDasharray="3 5" />
    <circle cx="100" cy="100" r="52" />
    <circle cx="100" cy="100" r="26" strokeDasharray="2 4" />
    <circle cx="100" cy="100" r="9" />
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI * 2) / 16
      return (
        <g key={i} transform={`rotate(${(i * 360) / 16} 100 100)`}>
          <path d="M100 100 C112 76 112 58 100 34 C88 58 88 76 100 100Z" opacity=".8" />
          <circle cx={100 + Math.cos(a) * 0} cy="30" r="2.6" />
        </g>
      )
    })}
  </svg>
)
