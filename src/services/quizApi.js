import { API_BASE_URL } from './api'

/**
 * MCQ practice API — browse quiz sets, play a scored session, review mistakes,
 * track progress and bookmark questions.
 *
 * The server never sends the answer key with the questions and scores every
 * answer itself, so nothing here needs to know what "correct" means.
 */
const BASE = `${API_BASE_URL}/mcq/practice`

/** Carries the HTTP status and the server's `data` so callers can act on a 402. */
export class QuizError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'QuizError'
    this.status = status
    this.data = data
  }
}

const query = (params) => {
  const pairs = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  return pairs.length ? `?${new URLSearchParams(pairs)}` : ''
}

const request = async (path, { method = 'GET', body, params } = {}) => {
  let response
  try {
    response = await fetch(`${BASE}${path}${query(params)}`, {
      method,
      headers: body
        ? { 'Content-Type': 'application/json', Accept: 'application/json' }
        : { Accept: 'application/json' },
      mode: 'cors',
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new QuizError('Network error', 0)
  }

  // A missing route answers with an HTML error page, not JSON.
  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false) {
    throw new QuizError(
      payload?.message || `Request failed (${response.status})`,
      response.status,
      payload?.data
    )
  }

  return payload
}

/* ── Browsing ─────────────────────────────────────────────────────── */

/** Subjects for the practice home. `userId` adds each subject's progress. */
export const fetchQuizCategories = async (userId) =>
  (await request('/categories', { params: { user_id: userId } })).data || []

/** Quiz sets in a subject, with the user's best scores and lock state. */
export const fetchQuizSets = async (categoryId, { userId, email, phone } = {}) =>
  (await request(`/categories/${categoryId}/sets`, {
    params: { user_id: userId, email, phone },
  })).data || { category: null, sets: [] }

/* ── Playing ──────────────────────────────────────────────────────── */

/**
 * Opens an attempt. Pass exactly one of `set_id` (one set), `category_id`
 * (mixed across a subject) or `source` ('wrong' | 'bookmarked') to revise.
 * Throws a `QuizError` with status 402 and `data.set` when a set is paid.
 */
export const startQuiz = async (payload) =>
  (await request('/start', { method: 'POST', body: payload })).data

/**
 * One answer. `selected` is an array of option keys — send `[]` to skip.
 * In practice mode the reply reveals the outcome; in test mode it does not.
 */
export const answerQuizQuestion = async (payload) =>
  (await request('/answer', { method: 'POST', body: payload })).data

/** Finishes the attempt and returns the scorecard. */
export const submitQuiz = async (payload) =>
  (await request('/submit', { method: 'POST', body: payload })).data

/* ── History and progress ─────────────────────────────────────────── */

export const fetchQuizAttempts = async ({ userId, page = 1, limit = 20, status } = {}) => {
  const payload = await request('/attempts', {
    params: { user_id: userId, page, limit, status },
  })
  return { attempts: payload.data || [], pagination: payload.pagination || null }
}

/** Full review of one attempt — same shape as the submit response. */
export const fetchQuizAttempt = async (attemptId) =>
  (await request(`/attempts/${attemptId}`)).data

export const fetchQuizStats = async (userId) =>
  (await request('/stats', { params: { user_id: userId } })).data

/* ── Bookmarks ────────────────────────────────────────────────────── */

/** Omit `bookmarked` to toggle. */
export const setQuizBookmark = async ({ userId, questionId, bookmarked }) =>
  (await request('/bookmark', {
    method: 'POST',
    body: { user_id: userId, question_id: questionId, bookmarked },
  })).data

export const fetchQuizBookmarks = async ({ userId, page = 1, limit = 20 } = {}) => {
  const payload = await request('/bookmarks', {
    params: { user_id: userId, page, limit },
  })
  return { bookmarks: payload.data || [], pagination: payload.pagination || null }
}
