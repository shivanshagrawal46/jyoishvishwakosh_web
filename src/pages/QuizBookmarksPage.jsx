import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QuizQuestion, QuizShell } from '../components/quiz'
import { Button, EmptyState, ErrorState, SectionHeader, Skeleton } from '../components/ui'
import { IconBookmark, IconChevronLeft, IconRefresh } from '../components/ui/Icons'
import { fetchQuizBookmarks, setQuizBookmark } from '../services/quizApi'
import { useToast } from '../components/ui/Toast'
import useQuizIdentity from '../hooks/useQuizIdentity'
import useStartQuiz from '../hooks/useStartQuiz'

const QuizBookmarksPage = ({ language, setLanguage }) => {
  const hi = language === 'hindi'
  const toast = useToast()
  const { userId } = useQuizIdentity()
  const { start, pending } = useStartQuiz(language)

  const [items, setItems] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setItems(null)
    try {
      const { bookmarks, pagination: pages } = await fetchQuizBookmarks({ userId, page })
      setItems(bookmarks)
      setPagination(pages)
    } catch (err) {
      setError(err)
      setItems([])
    }
  }, [page, userId])

  useEffect(() => { load() }, [load])

  const remove = async (questionId) => {
    // Dropped from the list first: this page only ever shows saved questions,
    // so leaving it in place after an unsave would contradict itself.
    setItems((current) => current.filter((item) => item.question_id !== questionId))
    try {
      await setQuizBookmark({ userId, questionId, bookmarked: false })
    } catch {
      toast.error(hi ? 'हटाया नहीं जा सका' : 'Could not remove that')
      load()
    }
  }

  return (
    <QuizShell language={language} setLanguage={setLanguage}>
      <Link to="/quiz" className="qz-back">
        <IconChevronLeft s={15} />
        {hi ? 'अभ्यास' : 'Practice'}
      </Link>

      <SectionHeader
        eyebrow={hi ? 'संग्रह' : 'Saved'}
        title={hi ? 'सहेजे गए प्रश्न' : 'Saved questions'}
        subtitle={hi
          ? 'दोहराने के लिए रखे गए प्रश्न, उत्तर और व्याख्या सहित।'
          : 'Questions you kept for revision, with their answers and explanations.'}
        language={language}
      />

      {items?.length > 0 && (
        <div className="qz-revise">
          <Button
            onClick={() => start({ source: 'bookmarked', question_count: 20 }, 'saved')}
            disabled={pending === 'saved'}
          >
            <IconRefresh s={16} />
            {hi ? 'इनका अभ्यास करें' : 'Practise these'}
          </Button>
        </div>
      )}

      {items === null && <Skeleton h={240} r="var(--r-md)" />}

      {error && (
        <ErrorState
          title={hi ? 'सूची लोड नहीं हुई' : 'Could not load your list'}
          body={hi ? 'कृपया थोड़ी देर बाद प्रयास करें।' : 'Please try again in a little while.'}
          action={<Button variant="ghost" onClick={load}>{hi ? 'पुनः प्रयास' : 'Try again'}</Button>}
        />
      )}

      {items && !error && items.length === 0 && (
        <EmptyState
          title={hi ? 'अभी कुछ सहेजा नहीं गया' : 'Nothing saved yet'}
          body={hi
            ? 'अभ्यास के दौरान किसी प्रश्न पर बुकमार्क दबाएं, वह यहां दिखेगा।'
            : 'Tap the bookmark on any question while practising and it will wait for you here.'}
          action={<Button to="/quiz">{hi ? 'अभ्यास शुरू करें' : 'Start practising'}</Button>}
        />
      )}

      {items?.length > 0 && (
        <div className="qz-review">
          {items.map((item) => (
            <QuizQuestion
              key={item.question_id}
              item={item}
              hi={hi}
              action={(
                <button
                  type="button"
                  className="qz-mark is-on"
                  onClick={() => remove(item.question_id)}
                  aria-label={hi ? 'सूची से हटाएं' : 'Remove from saved'}
                >
                  <IconBookmark s={17} filled />
                </button>
              )}
            />
          ))}
        </div>
      )}

      {pagination?.totalPages > 1 && (
        <div className="qz-card__actions">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
          >
            {hi ? 'पिछला' : 'Previous'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
          >
            {hi ? 'अगला' : 'Next'}
          </Button>
        </div>
      )}
    </QuizShell>
  )
}

export default QuizBookmarksPage
