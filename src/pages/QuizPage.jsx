import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QuizShell, formatTime } from '../components/quiz'
import { Button, EmptyState, ErrorState, SectionHeader, Skeleton } from '../components/ui'
import {
  IconArrowRight, IconBookmark, IconClock, IconFlame, IconRefresh, IconTarget,
} from '../components/ui/Icons'
import { fetchQuizAttempts, fetchQuizCategories, fetchQuizStats } from '../services/quizApi'
import useQuizIdentity from '../hooks/useQuizIdentity'
import useStartQuiz from '../hooks/useStartQuiz'

const EASE = [0.22, 1, 0.36, 1]

const Stat = ({ icon, value, label }) => (
  <div className="qz-stat">
    <span className="qz-stat__value">{icon}{value}</span>
    <span className="qz-stat__label">{label}</span>
  </div>
)

const CategoryCard = ({ category, hi, index }) => {
  const progress = category.progress

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35, ease: EASE, delay: Math.min(index * .04, .3) }}
    >
      <Link to={`/quiz/${category.id}`} className="qz-cat">
        <div className="qz-cat__top">
          <span className="qz-cat__mark" aria-hidden="true">
            {(category.name || '?').trim().charAt(0)}
          </span>
          <span>
            <span className="qz-cat__name">{category.name}</span>
            <span className="qz-cat__meta">
              {hi
                ? `${category.set_count} सेट · ${category.question_count} प्रश्न`
                : `${category.set_count} sets · ${category.question_count} questions`}
            </span>
          </span>
        </div>

        {progress?.answered > 0 && (
          <div className="qz-cat__progress">
            <div className="qz-bar__label">
              <span>{hi ? 'सटीकता' : 'Accuracy'}</span>
              <span>{Math.round(progress.accuracy)}%</span>
            </div>
            <div className="qz-bar">
              <span className="qz-bar__fill" style={{ width: `${Math.min(100, progress.accuracy)}%` }} />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

const QuizPage = ({ language, setLanguage }) => {
  const hi = language === 'hindi'
  const { userId } = useQuizIdentity()
  const { start, pending } = useStartQuiz(language)

  const [categories, setCategories] = useState(null)
  const [stats, setStats] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setCategories(null)

    // Progress and history are extras: a failure there should not cost the
    // visitor the subject list, which is the point of the page.
    const [subjects, progress, history] = await Promise.allSettled([
      fetchQuizCategories(userId),
      fetchQuizStats(userId),
      fetchQuizAttempts({ userId, limit: 5 }),
    ])

    if (subjects.status === 'fulfilled') setCategories(subjects.value)
    else { setCategories([]); setError(subjects.reason) }

    setStats(progress.status === 'fulfilled' ? progress.value : null)
    setAttempts(history.status === 'fulfilled' ? history.value.attempts : [])
  }, [userId])

  useEffect(() => { load() }, [load])

  const totals = stats?.totals
  const counts = stats?.counts
  const played = totals?.attempts > 0

  return (
    <QuizShell language={language} setLanguage={setLanguage}>
      <SectionHeader
        eyebrow={hi ? 'अभ्यास' : 'Practice'}
        title={hi ? 'ज्योतिष प्रश्नोत्तरी' : 'Astrology quiz'}
        subtitle={hi
          ? 'विषय चुनें, अभ्यास करें और अपनी प्रगति देखें।'
          : 'Pick a subject, practise at your own pace and watch your accuracy climb.'}
        language={language}
      />

      {played && (
        <div className="qz-stats">
          <Stat
            icon={<IconTarget s={17} />}
            value={`${Math.round(totals.accuracy)}%`}
            label={hi ? 'सटीकता' : 'Accuracy'}
          />
          <Stat
            icon={<IconFlame s={17} />}
            value={stats.streak_days}
            label={hi ? 'दिन की लय' : 'Day streak'}
          />
          <Stat
            value={totals.answered}
            label={hi ? 'हल किए प्रश्न' : 'Questions done'}
          />
          <Stat
            icon={<IconClock s={16} />}
            value={formatTime(totals.time_spent_sec)}
            label={hi ? 'अभ्यास समय' : 'Time practised'}
          />
        </div>
      )}

      {(counts?.wrong_available > 0 || counts?.bookmarked > 0) && (
        <div className="qz-revise">
          {counts.wrong_available > 0 && (
            <Button
              variant="ghost"
              onClick={() => start({ source: 'wrong', question_count: 20 }, 'wrong')}
              disabled={pending === 'wrong'}
            >
              <IconRefresh s={16} />
              {hi
                ? `${counts.wrong_available} गलत प्रश्न दोहराएं`
                : `Revise ${counts.wrong_available} wrong answers`}
            </Button>
          )}
          {counts.bookmarked > 0 && (
            <Button variant="ghost" to="/quiz/bookmarks">
              <IconBookmark s={16} />
              {hi
                ? `${counts.bookmarked} सहेजे प्रश्न`
                : `${counts.bookmarked} saved questions`}
            </Button>
          )}
        </div>
      )}

      {categories === null && (
        <div className="qz-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} h={132} r="var(--r-md)" />
          ))}
        </div>
      )}

      {categories !== null && error && (
        <ErrorState
          title={hi ? 'अभ्यास अभी उपलब्ध नहीं' : 'Practice is not available yet'}
          body={hi
            ? 'प्रश्नोत्तरी सेवा से संपर्क नहीं हो सका। कृपया थोड़ी देर बाद देखें।'
            : 'We could not reach the quiz service. Please try again in a little while.'}
          action={<Button variant="ghost" onClick={load}>{hi ? 'पुनः प्रयास' : 'Try again'}</Button>}
        />
      )}

      {categories !== null && !error && categories.length === 0 && (
        <EmptyState
          title={hi ? 'अभी कोई विषय नहीं' : 'No subjects yet'}
          body={hi ? 'जल्द ही प्रश्न जोड़े जाएंगे।' : 'Questions are on their way.'}
        />
      )}

      {categories?.length > 0 && (
        <div className="qz-grid">
          {categories.map((category, i) => (
            <CategoryCard key={category.id} category={category} hi={hi} index={i} />
          ))}
        </div>
      )}

      {attempts.length > 0 && (
        <section className="qz-more">
          <SectionHeader
            title={hi ? 'हाल का अभ्यास' : 'Recent attempts'}
            as="h3"
            language={language}
          />
          <div className="qz-sets">
            {attempts.map((attempt) => (
              <Link
                key={attempt.attempt_id}
                to={`/quiz/review/${attempt.attempt_id}`}
                className="qz-hist"
              >
                <span className="qz-hist__score">{attempt.percent}%</span>
                <span className="qz-hist__text">
                  <span className="qz-hist__name">
                    {attempt.set?.name || attempt.category?.name || (hi ? 'मिश्रित अभ्यास' : 'Mixed practice')}
                  </span>
                  <span className="qz-hist__meta">
                    {hi
                      ? `${attempt.score}/${attempt.total} सही · ${formatTime(attempt.time_taken_sec)}`
                      : `${attempt.score}/${attempt.total} correct · ${formatTime(attempt.time_taken_sec)}`}
                  </span>
                </span>
                <IconArrowRight s={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </QuizShell>
  )
}

export default QuizPage
