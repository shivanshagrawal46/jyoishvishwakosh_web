import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startQuiz } from '../services/quizApi'
import useQuizIdentity from './useQuizIdentity'
import { useToast } from '../components/ui/Toast'

/**
 * Opens an attempt and hands off to the session screen. Every entry point into
 * a quiz — a set, a mixed subject, "revise my wrong answers" — goes through
 * here so the locked-set and empty-pool cases are answered the same way.
 *
 * `pending` holds the key of whichever button is waiting, so a list of sets can
 * show a spinner on just the one that was tapped.
 */
export default function useStartQuiz(language) {
  const hi = language === 'hindi'
  const navigate = useNavigate()
  const toast = useToast()
  const { userId, email } = useQuizIdentity()
  const [pending, setPending] = useState(null)

  const start = useCallback(async (options, key = 'start') => {
    setPending(key)
    try {
      const attempt = await startQuiz({ user_id: userId, email, ...options })
      // The attempt travels in router state rather than being re-fetched: it
      // carries the questions, and asking again would reshuffle them.
      navigate('/quiz/play', { state: { attempt } })
    } catch (error) {
      setPending(null)

      if (error.status === 402) {
        const price = error.data?.set?.amount
        toast.error(hi
          ? `यह सेट सशुल्क है${price ? ` (₹${price})` : ''} — ऐप से खरीदें`
          : `This set is paid${price ? ` (₹${price})` : ''} — buy it in the app`)
        return
      }

      toast.error(
        error.status === 404
          ? (hi ? 'अभ्यास के लिए अभी कोई प्रश्न नहीं है' : 'Nothing to practise here yet')
          : (hi ? 'अभ्यास शुरू नहीं हो सका' : 'Could not start the quiz')
      )
    }
  }, [email, hi, navigate, toast, userId])

  return { start, pending }
}
