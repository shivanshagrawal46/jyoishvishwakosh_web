# Jyotish Vishwakosh — Landing Page Redesign Plan

> Audience: an AI coding agent (or developer) executing this plan end-to-end.
> Scope: the landing page (`/` route: `src/App.jsx` → `HomePage`) and the global chrome it shares with other pages (header, footer, tokens in `src/index.css`).
> Evidence: real screenshots at 1440×900 (desktop) and 390×844 (mobile) live in `ui-review/shots/`. Re-run `node ui-review/screenshot.mjs` (dev server on port 3000) after each phase to compare.

---

## Part 1 — Audit: current issues

### 1.1 Structural / information architecture

| # | Issue | Where |
|---|-------|-------|
| S1 | **No hero section.** The page opens directly with a wall of 21 service icons. There is no headline, no value proposition, no primary CTA, no H1 anywhere on the page. On mobile the icon grid alone fills the first two screens. | `HomePage` in `src/App.jsx`, `Services.jsx` |
| S2 | **Two fixed bars eat ~100px of every viewport.** Header (64px) + fixed celebrity ticker (`.celebrity-strip`, `position: fixed; top: 64px`) and `body { padding-top: 100px }` hardcoded. On a 390px-wide phone that is >11% of the screen permanently gone. | `index.css` lines 56–75, 310–390 |
| S3 | **The celebrity ticker is a single item looping every 15s** with long blank gaps, text clipped mid-word ("dey - Celebrity Astrologer"), and it visually collides with page content while scrolling. | `CelebrityStrip.jsx` |
| S4 | **FloatingBooks bubbles look like debug artifacts.** White pills with Sanskrit book names rise along the right edge, overlapping the Panchang card, headings and footer on desktop (`z-index: 100`, fixed, 180px wide column). They communicate nothing actionable. | `FloatingBooks.jsx`, `index.css` 2255–2302 |
| S5 | **Redundant sections.** `VisionarySection` ("ज्ञान के पीछे") and `AboutTeam` ("हमारी टीम से मिलें") both present Dr. Bhupendra Pandey back-to-back with near-identical photos and copy. |
| S6 | **21 services in one flat, unranked grid** — Panchang sits next to "Videos" with equal weight. No grouping, no hierarchy, three items are dead ends that fire a browser `alert('Coming Soon')`. | `Services.jsx` |
| S7 | **`BottomNav` component exists but is not rendered on Home**, yet `body { padding-bottom: 70px }` reserves space for it → permanent dead space above the footer. |

### 1.2 Visual design

| # | Issue | Where |
|---|-------|-------|
| V1 | **Clashing palette.** Cream `#FEF7E5` background + saturated orange `#FF6B35` + banana-yellow banner gradient (`#FFD93D → #FFE97F`) + a yellow highlighter band with a green border inside the Panchang card. Reads as three different products. | `:root` tokens, `.astrologer-banner-inner`, Panchang highlight |
| V2 | **Inconsistent icon system.** The service grid mixes flat PNGs, photographic JPEGs, 3D renders and a literal YouTube logo. Zodiac cards use dark fantasy AI-generated JPEGs that clash with the pastel theme (dark squares visible inside light circles). | `src/assets/icons/*` |
| V3 | **Emoji as section iconography** (🔢 गणना उपकरण, 🙏 ई-पूजा सेवाएं, ★★★★★) — looks cheap next to the devotional brand. | `CalculationSection.jsx`, `EPooja.jsx`, `AppDownloadBanner.jsx` |
| V4 | **Single font (Laila) for everything** — display headings, body, UI labels, numbers, English text. No typographic scale; section titles are barely larger than body text. |
| V5 | **Contrast failures.** Muted grey `#757575` on cream, white pill badges on pale yellow, number chips over the Hanuman image in Prashn Yantra (illegible), orange text on light-orange gradients. |
| V6 | **Carousels crop cards at both edges** (AstroShop, E-Pooja, Team) with arrows overlapping content; on mobile prices/titles are cut off mid-render. |
| V7 | **App download section**: phone mockup awkwardly overlaps the orange card; on mobile it is cut off; the block claims "★★★★★ 4.5+". |

### 1.3 UX / functional

