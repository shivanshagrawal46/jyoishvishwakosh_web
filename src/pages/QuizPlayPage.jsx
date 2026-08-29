import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { QuizOptions, QuizShell, formatTime } from '../components/quiz'
import { Button } from '../components/ui'
import { IconBookmark, IconCheck, IconClock, IconX } from '../components/ui/Icons'
import { answerQuizQuestion, setQuizBookmark, submitQuiz } from '../services/quizApi'
import { useToast } from '../components/ui/Toast'
import useQuizIdentity from '../hooks/useQuizIdentity'

const EASE = [0.22, 1, 0.36, 1]

/**
 * One quiz session.
 *
 * The attempt arrives in router state from `useStartQuiz` — it holds the
 * shuffled questions and there is no endpoint to fetch them again, so a reload
 * sends the visitor back to pick a set rather than showing an empty shell.
 */
const QuizPlayPage = ({ language, setLanguage }) => {
  const hi = language === 'hindi'
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { userId } = useQuizIdentity()

  const attempt = location.state?.attempt
  const questions = attempt?.questions || []

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const [bookmarked, setBookmarked] = useState(() => new Set())
  const [elapsed, setElapsed] = useState(0)

  // Answers the server has not seen yet. In practice mode each answer is sent
  // as it is checked, so only skipped questions collect here; in test mode
  // everything does and goes up in one payload at the end.
  const unsent = useRef([])
  const questionStart = useRef(Date.now())
  const sessionStart = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.round((Date.now() - sessionStart.current) / 1000)),
      1000
    )
    return () => clearInterval(id)
  }, [])

  const question = questions[index]
  const isLast = index === questions.length - 1
  const practice = attempt?.mode !== 'test'
  const revealed = Boolean(feedback)

  const secondsHere = () => Math.round((Date.now() - questionStart.current) / 1000)

  const advance = useCallback(() => {
    setIndex((i) => i + 1)
    setSelected([])
    setFeedback(null)
    questionStart.current = Date.now()
  }, [])

  const finish = useCallback(async (pendingAnswers) => {
    setBusy(true)
    try {
      const result = await submitQuiz({
        attempt_id: attempt.attempt_id,
        answers: pendingAnswers,
        time_taken_sec: Math.round((Date.now() - sessionStart.current) / 1000),
      })

      // Submitting returns the scorecard but not which set it came from — only
      // re-fetching the attempt does. Carrying it across from the session saves
      // that round trip and keeps "practise again" on the scorecard.
      navigate(`/quiz/review/${attempt.attempt_id}`, {
        state: {
          result: {
            ...result,
            set: result.set || attempt.set,
            category: result.category || attempt.category,
          },
        },
        replace: true,
      })
    } catch {
      setBusy(false)
      toast.error(hi ? 'परिणाम सहेजा नहीं जा सका' : 'Could not save your result')
    }
  }, [attempt, hi, navigate, toast])

  const pick = (key) => {
    if (revealed) return
    setSelected((current) => {
      if (!question.multi_select) return [key]
      return current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    })
  }

  const check = async () => {
    setBusy(true)
    try {
      const result = await answerQuizQuestion({
        attempt_id: attempt.attempt_id,
        question_id: question.question_id,
        selected,
        time_taken_sec: secondsHere(),
      })
      setFeedback(result)
    } catch {
      toast.error(hi ? 'उत्तर सहेजा नहीं जा सका' : 'Could not save that answer')
    } finally {
      setBusy(false)
    }
  }

  /** Test mode, and skipping in either mode: record locally and move on. */
  const recordAndGo = (answer) => {
    const pendingAnswers = [...unsent.current, {
      question_id: question.question_id,
      selected: answer,
      time_taken_sec: secondsHere(),
    }]
    unsent.current = pendingAnswers
    if (isLast) finish(pendingAnswers)
    else advance()
  }

  const toggleBookmark = async () => {
    const id = question.question_id
    const next = !bookmarked.has(id)
    setBookmarked((set) => {
      const copy = new Set(set)
      if (next) copy.add(id); else copy.delete(id)
      return copy
    })
    try {
      await setQuizBookmark({ userId, questionId: id, bookmarked: next })
    } catch {
      toast.error(hi ? 'सहेजा नहीं जा सका' : 'Could not save that question')
    }
  }

  if (!attempt || questions.length === 0) return <Navigate to="/quiz" replace />

  const title = attempt.set?.name || attempt.category?.name
    || (hi ? 'मिश्रित अभ्यास' : 'Mixed practice')

  return (
    <QuizShell language={language} setLanguage={setLanguage} strip={false}>
      <div className="qz-play">
        <div className="qz-play__bar">
          <span className="qz-play__count">
            {hi
              ? `प्रश्न ${index + 1} / ${questions.length}`
              : `Question ${index + 1} of ${questions.length}`}
          </span>
          <span className="qz-play__timer"><IconClock s={13} />{formatTime(elapsed)}</span>
        </div>

        <div className="qz-bar" style={{ marginBottom: 'var(--s-5)' }}>
          <span
            className="qz-bar__fill"
            style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={index}
            className="qz-q"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .25, ease: EASE }}
          >
            <div className="qz-q__head">
              <div
                className="qz-q__body"
                dangerouslySetInnerHTML={{ __html: question.question_html || '' }}
              />
              <button
                type="button"
                className={`qz-mark${bookmarked.has(question.question_id) ? ' is-on' : ''}`}
                onClick={toggleBookmark}
                aria-label={hi ? 'प्रश्न सहेजें' : 'Save this question'}
                aria-pressed={bookmarked.has(question.question_id)}
              >
                <IconBookmark s={17} filled={bookmarked.has(question.question_id)} />
              </button>
            </div>

            {question.image && <img src={question.image} alt="" className="qz-q__img" />}

            {question.multi_select && (
              <p className="qz-set__meta">
                {hi ? 'एक से अधिक उत्तर सही हो सकते हैं' : 'More than one answer may be correct'}
              </p>
            )}

            <QuizOptions
              options={question.options}
              selected={selected}
              correct={feedback?.correct_answers || null}
              onPick={pick}
              multi={question.multi_select}
            />

            {revealed && (
              <>
                <p className={`qz-verdict qz-verdict--${feedback.is_correct ? 'right' : 'wrong'}`}>
                  {feedback.is_correct ? <IconCheck s={17} /> : <IconX s={17} />}
                  {feedback.is_correct
                    ? (hi ? 'सही उत्तर' : 'Correct')
                    : (hi ? 'गलत उत्तर' : 'Not quite')}
                </p>

                {feedback.explanation && (
                  <div className="qz-explain">
                    <span className="qz-explain__title">{hi ? 'व्याख्या' : 'Explanation'}</span>
                    <div dangerouslySetInnerHTML={{ __html: feedback.explanation }} />
                  </div>
                )}
              </>
            )}
          </motion.article>
        </AnimatePresence>

        <div className="qz-play__foot">
          {!revealed && (
            <Button variant="ghost" onClick={() => recordAndGo([])} disabled={busy}>
              {hi ? 'छोड़ें' : 'Skip'}
            </Button>
          )}

          {practice && !revealed ? (
            <Button onClick={check} disabled={busy || selected.length === 0}>
              {hi ? 'उत्तर जांचें' : 'Check answer'}
            </Button>
          ) : (
            <Button
              onClick={() => (revealed
                ? (isLast ? finish(unsent.current) : advance())
                : recordAndGo(selected))}
              disabled={busy || (!revealed && selected.length === 0)}
            >
              {isLast
                ? (hi ? 'परिणाम देखें' : 'See result')
                : (hi ? 'अगला प्रश्न' : 'Next question')}
            </Button>
          )}
        </div>
      </div>
    </QuizShell>
  )
}

export default QuizPlayPage
