import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchBookCategories,
  fetchAllBooksByCategory,
  fetchBookIndex,
  fetchChapterCount,
  fetchBookCount,
  fetchAllChapterContent,
} from '../services/api'

/**
 * Process-lifetime caches. Book content is static reference material, so once a
 * category list or a book index has been fetched there is no reason to fetch it
 * again while the user browses between the library, a title page and the reader.
 */
const categoryCache = { promise: null, data: null }
const booksCache = new Map()      // categoryId -> Promise<Book[]>
const indexCache = new Map()      // bookId -> Promise<BookIndex>
const countCache = new Map()      // `${categoryId}/${bookId}` -> Promise<number|null>
const contentCache = new Map()    // `${cid}/${bid}/${chid}` -> Promise<Topic[]>
const bookCountCache = new Map()  // categoryId -> Promise<number|null>

const getCategories = () => {
  if (categoryCache.data) return Promise.resolve(categoryCache.data)
  if (!categoryCache.promise) {
    categoryCache.promise = fetchBookCategories()
      .then((data) => {
        categoryCache.data = Array.isArray(data) ? data : []
        return categoryCache.data
      })
      .catch((error) => {
        categoryCache.promise = null
        throw error
      })
  }
  return categoryCache.promise
}

const getBooks = (categoryId) => {
  const key = String(categoryId)
  if (!booksCache.has(key)) {
    booksCache.set(
      key,
      fetchAllBooksByCategory(categoryId).catch((error) => {
        booksCache.delete(key)
        throw error
      })
    )
  }
  return booksCache.get(key)
}

const getIndex = (bookId) => {
  const key = String(bookId)
  if (!indexCache.has(key)) {
    indexCache.set(
      key,
      fetchBookIndex(bookId).catch((error) => {
        indexCache.delete(key)
        throw error
      })
    )
  }
  return indexCache.get(key)
}

export const getChapterCount = (categoryId, bookId) => {
  const key = `${categoryId}/${bookId}`
  if (!countCache.has(key)) countCache.set(key, fetchChapterCount(categoryId, bookId))
  return countCache.get(key)
}

const getContent = (categoryId, bookId, chapterId) => {
  const key = `${categoryId}/${bookId}/${chapterId}`
  if (!contentCache.has(key)) {
    contentCache.set(
      key,
      fetchAllChapterContent(categoryId, bookId, chapterId).catch((error) => {
        contentCache.delete(key)
        throw error
      })
    )
  }
  return contentCache.get(key)
}

/** Warms the cache for a chapter the reader is likely to open next. */
export const prefetchChapter = (categoryId, bookId, chapterId) => {
  if (!categoryId || !bookId || !chapterId) return
  getContent(categoryId, bookId, chapterId).catch(() => {})
}

/** Generic async resource with cancel-on-unmount and a manual `reload`. */
const useResource = (loader, deps, { enabled = true, initial = null } = {}) => {
  const [state, setState] = useState({ data: initial, loading: enabled, error: null })
  const [nonce, setNonce] = useState(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState({ data: initial, loading: false, error: null })
      return
    }
    let current = true
    setState((prev) => ({ data: prev.data, loading: true, error: null }))
    loader()
      .then((data) => {
        if (current && alive.current) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (current && alive.current) {
          setState({ data: null, loading: false, error: error?.message || 'Request failed' })
        }
      })
    return () => { current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, nonce])

  const reload = useCallback((hard = false) => {
    if (hard) {
      categoryCache.promise = null
      categoryCache.data = null
      booksCache.clear()
      indexCache.clear()
      countCache.clear()
      contentCache.clear()
    }
    setNonce((n) => n + 1)
  }, [])

  return { ...state, reload }
}

export const useCategories = () =>
  useResource(getCategories, [], { initial: [] })

export const useBooks = (categoryId) =>
  useResource(() => getBooks(categoryId), [categoryId], { enabled: Boolean(categoryId), initial: [] })

export const useBookIndex = (bookId) =>
  useResource(() => getIndex(bookId), [bookId], { enabled: Boolean(bookId) })

export const useChapterContent = (categoryId, bookId, chapterId) =>
  useResource(
    () => getContent(categoryId, bookId, chapterId),
    [categoryId, bookId, chapterId],
    { enabled: Boolean(categoryId && bookId && chapterId), initial: [] }
  )

/**
 * Resolves a count for each id, four requests at a time so a large category
 * doesn't open twenty sockets at once. Results stream in as they land.
 */
const useCounts = (ids, resolve, deps) => {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    if (!ids.length) return
    let alive = true
    let cursor = 0

    const worker = async () => {
      while (alive && cursor < ids.length) {
        const id = ids[cursor++]
        const count = await resolve(id)
        if (!alive) return
        setCounts((prev) => (prev[id] === count ? prev : { ...prev, [id]: count }))
      }
    }

    Promise.all(Array.from({ length: Math.min(4, ids.length) }, worker))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return counts
}

export const useChapterCounts = (categoryId, books) => {
  const ids = useMemo(
    () => (categoryId ? (books || []).map((b) => b.id).filter((id) => id != null) : []),
    [categoryId, books]
  )
  const resolve = useCallback((id) => getChapterCount(categoryId, id), [categoryId])
  return useCounts(ids, resolve, [categoryId, ids])
}

export const useBookCounts = (categories) => {
  const ids = useMemo(
    () => (categories || []).map((c) => c.id).filter((id) => id != null),
    [categories]
  )
  const resolve = useCallback((id) => {
    if (!bookCountCache.has(id)) bookCountCache.set(id, fetchBookCount(id))
    return bookCountCache.get(id)
  }, [])
  return useCounts(ids, resolve, [ids])
}
