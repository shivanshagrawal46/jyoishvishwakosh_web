import React, { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { QuizQuestion, QuizShell, formatTime } from '../components/quiz'
import { Button, ErrorState, SectionHeader, Skeleton } from '../components/ui'
import { IconChevronLeft, IconRefresh } from '../components/ui/Icons'
import { fetchQuizAttempt } from '../services/quizApi'
import useStartQuiz from '../hooks/useStartQuiz'

const RADIUS = 58
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ScoreRing = ({ percent, score, total }) => (
  <div className="qz-ring">
    <svg viewBox="0 0 132 132" aria-hidden="true">
      <circle cx="66" cy="66" r={RADIUS} fill="none" stroke="var(--sunken)" strokeWidth="8" />
      <circle
        cx="66" cy="66" r={RADIUS}
        fill="none"
        stroke="var(--saffron)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(100, percent) / 100)}
      />
    </svg>
    <span>
      <span className="qz-ring__num">{percent}%</span>
      <span className="qz-ring__of">{score}/{total}</span>
    </span>
  </div>
)

/** How the score is put to the visitor — encouraging, never scolding. */
const verdict = (percent, hi) => {
  if (percent >= 80) return hi ? 'उत्तम अभ्यास!' : 'Excellent work'
  if (percent >= 60) return hi ? 'अच्छा प्रयास' : 'Good going'
  if (percent >= 40) return hi ? 'अभ्यास जारी रखें' : 'Keep practising'
  return hi ? 'फिर से पढ़ें और दोहराएं' : 'Worth another read'
}

const QuizReviewPage = ({ language, setLanguage }) => {
  const hi = language === 'hindi'
  const { attemptId } = useParams()
  const location = useLocation()
  const { start, pending } = useStartQuiz(language)

  // Arriving straight from a submitted session, the scorecard is already in
  // hand — refetching it would be a round trip for the same bytes.
  const [result, setResult] = useState(location.state?.result || null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (location.state?.result) return
    setError(null)
    try {
      setResult(await fetchQuizAttempt(attemptId))
    } catch (err) {
      setError(err)
    }
  }, [attemptId, location.state])

  useEffect(() => { load() }, [load])

  if (error) {
    return (
      <QuizShell language={language} setLanguage={setLanguage}>
        <ErrorState
          title={hi ? 'परिणाम नहीं मिला' : 'Result not found'}
          body={hi ? 'यह अभ्यास उपलब्ध नहीं है।' : 'This attempt is no longer available.'}
          action={<Button variant="ghost" to="/quiz">{hi ? 'अभ्यास पर लौटें' : 'Back to practice'}</Button>}
        />
      </QuizShell>
    )
  }

  if (!result) {
    return (
      <QuizShell language={language} setLanguage={setLanguage}>
        <Skeleton h={320} r="var(--r-lg)" />
      </QuizShell>
    )
  }

  const setId = result.set?.id
  const title = result.set?.name || result.category?.name || (hi ? 'मिश्रित अभ्यास' : 'Mixed practice')

  return (
    <QuizShell language={language} setLanguage={setLanguage}>
      <Link to="/quiz" className="qz-back">
        <IconChevronLeft s={15} />
        {hi ? 'अभ्यास' : 'Practice'}
      </Link>

      <div className="qz-card">
        <ScoreRing percent={result.percent} score={result.score} total={result.total} />

        <h1 className="qz-card__title">{verdict(result.percent, hi)}</h1>
        <p className="qz-card__sub">{title}</p>

        <div className="qz-tally">
          <div>
            <b>{result.correct}</b>
            <span>{hi ? 'सही' : 'Correct'}</span>
          </div>
          <div>
            <b>{result.wrong}</b>
            <span>{hi ? 'गलत' : 'Wrong'}</span>
          </div>
          <div>
            <b>{result.skipped}</b>
            <span>{hi ? 'छोड़े' : 'Skipped'}</span>
          </div>
          <div>
            <b>{formatTime(result.time_taken_sec)}</b>
            <span>{hi ? 'समय' : 'Time'}</span>
          </div>
        </div>

        <div className="qz-card__actions">
          {setId && (
            <Button
              onClick={() => start({ set_id: setId }, 'retry')}
              disabled={pending === 'retry'}
            >
              <IconRefresh s={16} />
              {hi ? 'फिर से अभ्यास करें' : 'Practise again'}
            </Button>
          )}
          <Button variant="ghost" to="/quiz">{hi ? 'अन्य विषय' : 'Other subjects'}</Button>
        </div>
      </div>

      {result.review?.length > 0 && (
        <section className="qz-more">
          <SectionHeader
            title={hi ? 'उत्तर और व्याख्या' : 'Answers and explanations'}
            as="h2"
            language={language}
          />
          <div className="qz-review">
            {result.review.map((item) => (
              <QuizQuestion
                key={item.question_id}
                item={item}
                hi={hi}
                seq={hi ? `प्रश्न ${item.sequence}` : `Question ${item.sequence}`}
              />
            ))}
          </div>
        </section>
      )}
    </QuizShell>
  )
}

export default QuizReviewPage
