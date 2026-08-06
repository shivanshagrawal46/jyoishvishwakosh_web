import React from 'react'
import { motion } from 'framer-motion'
import { SIZE_STEPS, LEADING_STEPS, MEASURE_STEPS, THEMES } from './bookUtils'
import { IconCheck } from './Icons'

const THEME_SWATCH = {
  parchment: { bg: 'linear-gradient(140deg,#F7F1E4,#EFE6D2)', fg: '#5A4526' },
  light: { bg: 'linear-gradient(140deg,#FFFFFF,#EEF0F3)', fg: '#3C424B' },
  sepia: { bg: 'linear-gradient(140deg,#F3E9D5,#E0CFAB)', fg: '#6B5636' },
  dark: { bg: 'linear-gradient(140deg,#2A2521,#15120F)', fg: '#E3D3B4' },
}

const SIZE_LABELS = ['A', 'A', 'A', 'A', 'A']
const SIZE_SCALE = [0.78, 0.9, 1, 1.12, 1.26]

/**
 * Typography and theme controls. Values are indices into the scales exported by
 * bookUtils, which the reader turns into CSS custom properties.
 */
const ReaderPrefs = ({ prefs, setPrefs, t, language }) => {
  const set = (patch) => setPrefs((prev) => ({ ...prev, ...patch }))

  const stepGroup = (label, value, count, onPick, render, current) => (
    <div className="bk-pref-row">
      <span className="bk-pref-label">
        {label}
        {current !== undefined && <b>{current}</b>}
      </span>
      <div className="bk-steps">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`bk-step${value === i ? ' is-on' : ''}`}
            onClick={() => onPick(i)}
            aria-pressed={value === i}
          >
            {value === i && (
              <motion.span
                className="bk-step-bg"
                layoutId={`bk-step-${label}`}
                transition={{ type: 'spring', stiffness: 440, damping: 34 }}
              />
            )}
            {render(i)}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div
      className="bk-prefs"
      role="dialog"
      aria-label={t('typography')}
      initial={{ opacity: 0, scale: 0.94, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {stepGroup(
        t('fontSize'),
        prefs.size,
        SIZE_STEPS.length,
        (i) => set({ size: i }),
        (i) => <span style={{ fontSize: `${SIZE_SCALE[i]}rem`, lineHeight: 1 }}>{SIZE_LABELS[i]}</span>
      )}

      {stepGroup(
        t('lineHeight'),
        prefs.leading,
        LEADING_STEPS.length,
        (i) => set({ leading: i }),
        (i) => (
          <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
            {[0, 1, 2].map((row) => (
              <rect
                key={row}
                x="1"
                y={2.5 + row * (2 + i * 1.9)}
                width="16"
                height="1.6"
                rx=".8"
                fill="currentColor"
                opacity={0.85}
              />
            ))}
          </svg>
        )
      )}

      {stepGroup(
        t('width'),
        prefs.measure,
        MEASURE_STEPS.length,
        (i) => set({ measure: i }),
        (i) => (
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <rect x={7 - i * 3} y="1" width={6 + i * 6} height="12" rx="1.6"
              fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )
      )}

      <div className="bk-pref-row">
        <span className="bk-pref-label">{t('theme')}</span>
        <div className="bk-themes">
          {THEMES.map((name) => {
            const swatch = THEME_SWATCH[name]
            const on = prefs.theme === name
            return (
              <button
                key={name}
                type="button"
                className={`bk-theme${on ? ' is-on' : ''}`}
                onClick={() => set({ theme: name })}
                aria-pressed={on}
              >
                <span className="bk-theme-dot" style={{ background: swatch.bg, color: swatch.fg }}>
                  {on ? <IconCheck s={13} /> : 'अ'}
                </span>
                {t(`theme${name.charAt(0).toUpperCase()}${name.slice(1)}`)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bk-pref-row">
        <span className="bk-pref-label">{t('justify')}</span>
        <div className="bk-steps">
          {[
            { value: false, label: language === 'english' ? 'Ragged' : 'सामान्य' },
            { value: true, label: language === 'english' ? 'Justified' : 'समान' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`bk-step bk-step-deva${prefs.justify === opt.value ? ' is-on' : ''}`}
              onClick={() => set({ justify: opt.value })}
              aria-pressed={prefs.justify === opt.value}
            >
              {prefs.justify === opt.value && (
                <motion.span
                  className="bk-step-bg"
                  layoutId="bk-step-justify"
                  transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ReaderPrefs
