import React from 'react'
import Header from '../Header'
import ServicesStrip from '../ServicesStrip'
import Footer from '../Footer'
import { IconCheck, IconX } from '../ui/Icons'

/* Shared pieces of the practice section. Everything here is presentational —
   scoring and answer keys only ever come from the server. */

export const LETTERS = ['क', 'ख', 'ग', 'घ', 'ङ', 'च']

/** Seconds as m:ss, or h:mm:ss once a session runs past an hour. */
export const formatTime = (seconds = 0) => {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export const QuizShell = ({ language, setLanguage, strip = true, children }) => (
  <>
    <Header language={language} setLanguage={setLanguage} />
    {strip && <ServicesStrip language={language} activeService="quiz" />}
    <main id="main" className={`qz-page${strip ? '' : ' qz-page--solo'}`}>
      <div className="u-shell">{children}</div>
    </main>
    <Footer language={language} />
  </>
)

/**
 * The answer list. Passing `correct` switches it from a picker to a marked-up
 * result — which is the same thing the review screens need, so they share it.
 */
export const QuizOptions = ({ options = [], selected = [], correct = null, onPick, multi = false }) => {
  const revealed = Array.isArray(correct)

  return (
    <div className="qz-opts" role={multi ? 'group' : 'radiogroup'}>
      {options.map((option, i) => {
        const picked = selected.includes(option.key)
        const right = revealed && correct.includes(option.key)
        const wrong = revealed && picked && !right

        const className = [
          'qz-opt',
          picked && !revealed ? 'is-picked' : '',
          right ? 'is-right' : '',
          wrong ? 'is-wrong' : '',
        ].filter(Boolean).join(' ')

        return (
          <button
            key={option.key}
            type="button"
            className={className}
            disabled={revealed || !onPick}
            onClick={() => onPick?.(option.key)}
            aria-pressed={picked}
          >
            <span className="qz-opt__key">
              {right ? <IconCheck s={13} /> : wrong ? <IconX s={13} /> : LETTERS[i] || i + 1}
            </span>
            <span>{option.text}</span>
          </button>
        )
      })}
    </div>
  )
}

/** A question rendered read-only with its outcome — used by review and bookmarks. */
export const QuizQuestion = ({ item, hi, seq, action }) => (
  <article className="qz-q">
    {seq && <span className="qz-review__seq">{seq}</span>}

    <div className="qz-q__head">
      <div
        className="qz-q__body"
        dangerouslySetInnerHTML={{ __html: item.question_html || '' }}
      />
      {action}
    </div>

    {item.image && <img src={item.image} alt="" className="qz-q__img" loading="lazy" />}

    <QuizOptions
      options={item.options}
      selected={item.selected || []}
      correct={item.correct_answers || []}
    />

    {item.answered === false && (
      <p className="qz-verdict qz-verdict--wrong">{hi ? 'छोड़ा गया' : 'Skipped'}</p>
    )}

    {item.explanation && (
      <div className="qz-explain">
        <span className="qz-explain__title">{hi ? 'व्याख्या' : 'Explanation'}</span>
        <div dangerouslySetInnerHTML={{ __html: item.explanation }} />
      </div>
    )}
  </article>
)