| # | Issue | Where |
|---|-------|-------|
| U1 | **Primary CTAs do nothing.** "अभी कॉल करें" and "चैट करें" buttons have no handlers — no `tel:`, no WhatsApp link. This is the page's main conversion action. | `AstrologerBanner.jsx` |
| U2 | **Dead links everywhere.** All footer links except Contact are `href="#"`. "Kundli" in nav and services points to `#app-download` (a bait redirect to the app banner). |
| U3 | **`user-select: none` on the whole site + hidden caret.** Users cannot copy panchang timings, muhurat data, or their own prediction results. Also breaks accessibility tooling. | `index.css` 70–90 |
| U4 | **`alert()` used for "Coming Soon" and login errors** — jarring, blocks the thread, looks broken. | `Services.jsx`, `Header.jsx` |
| U5 | **Mobile header cramped**: clipped logo, language toggle, full-width "Sign in with Google" button and hamburger all in one 64px row. |
| U6 | **`scroll-snap-type: y proximity` on `html`** causes scroll hijacking/jank on long pages. | `index.css` line 54 |
| U7 | **Language preference not persisted** (React state only — resets on reload). | `App.jsx` |
| U8 | **Prashn Yantra number grid**: ~24px tap targets over a busy image — unusable on mobile. | `AIJyotishSection.jsx` |

### 1.4 Performance / accessibility / SEO

| # | Issue |
|---|-------|
| P1 | `index.css` is a 248KB monolith (12,900+ lines, 82 media queries) loaded on every page. |
| P2 | Unoptimized images: `jyotish_calculator.jpg` 709KB, `vastu_calculator.png` 529KB, `astrologer.jpeg` 224KB ×2, `ankjyotish.png` 221KB, `logo.jpg` 180KB. No WebP, no `loading="lazy"`, no `srcset`. |
| P3 | Framer-motion runs infinite animations permanently (celebrity ticker, pulsing call button, breathing astrologer photo) + `FloatingBooks` calls `setState` every 1.1s forever → constant re-renders. No `prefers-reduced-motion` support. |
| P4 | Google Fonts imported via CSS `@import` (render-blocking); only Laila loaded. |
| P5 | No H1, no OG/Twitter meta tags, no structured data, favicon points into `/src/`. |
| P6 | No visible focus states; icon buttons without `aria-label`; motion.div used for clickable cards instead of buttons/links in places. |

---

## Part 2 — Design direction

### 2.1 Answer to "colour change mode?"

**Yes — two moves, in this order:**

1. **Refine the light theme now (default): "Kesari & Ivory".** Keep the warm devotional identity (this audience expects saffron/gold, not a generic SaaS blue) but replace the banana-yellow + neon-orange combination with a disciplined 3-color system: deep saffron as the single action color, deep maroon-brown as the ink/heading color, and gold used *only* as a thin accent (borders, dividers, stars). Everything else is ivory/white surfaces.
2. **Add an optional "Ratri (night) mode" as the final phase.** A deep indigo night-sky dark theme is a perfect brand fit for astrology (stars, planets). Build it as a token swap (`[data-theme="dark"]`), toggled from the header, persisted in `localStorage`, defaulting to `prefers-color-scheme`. Do NOT make dark the default — the devotional audience and the existing brand are light/warm.

### 2.2 Design tokens (implement exactly)

Replace the current `:root` block in `src/index.css`:

