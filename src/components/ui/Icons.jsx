import React from 'react'

// App-wide stroke-icon set, drawn on the same 24px grid and weight as the book
// section's icons so the two never look like different products. Every icon
// inherits colour from `currentColor` and takes its size from the `s` prop.
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

/* ── Navigation & chrome ─────────────────────────────────────────── */
export const IconMenu = (p) => <Svg {...p}><line x1="3.5" y1="7" x2="20.5" y2="7" /><line x1="3.5" y1="12" x2="20.5" y2="12" /><line x1="3.5" y1="17" x2="20.5" y2="17" /></Svg>
export const IconX = (p) => <Svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>
export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="7.5" /><line x1="16.8" y1="16.8" x2="21" y2="21" /></Svg>
export const IconHome = (p) => <Svg {...p}><path d="M4 10.6 12 4l8 6.6" /><path d="M5.8 9.4V19a1 1 0 0 0 1 1h10.4a1 1 0 0 0 1-1V9.4" /><path d="M9.8 20v-5.4h4.4V20" /></Svg>
export const IconChevronRight = (p) => <Svg {...p}><polyline points="9 18 15 12 9 6" /></Svg>
export const IconChevronLeft = (p) => <Svg {...p}><polyline points="15 18 9 12 15 6" /></Svg>
export const IconChevronDown = (p) => <Svg {...p}><polyline points="6 9 12 15 18 9" /></Svg>
export const IconArrowRight = (p) => <Svg {...p}><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></Svg>
export const IconCheck = (p) => <Svg {...p}><polyline points="4 12.5 9 17.5 20 6.5" /></Svg>
export const IconUser = (p) => <Svg {...p}><circle cx="12" cy="8.2" r="3.9" /><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" /></Svg>
export const IconExternal = (p) => <Svg {...p}><path d="M14 4h6v6" /><line x1="20" y1="4" x2="11" y2="13" /><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" /></Svg>

/* ── Theme ───────────────────────────────────────────────────────── */
export const IconSun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
  </Svg>
)
export const IconMoon = (p) => <Svg {...p}><path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.8 8.8 0 1 0 10.8 10.8Z" /></Svg>

/* ── Contact ─────────────────────────────────────────────────────── */
export const IconPhone = (p) => (
  <Svg {...p}>
    <path d="M6.4 3.5h3l1.6 4-2 1.4a12.5 12.5 0 0 0 6.1 6.1l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A17.4 17.4 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2Z" />
  </Svg>
)
/* Kept in WhatsApp's own green rather than inheriting the button colour — the
   mark is only worth showing if it reads as WhatsApp. Green alone disappears
   into a saffron button, so it sits on a white disc and stays legible on any
   background the mark lands on. */
export const IconWhatsapp = ({ s = 18, ...p }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="var(--whatsapp)" aria-hidden="true" focusable="false" {...p}>
    <circle cx="12" cy="12" r="11.6" fill="#FFFFFF" />
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91a9.85 9.85 0 0 0 1.35 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 0 16.47Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64 1.53.66 2.13.72 2.9.6.46-.06 1.47-.6 1.68-1.18.2-.58.2-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
)
export const IconMail = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.6 6.5 8.4 6 8.4-6" /></Svg>
export const IconPin = (p) => <Svg {...p}><path d="M12 21s7-5.7 7-10.6a7 7 0 1 0-14 0C5 15.3 12 21 12 21Z" /><circle cx="12" cy="10.2" r="2.7" /></Svg>

