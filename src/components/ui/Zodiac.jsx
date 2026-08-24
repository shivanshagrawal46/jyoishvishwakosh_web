import React from 'react'

// Traditional zodiac glyphs drawn as a single-weight line set. This replaces
// the mixed photographic/AI zodiac artwork, which was the loudest visual
// inconsistency on the landing page.
const Glyph = ({ s = 30, children, ...rest }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
)

export const Aries = (p) => (
  <Glyph {...p}>
    <path d="M12 20.5V8.2" />
    <path d="M12 8.2c0-3-1.9-4.9-4.2-4.9S3.9 5.2 3.9 7.8c0 1.5.6 2.7 1.5 3.5" />
    <path d="M12 8.2c0-3 1.9-4.9 4.2-4.9s3.9 1.9 3.9 4.5c0 1.5-.6 2.7-1.5 3.5" />
  </Glyph>
)

export const Taurus = (p) => (
  <Glyph {...p}>
    <circle cx="12" cy="15.4" r="5.4" />
    <path d="M4.6 3.6c0 3.6 3.3 6.4 7.4 6.4s7.4-2.8 7.4-6.4" />
  </Glyph>
)

export const Gemini = (p) => (
  <Glyph {...p}>
    <path d="M5.4 4.2c4.3 1.7 8.9 1.7 13.2 0" />
    <path d="M5.4 19.8c4.3-1.7 8.9-1.7 13.2 0" />
    <path d="M9.2 4.8v14.4M14.8 4.8v14.4" />
  </Glyph>
)

export const Cancer = (p) => (
  <Glyph {...p}>
    <path d="M20.4 10.6C17.5 6.6 10.4 5.9 6.6 9.2" />
    <circle cx="5.6" cy="11.2" r="2.4" />
    <path d="M3.6 13.4c2.9 4 10 4.7 13.8 1.4" />
    <circle cx="18.4" cy="12.8" r="2.4" />
  </Glyph>
)

export const Leo = (p) => (
  <Glyph {...p}>
    <circle cx="8.4" cy="15.8" r="3.4" />
    <path d="M11.4 13.6c-.6-3.6-.3-6.6 1.2-8.4 1.6-2 4.4-1.5 5.2.8.7 2-.3 3.6-1.2 5.4-.9 1.8-1.2 3.4-.6 4.8.5 1.2 1.6 1.9 3 1.8" />
  </Glyph>
)

export const Virgo = (p) => (
  <Glyph {...p}>
    <path d="M3.6 6.6v11" />
    <path d="M3.6 8.4c0-1.5 1-2.4 2.2-2.4S8 6.9 8 8.4v9.2" />
    <path d="M8 8.4c0-1.5 1-2.4 2.2-2.4s2.2.9 2.2 2.4v9.2" />
    <path d="M12.4 8.4c0-1.5 1-2.4 2.2-2.4s2.2.9 2.2 2.4c0 3.6-.6 6.2-.6 8.4" />
    <path d="M14.6 16.4c2.2-.4 4.6.8 5 3 .4 2-1 3.6-2.8 3.2" />
  </Glyph>
)

export const Libra = (p) => (
  <Glyph {...p}>
    <path d="M3.4 19.6h17.2" />
    <path d="M3.4 15.2h5.4" />
    <path d="M15.2 15.2h5.4" />
    <path d="M8.8 15.2a4.4 4.4 0 1 1 6.4 0" />
  </Glyph>
)

export const Scorpio = (p) => (
  <Glyph {...p}>
    <path d="M3 6.6v11" />
    <path d="M3 8.4c0-1.5 1-2.4 2.1-2.4s2.1.9 2.1 2.4v9.2" />
    <path d="M7.2 8.4c0-1.5 1-2.4 2.1-2.4s2.1.9 2.1 2.4v9.2" />
    <path d="M11.4 8.4c0-1.5 1-2.4 2.1-2.4s2.1.9 2.1 2.4v9.6l3.4 3.4" />
    <path d="M17 20.9h3.1v-3.1" />
  </Glyph>
)

export const Sagittarius = (p) => (
  <Glyph {...p}>
    <path d="M4.6 19.4 19.4 4.6" />
    <path d="M13.2 4.6h6.2v6.2" />
    <path d="M8.4 12.6l3 3" />
  </Glyph>
)

export const Capricorn = (p) => (
  <Glyph {...p}>
    <path d="M3.6 6.2c2 .3 3 2.2 3.4 4.2.5 2.4.8 5.2.8 7.4" />
    <path d="M7.8 17.8c0-6.2 1.6-11.4 4.2-11.4 1.9 0 2.9 1.7 2.9 3.6 0 1.6-.7 3-2 4.1" />
    <path d="M15.2 13.6c2.2-.3 4 1.4 4 3.5s-1.8 3.7-3.7 3.3c-1.3-.3-2-1.6-1.4-2.7" />
  </Glyph>
)

export const Aquarius = (p) => (
  <Glyph {...p}>
    <path d="M3.2 10.4 6.6 7.6l3.4 2.8 3.4-2.8 3.4 2.8 3.4-2.8" />
    <path d="M3.2 16.8 6.6 14l3.4 2.8 3.4-2.8 3.4 2.8 3.4-2.8" />
  </Glyph>
)

export const Pisces = (p) => (
  <Glyph {...p}>
    <path d="M7.2 3.4c-2.6 3-2.6 14.2 0 17.2" />
    <path d="M16.8 3.4c2.6 3 2.6 14.2 0 17.2" />
    <path d="M4.2 12h15.6" />
  </Glyph>
)

/** In zodiacal order, with Hindi and English names and their date ranges. */
export const ZODIAC = [
  { id: 'aries',       name: 'Aries',       nameHi: 'मेष',      Glyph: Aries,       range: 'Mar 21 – Apr 19' },
  { id: 'taurus',      name: 'Taurus',      nameHi: 'वृषभ',     Glyph: Taurus,      range: 'Apr 20 – May 20' },
  { id: 'gemini',      name: 'Gemini',      nameHi: 'मिथुन',    Glyph: Gemini,      range: 'May 21 – Jun 20' },
  { id: 'cancer',      name: 'Cancer',      nameHi: 'कर्क',     Glyph: Cancer,      range: 'Jun 21 – Jul 22' },
  { id: 'leo',         name: 'Leo',         nameHi: 'सिंह',     Glyph: Leo,         range: 'Jul 23 – Aug 22' },
  { id: 'virgo',       name: 'Virgo',       nameHi: 'कन्या',    Glyph: Virgo,       range: 'Aug 23 – Sep 22' },
  { id: 'libra',       name: 'Libra',       nameHi: 'तुला',     Glyph: Libra,       range: 'Sep 23 – Oct 22' },
  { id: 'scorpio',     name: 'Scorpio',     nameHi: 'वृश्चिक',   Glyph: Scorpio,     range: 'Oct 23 – Nov 21' },
  { id: 'sagittarius', name: 'Sagittarius', nameHi: 'धनु',      Glyph: Sagittarius, range: 'Nov 22 – Dec 21' },
  { id: 'capricorn',   name: 'Capricorn',   nameHi: 'मकर',      Glyph: Capricorn,   range: 'Dec 22 – Jan 19' },
  { id: 'aquarius',    name: 'Aquarius',    nameHi: 'कुम्भ',     Glyph: Aquarius,    range: 'Jan 20 – Feb 18' },
  { id: 'pisces',      name: 'Pisces',      nameHi: 'मीन',      Glyph: Pisces,      range: 'Feb 19 – Mar 20' },
]