```css
:root {
  /* ── Brand core ── */
  --saffron-600: #E85822;   /* primary action */
  --saffron-700: #C74615;   /* hover/pressed */
  --saffron-100: #FDEADF;   /* tinted surface */
  --saffron-50:  #FEF4EE;

  --maroon-900: #4A1B0F;    /* display headings */
  --maroon-700: #7C2D12;    /* secondary accent, links */

  --gold-500: #C99B2F;      /* thin accents only: borders, stars, dividers */
  --gold-100: #F6ECD4;

  /* ── Neutrals (warm) ── */
  --ivory: #FBF6EC;         /* page background */
  --surface: #FFFFFF;       /* cards */
  --surface-warm: #FFFDF7;  /* alternate section bg */
  --ink-900: #241A12;       /* body text — 13.9:1 on ivory */
  --ink-600: #5C4F43;       /* secondary text — 6.7:1 */
  --ink-400: #8A7A6B;       /* captions only, never < 14px */
  --line: #EADFCE;          /* borders */

  /* ── Semantic ── */
  --success: #1E7B34;
  --danger:  #B3261E;

  /* ── Elevation ── */
  --shadow-sm: 0 1px 2px rgba(74, 27, 15, .06), 0 1px 3px rgba(74, 27, 15, .08);
  --shadow-md: 0 4px 12px rgba(74, 27, 15, .08), 0 2px 4px rgba(74, 27, 15, .06);
  --shadow-lg: 0 12px 32px rgba(74, 27, 15, .12);

  /* ── Radius ── */
  --r-sm: 8px; --r-md: 14px; --r-lg: 22px; --r-full: 999px;

  /* ── Spacing (4pt) ── */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;

  /* ── Fluid type scale ── */
  --fs-display: clamp(1.9rem, 1.2rem + 3vw, 3.2rem);
  --fs-h2: clamp(1.4rem, 1.1rem + 1.4vw, 2rem);
  --fs-h3: clamp(1.15rem, 1rem + .6vw, 1.35rem);
  --fs-body: 1rem;
  --fs-small: .875rem;
  --fs-caption: .8125rem;

  /* ── Z-index scale ── */
  --z-header: 1000; --z-dropdown: 1100; --z-modal: 1300; --z-toast: 1400;
}

[data-theme="dark"] {
  --ivory: #131022;          /* night-sky indigo, not pure black */
  --surface: #1D1932;
  --surface-warm: #191531;
  --ink-900: #F3EDE2;
  --ink-600: #BFB4A5;
  --ink-400: #8A8093;
  --line: #322B4A;
  --saffron-600: #FF7A3D;    /* brightened for dark bg contrast */
  --saffron-700: #FF8F5A;
  --saffron-100: #33251F;
  --saffron-50: #2A1F1B;
  --maroon-900: #F3EDE2;     /* headings become light */
  --maroon-700: #E8B98A;
  --gold-500: #E3B94F;
  --gold-100: #2E2717;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,.5);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.6);
}
```

**Migration note:** keep the old variable names (`--orange`, `--bg-primary`, `--text-primary`, …) as aliases pointing at the new tokens during the transition so the other 30+ pages don't break:
`--orange: var(--saffron-600); --bg-primary: var(--ivory); --text-primary: var(--ink-900);` etc.

### 2.3 Typography