/* ── Domain glyphs (services, tools) ─────────────────────────────── */
export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
    <line x1="3.2" y1="9.6" x2="20.8" y2="9.6" />
    <line x1="8" y1="3" x2="8" y2="6.4" /><line x1="16" y1="3" x2="16" y2="6.4" />
    <circle cx="8.4" cy="14" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconZodiac = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <circle cx="12" cy="12" r="3.4" strokeDasharray="2 3" />
    <path d="M12 3.2v3M12 17.8v3M3.2 12h3M17.8 12h3" />
    <path d="m5.8 5.8 2.1 2.1M16.1 16.1l2.1 2.1M18.2 5.8l-2.1 2.1M7.9 16.1l-2.1 2.1" opacity=".7" />
  </Svg>
)
export const IconChart = (p) => (
  <Svg {...p}>
    <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2" transform="rotate(45 12 12)" />
    <line x1="3.4" y1="12" x2="20.6" y2="12" /><line x1="12" y1="3.4" x2="12" y2="20.6" />
  </Svg>
)
export const IconDiya = (p) => (
  <Svg {...p}>
    <path d="M12 3.4c1.9 2 2.9 3.5 2.9 5a2.9 2.9 0 1 1-5.8 0c0-1.5 1-3 2.9-5Z" />
    <path d="M4.2 14.6h15.6c-.7 3.4-3.8 5.6-7.8 5.6s-7.1-2.2-7.8-5.6Z" />
  </Svg>
)
export const IconGem = (p) => (
  <Svg {...p}>
    <path d="M7.4 3.6h9.2L21 9.2 12 20.6 3 9.2l4.4-5.6Z" />
    <path d="M3 9.2h18M8.6 9.2 12 20.6l3.4-11.4M7.4 3.6 8.6 9.2M16.6 3.6 15.4 9.2" />
  </Svg>
)
export const IconCalculator = (p) => (
  <Svg {...p}>
    <rect x="4.4" y="2.8" width="15.2" height="18.4" rx="2.2" />
    <rect x="7.4" y="5.8" width="9.2" height="3.4" rx="1" />
    <circle cx="8.4" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="8.4" cy="17.2" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="17.2" r="1" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconPalm = (p) => (
  <Svg {...p}>
    <path d="M8.4 12.6V5.4a1.5 1.5 0 0 1 3 0v5.6" />
    <path d="M11.4 10.4V4.6a1.5 1.5 0 0 1 3 0v6.2" />
    <path d="M14.4 11V6.8a1.5 1.5 0 1 1 3 0v7.4c0 4-2.4 6.6-5.8 6.6-3 0-4.6-1.6-5.9-4.2l-1.4-2.8a1.5 1.5 0 0 1 2.5-1.6l1.6 2.2" />
  </Svg>
)
export const IconCompass = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.8" /><path d="m15.6 8.4-2 5.2-5.2 2 2-5.2 5.2-2Z" /></Svg>
)
export const IconBook = (p) => (
  <Svg {...p}>
    <path d="M4 19.2V5.4A2.4 2.4 0 0 1 6.4 3H19a1 1 0 0 1 1 1v13.5" />
    <path d="M6.4 21H20v-3.5H6.4A2.4 2.4 0 0 0 4 19.9 1.1 1.1 0 0 0 5.1 21Z" />
  </Svg>
)
export const IconKalash = (p) => (
  <Svg {...p}>
    <path d="M9 7.4h6l-.6 1.8a5.4 5.4 0 0 1 3 4.8c0 3-2.4 5.2-5.4 5.2s-5.4-2.2-5.4-5.2a5.4 5.4 0 0 1 3-4.8L9 7.4Z" />
    <path d="M8 7.4h8M12 7.4V4.6M10.2 4.6c.4-1 3.2-1 3.6 0" />
  </Svg>
)
export const IconOm = (p) => (
  <Svg {...p}>
    <path d="M6.4 13.4c1.4-2.6 4.8-2.4 5.4.4.5 2.4-2.1 3.3-3.4 2.3-1.5-1.1-.9-3.8 1.6-4.3 3.3-.6 5.5 2 5.5 4.7 0 3-2.5 5.2-5.6 5.2-3.4 0-6-2.7-6-6.2" />
    <path d="M15.6 10.8c1.1-1 2.9-1 3.8.3" />
    <circle cx="19" cy="7.2" r="1" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconQuiz = (p) => (
  <Svg {...p}>
    <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="3.6" />
    <path d="M9.6 9.5a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.7-.9 1.3v.4" />
    <circle cx="12" cy="16.7" r="1" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconTarget = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.6" /><circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></Svg>
)
export const IconFlame = (p) => (
  <Svg {...p}>
    <path d="M12 2.8c3.4 3.2 5.6 6 5.6 8.9a5.6 5.6 0 1 1-11.2 0c0-1.6.7-3.2 2-4.9.3 1.4 1 2.2 2 2.4-.4-2.4.1-4.5 1.6-6.4Z" />
  </Svg>
)
export const IconBookmark = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6.2 3.8h11.6a1 1 0 0 1 1 1v15.4L12 16.4l-6.8 3.8V4.8a1 1 0 0 1 1-1Z" />
  </Svg>
)
export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="4.4" y="10.4" width="15.2" height="10.2" rx="2.2" />
    <path d="M8 10.4V7.6a4 4 0 0 1 8 0v2.8" />
  </Svg>
)
export const IconRefresh = (p) => (
  <Svg {...p}>
    <path d="M20.2 12a8.2 8.2 0 1 1-2.4-5.8" /><polyline points="20.4 3.4 20.4 8.2 15.6 8.2" />
  </Svg>
)
export const IconVideo = (p) => (
  <Svg {...p}><rect x="2.8" y="5.4" width="13" height="13.2" rx="2.4" /><path d="m15.8 10.6 5.4-3.2v9.2l-5.4-3.2Z" /></Svg>
)
export const IconCart = (p) => (
  <Svg {...p}>
    <path d="M2.8 3.6h2.4l2.4 11.2h9.8l2-7.8H6.2" />
    <circle cx="9.4" cy="19.2" r="1.5" /><circle cx="16.8" cy="19.2" r="1.5" />
  </Svg>
)
export const IconSparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3.2 13.7 9l5.8 1.7-5.8 1.7L12 18.2l-1.7-5.8L4.5 10.7 10.3 9 12 3.2Z" />
    <path d="M18.6 3.4 19.2 5.4l2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z" />
  </Svg>
)
export const IconStar = ({ filled = true, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.9l-5.2 2.75 1-5.8-4.2-4.1 5.8-.85L12 3.6Z" />
  </Svg>
)
export const IconClock = (p) => <Svg {...p}><circle cx="12" cy="12" r="8.8" /><polyline points="12 6.8 12 12 15.6 14" /></Svg>
export const IconSunrise = (p) => (
  <Svg {...p}>
    <path d="M3.4 18.4h17.2" /><path d="M6.6 14.6a5.4 5.4 0 0 1 10.8 0" />
    <path d="M12 3.4v3.2M4.8 7l1.6 1.6M19.2 7l-1.6 1.6" />
  </Svg>
)

/* ── States ──────────────────────────────────────────────────────── */
export const IconWarn = (p) => (
  <Svg {...p}>
    <path d="M12 4.2 21 19.6H3L12 4.2Z" /><line x1="12" y1="10" x2="12" y2="14" />
    <circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconInbox = (p) => (
  <Svg {...p}>
    <path d="M3.2 13.4h4.4l1.4 2.6h6l1.4-2.6h4.4" />
    <path d="M5.6 4.6h12.8l2.4 8.8v4.4a2 2 0 0 1-2 2H5.2a2 2 0 0 1-2-2v-4.4L5.6 4.6Z" />
  </Svg>
)

/* ── Decorative ──────────────────────────────────────────────────── */
/** Small lotus/diamond flourish used between sections. */
export const Ornament = ({ s = 16, ...p }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 2.8 14.4 9.6 21.2 12l-6.8 2.4L12 21.2 9.6 14.4 2.8 12l6.8-2.4L12 2.8Z" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
)

/**
 * Astrolabe ring for the hero portrait: 12 rashi divisions on the outer band,
 * 27 nakshatra points inside it. Deliberately an open frame with nothing in
 * the middle — a filled disc gives a cut-out photograph a hard seam to sit on,
 * which is exactly what makes it look pasted.
 */
export const RashiChakra = (p) => (
  <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true" {...p}>
    <circle cx="200" cy="200" r="196" strokeWidth="1" opacity=".5" />
    <circle cx="200" cy="200" r="176" strokeWidth="1" opacity=".3" />

    {/* 27 nakshatra points */}
    <circle
      cx="200" cy="200" r="186"
      strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.01 43.28" opacity=".55"
    />

    {/* 12 rashi divisions */}
    {Array.from({ length: 12 }, (_, i) => (
      <line
        key={i}
        x1="200" y1="4" x2="200" y2="24"
        strokeWidth="1" opacity=".6"
        transform={`rotate(${i * 30} 200 200)`}
      />
    ))}

    {/* cardinal points */}
    {Array.from({ length: 4 }, (_, i) => (
      <circle
        key={`c${i}`}
        cx="200" cy="4" r="3.2"
        fill="currentColor" stroke="none" opacity=".75"
        transform={`rotate(${i * 90} 200 200)`}
      />
    ))}

    <circle cx="200" cy="200" r="142" strokeWidth="1" strokeDasharray="1.5 9" opacity=".4" />
  </svg>
)

/** Large zodiac-wheel line art for hero and 404 backdrops. */
export const Mandala = (p) => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".9" aria-hidden="true" {...p}>
    <circle cx="100" cy="100" r="96" />
    <circle cx="100" cy="100" r="76" strokeDasharray="3 5" />
    <circle cx="100" cy="100" r="52" />
    <circle cx="100" cy="100" r="26" strokeDasharray="2 4" />
    <circle cx="100" cy="100" r="9" />
    {Array.from({ length: 12 }, (_, i) => (
      <g key={i} transform={`rotate(${(i * 360) / 12} 100 100)`}>
        <line x1="100" y1="24" x2="100" y2="48" opacity=".8" />
        <circle cx="100" cy="17" r="2.4" />
      </g>
    ))}
  </svg>
)
