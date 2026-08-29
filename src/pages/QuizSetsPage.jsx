import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuizShell } from '../components/quiz'
import { Button, EmptyState, ErrorState, SectionHeader, Skeleton } from '../components/ui'
import { IconChevronLeft, IconLock, IconSparkle, IconStar } from '../components/ui/Icons'
import { fetchQuizSets } from '../services/quizApi'
import useQuizIdentity from '../hooks/useQuizIdentity'
import useStartQuiz from '../hooks/useStartQuiz'

const QuizSetsPage = ({ language, setLanguage }) => {
  const hi = language === 'hindi'
  const { categoryId } = useParams()
  const { userId, email } = useQuizIdentity()
  const { start, pending } = useStartQuiz(language)

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('practice')

  const load = useCallback(async () => {
    setError(null)
    setData(null)
    try {
      setData(await fetchQuizSets(categoryId, { userId, email }))
    } catch (err) {
      setError(err)
      setData({ category: null, sets: [] })
    }
  }, [categoryId, email, userId])

  useEffect(() => { load() }, [load])

  const sets = data?.sets || []
  const unlocked = sets.filter((s) => !s.locked)

  return (
    <QuizShell language={language} setLanguage={setLanguage}>
      <Link to="/quiz" className="qz-back">
        <IconChevronLeft s={15} />
        {hi ? 'सभी विषय' : 'All subjects'}
      </Link>

      <SectionHeader
        eyebrow={hi ? 'विषय' : 'Subject'}
        title={data?.category?.name || (hi ? 'प्रश्न सेट' : 'Quiz sets')}
        subtitle={data?.category?.introduction || (hi
          ? 'कोई एक सेट चुनें, या पूरे विषय का मिश्रित अभ्यास करें।'
          : 'Choose a set, or take a mixed quiz across the whole subject.')}
        language={language}
      />

      {sets.length > 0 && (
        <div className="qz-toolbar">
          <Button
            onClick={() => start({ category_id: Number(categoryId), mode, question_count: 20 }, 'mixed')}
            disabled={pending === 'mixed' || unlocked.length === 0}
          >
            <IconSparkle s={16} />
            {hi ? 'मिश्रित अभ्यास' : 'Mixed quiz'}
          </Button>

          <span className="qz-toolbar__spacer" />

          <div className="qz-seg" role="group" aria-label={hi ? 'अभ्यास प्रकार' : 'Quiz mode'}>
            <button
              type="button"
              className={mode === 'practice' ? 'is-on' : ''}
              aria-pressed={mode === 'practice'}
              onClick={() => setMode('practice')}
            >
              {hi ? 'अभ्यास' : 'Practice'}
            </button>
            <button
              type="button"
              className={mode === 'test' ? 'is-on' : ''}
              aria-pressed={mode === 'test'}
              onClick={() => setMode('test')}
            >
              {hi ? 'परीक्षा' : 'Test'}
            </button>
          </div>
        </div>
      )}

      {data === null && (
        <div className="qz-sets">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="qz-set"><Skeleton h={38} r="var(--r-sm)" style={{ flex: 1 }} /></div>
          ))}
        </div>
      )}

      {error && (
        <ErrorState
          title={hi ? 'सेट लोड नहीं हो सके' : 'Could not load these sets'}
          body={hi ? 'कृपया थोड़ी देर बाद प्रयास करें।' : 'Please try again in a little while.'}
          action={<Button variant="ghost" onClick={load}>{hi ? 'पुनः प्रयास' : 'Try again'}</Button>}
        />
      )}

      {data && !error && sets.length === 0 && (
        <EmptyState
          title={hi ? 'इस विषय में अभी कोई सेट नहीं' : 'No sets in this subject yet'}
          body={hi ? 'जल्द ही प्रश्न जोड़े जाएंगे।' : 'Questions are on their way.'}
        />
      )}

      {sets.length > 0 && (
        <div className="qz-sets">
          {sets.map((set, i) => {
            const best = set.user_stats?.best_percent
            return (
              <div key={set.id} className="qz-set">
                <span className="qz-set__num" aria-hidden="true">{i + 1}</span>

                <span className="qz-set__text">
                  <span className="qz-set__name">{set.name}</span>
                  <span className="qz-set__meta">
                    <span>{hi ? `${set.question_count} प्रश्न` : `${set.question_count} questions`}</span>
                    {best !== undefined && best !== null && (
                      <span className="qz-badge qz-badge--good">
                        <IconStar s={11} />
                        {hi ? `सर्वश्रेष्ठ ${best}%` : `Best ${best}%`}
                      </span>
                    )}
                    {set.locked && (
                      <span className="qz-badge qz-badge--lock">
                        <IconLock s={11} />₹{set.amount}
                      </span>
                    )}
                  </span>
                </span>

                <Button
                  variant={set.locked ? 'ghost' : 'primary'}
                  size="sm"
                  onClick={() => start({ set_id: set.id, mode }, `set-${set.id}`)}
                  disabled={pending === `set-${set.id}`}
                >
                  {set.locked
                    ? (hi ? 'खोलें' : 'Unlock')
                    : set.user_stats?.attempts
                      ? (hi ? 'फिर से' : 'Again')
                      : (hi ? 'शुरू करें' : 'Start')}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </QuizShell>
  )
}

export default QuizSetsPage