- **Display/headings (Devanagari + Latin):** `"Tiro Devanagari Hindi", serif` — an elegant, high-contrast Devanagari serif that gives the devotional gravitas Laila lacks. Weight 400 (it's a display serif; size does the work).
- **Body/UI:** `"Mukta", sans-serif` — excellent Devanagari + Latin legibility at small sizes, multiple weights (400/500/600/700).
- Load via `<link rel="preconnect">` + `<link>` in `index.html` (remove the CSS `@import`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&family=Mukta:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- Tokens: `--font-display: 'Tiro Devanagari Hindi', 'Laila', serif;` `--font-body: 'Mukta', 'Laila', sans-serif;`
- Rules: h1/h2/h3 use `--font-display` in `--maroon-900`; all UI labels/buttons use `--font-body` 500–600; line-height 1.75 for Hindi body text (Devanagari needs more leading), 1.3 for headings.

### 2.4 Iconography

Replace the mixed PNG/JPEG icon zoo with **one consistent style**: duotone line icons (saffron stroke + gold fill accents) inside soft `--saffron-50` rounded-square tiles with a `--line` border. Options, in order of preference:
1. Commission/generate a consistent SVG set (24 icons: panchang, rashifal, pooja thali, kalash, book, gemstone, calculator, palm, compass/vastu, chakra, etc.).
2. Interim: keep the best existing PNGs, but normalize — same canvas size, transparent background, place all on identical tiles so inconsistency is masked.
Zodiac: replace the dark AI JPEGs with a single-style zodiac glyph set (gold line glyphs on `--maroon-900` circular medallions, or saffron glyphs on ivory). This is the highest-visibility inconsistency on the page.

---

## Part 3 — Execution plan (phased, with acceptance criteria)

Execute phases in order. After each phase: `node ui-review/screenshot.mjs` and visually diff against `ui-review/shots/`.

### Phase 0 — Foundation (tokens, fonts, hygiene) — no visual redesign yet
**Files:** `src/index.css`, `index.html`, `src/App.jsx`

1. Replace `:root` with the token set from §2.2 (+ legacy aliases).
2. Fonts per §2.3 (link tags in `index.html`, remove `@import`).
3. Delete `user-select: none`, `caret-color: transparent` blocks entirely.
4. Delete `scroll-snap-type: y proximity` from `html`.
5. Remove `padding-top: 100px; padding-bottom: 70px` from `body`; instead the header gets a CSS var `--header-h` and `main` gets `padding-top: var(--header-h)`.
6. Add global focus style: `:focus-visible { outline: 2px solid var(--saffron-600); outline-offset: 2px; }`.
7. Add `@media (prefers-reduced-motion: reduce)` kill-switch for all animations/transitions.
8. Delete the commented-out right-click-blocking code in `App.jsx`.
9. Persist language: initialize from `localStorage.getItem('jv-lang')`, write on change.

**Accept:** text is selectable; no layout shift at top of page; fonts render Devanagari in Tiro (headings) / Mukta (body); tab key shows focus rings.

### Phase 1 — Global chrome (header, ticker, floating bubbles, footer)
**Files:** `Header.jsx`, `CelebrityStrip.jsx` (delete), `FloatingBooks.jsx` (delete), `Footer.jsx`, `App.jsx`, `index.css`

1. **Delete `FloatingBooks` and `CelebrityStrip`** components and their CSS. The celebrity credential moves into the hero (Phase 2).
2. **Header** (single sticky bar, 64px desktop / 56px mobile, `--surface` bg, `--line` bottom border, subtle shadow on scroll):
   - Desktop: logo left · nav center (होम, कुंडली, राशिफल, पंचांग, शॉप, ई-पूजा, संपर्क) · right cluster: language pill toggle, theme toggle placeholder (Phase 7), sign-in.
   - Active nav item: `--saffron-600` text + 2px underline. Hover: `--saffron-50` pill background.
   - Mobile: logo (never clipped — set explicit height, `object-fit: contain`) + hamburger + compact sign-in (Google "G" icon-button only; full button lives inside the drawer). Language toggle moves into the drawer.
   - Mobile menu: full-height slide-in drawer (not a push-down accordion), with nav links at 48px tap height, language toggle, and sign-in at the bottom. Move all inline styles into CSS classes.
3. **Footer**: wire every link to its real route (`/rashi-fal`, `/panchang`, `/astroshop`, `/e-pooja`, `/books`, `/contact`, …). Remove items that have no destination. Add contact line (WhatsApp number as `https://wa.me/919754648985`, email if available). Dark maroon (`--maroon-900`) background with ivory text for a grounded page end; social icons monochrome ivory.
4. Replace login-error `alert()` with a small inline toast/error text under the header.

**Accept:** no fixed elements besides the header; zero dead links in footer; mobile header fits in one uncramped row; hamburger opens a drawer.

### Phase 2 — Hero section (new component)
**Files:** new `src/components/Hero.jsx`, `index.css`, `App.jsx` (render first inside `<main>`)

Layout (desktop: 2-col 55/45; mobile: stacked):
- **Left:**
  - H1 (the page's only H1), `--font-display`, `--fs-display`, `--maroon-900`:
    HI: "वैदिक ज्ञान, आपकी हथेली में" / EN: "Vedic wisdom, at your fingertips".
  - Subline (`--ink-600`, max 2 lines): "कुंडली, राशिफल, पंचांग, ई-पूजा — भारत का विश्वसनीय ज्योतिष पोर्टल।"
  - Primary CTA: "मुफ़्त भविष्यवाणी पाएं" → scrolls to the AI Jyotish form (`#ai-jyotish`). Solid `--saffron-600`, 48px height, `--r-full`.
  - Secondary CTA: "ज्योतिषी से बात करें" → `https://wa.me/919754648985` (outline style).
  - Trust row (small, `--ink-400`): "डॉ. भूपेंद्र पांडेय — सेलिब्रिटी ज्योतिषी" with his 32px avatar (this replaces the deleted ticker) · "Google Play ★ 4.5".
- **Right:** today-at-a-glance **Panchang snapshot card** (real data from the existing Panchang API): date, tithi, nakshatra, rahu kaal — 4 rows max + "पूरा पंचांग →" link to `/panchang`. This gives instant daily utility, the #1 reason returning users visit astrology portals.
- Background: `--ivory` with a very subtle radial gold glow top-right and a faint 1200px zodiac-wheel line-art SVG at 4% opacity, right-anchored. No parallax.
- Entrance: one gentle fade-up for the whole hero (300ms), nothing staggered.

**Accept:** above the fold on 390px shows H1 + subline + both CTAs; H1 is the only h1 on the page; hero paints < 1s on dev server.

### Phase 3 — Services grid (information architecture)
**Files:** `Services.jsx`, `index.css`

1. Restructure data as one array with `{ name, nameHi, icon, path, category, featured }` — delete the 21 `isXyz` booleans and the ternary chain; derive link type from `path`.
2. **Curate: show 8 featured tiles** (पंचांग, राशिफल, कुंडली, ई-पूजा, एस्ट्रो शॉप, AI ज्योतिष, ग्रंथ, कर्मकांड) in a 4×2 grid (2×4 on mobile), each on a `--surface` card tile: 64px icon tile + label + one-line Hindi descriptor, `--shadow-sm`, hover lift + `--saffron-600` border.
3. Below: "सभी सेवाएं" expandable row (or horizontal chip list) with the remaining 13 as compact chips — icon + label, scrollable on mobile.
4. Section header pattern (reused by ALL sections): small gold overline label (e.g. "हमारी सेवाएं"), h2 in display font, optional right-aligned "सभी देखें →". **No emojis.**
5. Unavailable items: render with `aria-disabled`, 50% opacity, small "जल्द ही" badge. No `alert()`.
6. Icon treatment per §2.4.

**Accept:** first content section shows exactly 8 tiles; all tiles navigate; no alert dialogs; icons visually uniform.

### Phase 4 — Mid-page sections
**Files:** `AstrologerBanner.jsx`, `Rashifal.jsx`, `Panchang.jsx`, `AIJyotishSection.jsx`, `EPooja.jsx`, `CalculationSection.jsx`, `AstroShop.jsx`, `VisionarySection.jsx`, `AboutTeam.jsx`, `AppDownloadBanner.jsx`, `index.css`

1. **AstrologerBanner** — rebuild as a `--maroon-900` card with gold border top (replaces banana-yellow):
   - Photo left (rounded-lg rectangle, not a circle), content right.
   - Ivory headline, feature badges as gold-outline chips.
   - **Wire the CTAs:** "अभी कॉल करें" → `tel:+919754648985`; "चैट करें" → `https://wa.me/919754648985?text=नमस्ते`. If claims ("500+ ज्योतिषी") can't be substantiated, soften to "अनुभवी ज्योतिषी".
   - Remove the infinite pulsing shadow and the "breathing" photo animation.
2. **Rashifal (zodiac)** — replace dark AI JPEGs with uniform medallions (§2.4). Desktop: 6×2 grid of compact cards (medallion + Hindi name + English caption). Mobile: **horizontal scroll-snap row** (`scroll-snap-type: x mandatory`, 96px cards, edge fade masks) instead of 4 screens of vertical cards. Card → `/rashi-fal`.
3. **Panchang card** — remove the yellow-highlighter band; header block becomes `--saffron-50` with `--maroon-900` text. Rows: label `--ink-600` / value `--ink-900` at equal weight, `--line` separators, fix the last row being overlapped by the button (give the list `padding-bottom`). Desktop: make it `position: sticky; top: calc(var(--header-h) + 16px)` in the right column.
4. **AI Jyotish section** — keep the free-prediction form as the centerpiece (it's the best conversion asset):
   - Desktop: form 5/12, "आज का मुहूर्त" 4/12, Prashn Yantra 3/12 → change to form 6/12 + tabbed card 6/12 (tabs: मुहूर्त / प्रश्न यंत्र) so nothing is cramped.
   - Prashn Yantra: remove the Hanuman background image behind the numbers; plain `--surface` card, 40px min tap targets, saffron hover. Link the devotional image as a small header medallion instead.
   - Form: 44px min input height, visible labels (not placeholder-only), saffron focus rings, single full-width submit.
5. **CalculationSection** — fold into a compact strip of 7 chips under the AI section header "गणना उपकरण" (h2 pattern, no 🔢). Remove per-item random colors; all chips use the standard tile style, "AI अंक" gets a small gold "AI" badge instead of ⭐.
6. **E-Pooja & AstroShop carousels** — shared fix:
   - Replace cropped-at-both-edges layout with `scroll-snap-type: x mandatory`, cards `flex: 0 0 280px` (mobile: `0 0 78vw`), container `padding-inline` aligned to the page grid so the first card lines up with the section heading.
   - Arrows: 40px circular buttons *outside* the card area on desktop, hidden on mobile (swipe + partial-card peek affordance).
   - Card anatomy: image (4:3, `object-fit: cover`, `loading="lazy"`) → title (1 line ellipsis) → rating (single ★ + number, gold) → price row → full-width saffron button.
7. **Merge VisionarySection + AboutTeam** into one "हमारी टीम" section: Dr. Pandey featured card (photo, 2-line bio, credential chips) + smaller team cards in a grid (no carousel cropping). Delete the duplicated Dr. Pandey block.
8. **AppDownloadBanner** — rebuild as one `--maroon-900` → `#2A0F08` gradient card, phone mockup right (contained, never overflowing; hidden below 480px), text + store badges left. Use official App Store / Play Store badge SVGs. Remove the fake 5-star row; show "4.5 ★ on Google Play" only (verifiable). Fix the dead App Store URL — if no iOS app exists, show only the Play badge.

**Accept:** call/chat buttons actually dial/open WhatsApp; no carousel card is clipped at rest; zodiac section ≤ 1.5 screens on mobile; only one Dr. Pandey feature block; no yellow highlighter band.

### Phase 5 — Motion discipline
**Files:** all landing components

Rules (apply everywhere):
- Entrance animations: `whileInView` fade + 16px rise, 250–350ms, `once: true`, stagger ≤ 40ms, on section containers only — not on every child.
- Delete: infinite pulse/breathing loops, `rotateX` card flips, blur keyframes, scale-on-hover > 1.03.
- Hover feedback: `translateY(-2px)` + shadow step, 150ms ease-out, CSS only (no framer-motion for hovers — cheaper).
- Everything gated behind `prefers-reduced-motion` (Phase 0 kill-switch covers this).

**Accept:** no permanently-running animations anywhere on the page (verify with Performance panel: near-zero CPU when idle).

### Phase 6 — Performance, a11y, SEO
**Files:** `index.html`, assets, all components

1. Convert all landing-page images to WebP ≤ 100KB (hero/team photos ≤ 60KB, icons as SVG or ≤ 20KB WebP). Priority: `jyotish_calculator.jpg` (709KB), `vastu_calculator.png` (529KB), `astrologer.jpeg` (224KB), `ankjyotish.png` (221KB), `logo.jpg` (180KB).
2. `loading="lazy"` + explicit `width`/`height` on every below-fold `<img>`; `fetchpriority="high"` on hero image.
3. Split `index.css`: extract landing styles into `src/styles/landing.css`; long-term, per-page CSS files imported by their page components.
4. `index.html`: OG + Twitter meta tags, canonical URL, JSON-LD (`Organization` + `WebSite`), move favicon out of `/src/` into `/public/`, add both `lang="hi"` handling and a proper `<title>` per language if feasible.
5. a11y pass: `aria-label` on all icon-only buttons, `alt` review, keyboard-operable carousels (arrow keys), color-contrast check of every text/background pair against the new tokens (all body text ≥ 4.5:1).
6. Targets: Lighthouse mobile ≥ 85 perf / ≥ 95 a11y / ≥ 95 SEO.

### Phase 7 — Ratri (dark) mode
**Files:** `Header.jsx`, `index.css`, new `src/hooks/useTheme.js`

1. `useTheme` hook: reads `localStorage('jv-theme')` → falls back to `prefers-color-scheme`; sets `data-theme` on `<html>`; exposes toggle.
2. Header toggle button: sun/moon icon (aria-label "थीम बदलें"), placed next to the language pill.
3. The `[data-theme="dark"]` token block from §2.2 does the heavy lifting; then audit each section for hardcoded hexes (the astrologer banner, app banner and footer use explicit colors — convert them to tokens first).
4. Dark-mode specifics: hero zodiac-wheel SVG becomes 8% opacity gold; card borders 1px `--line` (shadows are weak on dark); images get a subtle `filter: brightness(.92)` wrapper check.
5. `<meta name="theme-color">` swaps via JS with the theme.

**Accept:** toggle persists across reloads; no unreadable text in either theme; no hardcoded cream/yellow visible in dark mode.

---

## Part 4 — Section order after redesign (final page skeleton)

1. Header (sticky)
2. **Hero** — H1 + CTAs + trust row + Panchang snapshot card
3. **Services** — 8 featured tiles + "all services" chips
4. **Talk to astrologer** banner (maroon, working CTAs)
5. **AI Jyotish** — free prediction form + tabbed Muhurat/Prashn Yantra
6. **गणना उपकरण** chip strip
7. **Rashifal** — zodiac medallions (grid / snap-row)
8. **E-Pooja** carousel
9. **AstroShop** carousel
10. **हमारी टीम** (merged)
11. **App download** banner
12. Footer (maroon, real links)

Deleted: CelebrityStrip, FloatingBooks, VisionarySection (merged), standalone Panchang column placement (Panchang lives in hero snapshot + sticky card in AI section area on desktop).

## Part 5 — Verification checklist (run after every phase)

- [ ] `node ui-review/screenshot.mjs` → compare `ui-review/shots/` before/after
- [ ] 390px and 1440px: nothing clipped, no horizontal scroll
- [ ] All CTAs navigate/dial/open WhatsApp
- [ ] Keyboard: tab through the page, visible focus everywhere
- [ ] Both languages (हिं/EN) render correctly in every section
- [ ] `npm run build` passes; no console errors

---

## Part 6 — "Outstanding" polish layer (elegant · minimal · Granthalaya-grade)

> Rationale: the Books section (`src/styles/book.css`, `src/components/book/`) is already the
> best-designed part of the product — a token-driven "manuscript" system (parchment surfaces,
> warm ink, saffron/gold accents, serif Devanagari display type, 3D covers, skeletons, designed
> empty states). The fastest path to a premium app-wide feel is to **promote that language**,
> not to invent a parallel one. This part extends — and where noted, overrides — earlier phases.

### 6.1 Unify tokens with the Granthalaya system (amends §2.2)

1. Reconcile the §2.2 tokens with the `bk-` tokens in `book.css` into ONE source of truth:
   - Surfaces: prefer the books' parchment family (`#F7F1E4` page / `#FFFDF8` card) over §2.2's
     `--ivory: #FBF6EC` — pick one warm neutral ramp and use it everywhere (books pages included).
   - Accents: converge saffron (`--bk-saffron: #D97706` vs `--saffron-600: #E85822`) and gold
     (`--bk-gold: #B08419` vs `--gold-500: #C99B2F`) — choose one value per role, alias the other.
   - Shadows: adopt the books' **warm brown-tinted** shadows app-wide (never neutral black on cream).
2. Define one global easing token and use it for every transition:
   `--ease: cubic-bezier(.22, 1, .36, 1);` (already the books' signature curve).
3. Typography (amends §2.3): the books already load `Noto Serif Devanagari` / `Tiro Devanagari
   Sanskrit` / `Spectral` / `Inter`. Standardize app-wide on **Noto Serif Devanagari (display)
   + Mukta or Inter (UI/body)** so Books and the rest of the site share one type system; retire
   Laila everywhere at the end of the migration.

### 6.2 Promote book components into an app-wide UI kit

Create `src/components/ui/` by generalizing (not duplicating) what already exists in
`src/components/book/`:

| Component | Source | Used by |
|---|---|---|
| `SectionHeader` (gold-flanked eyebrow + display h2 + optional "सभी देखें →") | `BookChrome.jsx` eyebrow pattern | every landing section (replaces §3 Phase 3.4) |
| `Flourish` divider | `BookChrome.jsx` | between major landing sections, footer top |
| `Button` (pill; `primary` saffron-gradient / `ghost` / sizes) | `.bk-btn` | all CTAs app-wide |
| `Skeleton`, `EmptyState`, `ErrorState` | `States.jsx` | every data-driven section/page |
| `Toast` (new) | — | replaces every `alert()` (login errors, coming-soon) |

### 6.3 Perceived performance: skeletons everywhere

Every section/page that fetches data (Panchang card & page, Rashifal, AstroShop, E-Pooja, AI
Jyotish results) renders a **layout-matched skeleton** (shimmer, `--ease`, correct final
dimensions → zero layout shift). No spinners anywhere. Books already does this — copy the pattern.

### 6.4 Route transitions & scroll behavior

1. Wrap routes in `AnimatePresence`: 150ms opacity crossfade on route change (no slide, no scale).
2. Scroll restoration: new route → top; back/forward → restore position.
3. Reader-style progress affordances where content is long (e.g. thin saffron scroll-progress bar
   on article/kosh/book-reader pages only — not on the landing page).

### 6.5 Universal search (⌘K + header search icon)

A single overlay (portal, `--z-modal`) searching across: services (name/route), book titles,
kosh entries, calculators. Simple client-side fuzzy filter over a static index is enough for v1.
- Trigger: header search icon (mobile) / `⌘K` / `Ctrl+K` (desktop shows the shortcut hint).
- Anatomy: centered 560px panel, parchment surface, large input, grouped results with the
  duotone icons from §2.4, keyboard navigable (↑↓ + Enter), `Esc` closes.
- This is the highest-impact "modern product" signal on the list — prioritize right after Phase 4.

### 6.6 Micro-craft details (cheap, high signal)

1. `::selection { background: var(--saffron-100); color: var(--maroon-900); }`
2. Thin custom scrollbar (6px, `--line` thumb, transparent track) on desktop only.
3. `font-variant-numeric: tabular-nums` on all timing/price/number displays (panchang rows,
   muhurat times, shop prices) so columns don't wobble.
4. Interactive-state audit: every clickable element has distinct hover / active (pressed,
   `translateY(0)` + shadow-sm) / focus-visible states. No `cursor: pointer` on non-interactive divs.
5. Real favicon set (SVG + PNG fallbacks in `/public/`), OG image (1200×630 with logo on
   parchment), per-page `<title>`.
6. Designed 404 page: mandala line-art (reuse `Icons.jsx` `Mandala`), display-font "पृष्ठ नहीं मिला",
   one button home.
7. Light-sweep hover (books' `.bk-vol-shine`) reserved for **featured cards only** (hero Panchang
   snapshot, featured service tiles, shop product cards). Pointer-tilt reserved for the hero card.
   Everywhere else: the standard `translateY(-2px)` + shadow step. Restraint is the aesthetic.

### 6.7 Minimalism by subtraction (governing rules)

- Landing page: **max 7 sections** after the merge in Part 4 (combine E-Pooja + AstroShop into one
  "शॉप और सेवाएं" tabbed section if needed to hit the cap).
- One primary CTA per section; everything else is ghost/text style.
- Between-section spacing: always `--s-9` (96px) desktop / `--s-8` mobile — generous, uniform.
- No section may introduce a color outside the token set. No gradient text anywhere
  (remove the `#FF6B35 → #F7931E` clipped-text headings on PanchangPage and elsewhere).
- Hygiene: fix the duplicate translation keys Vite warns about in `src/pages/PanchangPage.jsx`
  (`dinman`, `ratriman`, `suryaRashi`, `chandraRashi` defined twice); long-term, hoist page
  translations into a shared `src/i18n/` module instead of per-page object literals.

**Accept (Part 6):** one token file drives Books AND the rest of the app; every data section
shows a skeleton before content; ⌘K opens search from any page; no `alert()` calls remain in
`src/`; no gradient text remains; route changes crossfade without scroll jumps.
