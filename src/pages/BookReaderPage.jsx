import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BookText from '../components/book/BookText'
import ReaderPrefs from '../components/book/ReaderPrefs'
import { Crumbs } from '../components/book/BookChrome'
import { ReaderSkeleton, EmptyState, ErrorState } from '../components/book/States'
import {
  IconArrowLeft, IconArrowRight, IconArrowUp, IconChevronDown, IconChevronLeft,
  IconChevronRight, IconToc, IconTextSize, IconSearch, IconX, IconBookmark,
  IconShare, IconCheck, IconExpand, IconCollapse, IconFocus, IconOrnament, IconPages,
} from '../components/book/Icons'
import {
  useT, localeNum, useStored, useToast, copyToClipboard, topicSearchBlob,
  saveProgress, SIZE_STEPS, LEADING_STEPS, MEASURE_STEPS, PREFS_KEY, bookmarksKey,
} from '../components/book/bookUtils'
import { useBookIndex, useChapterContent, prefetchChapter } from '../hooks/useBookData'
import '../styles/book.css'

const EASE = [0.22, 1, 0.36, 1]
const OPEN_S = 0.4                    // topic expand/collapse duration
const OPEN_MS = OPEN_S * 1000 + 40    // …plus a frame, for scroll-after-expand

const DEFAULT_PREFS = { size: 2, leading: 1, measure: 1, theme: 'parchment', justify: false }

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

const BookReaderPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const { categoryId, bookId, chapterId } = useParams()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const t = useT(language)
  const isEnglish = language === 'english'

  const index = useBookIndex(bookId)
  const content = useChapterContent(categoryId, bookId, chapterId)

  const [prefs, setPrefs] = useStored(PREFS_KEY, DEFAULT_PREFS)
  const [openIds, setOpenIds] = useState(() => new Set())
  const [marks, setMarks] = useStored(bookmarksKey(bookId), [])
  const [sidebarOn, setSidebarOn] = useStored('bk:toc', true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [findOn, setFindOn] = useState(false)
  const [find, setFind] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [barHidden, setBarHidden] = useState(false)
  const [activeTopic, setActiveTopic] = useState(null)
  const [toast, showToast] = useToast()

  const pieceRefs = useRef(new Map())
  const openRef = useRef(openIds)
  const findInput = useRef(null)
  const lastScroll = useRef(0)
  const jumpedTo = useRef(null)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  /* ── Derived book / chapter data ───────────────────────────────── */
  const book = index.data?.book || null
  const chapters = index.data?.chapters || []
  const chapterPos = chapters.findIndex((c) => String(c.id) === String(chapterId))
  const chapter = chapterPos >= 0 ? chapters[chapterPos] : null
  const prevChapter = chapterPos > 0 ? chapters[chapterPos - 1] : null
  const nextChapter = chapterPos >= 0 && chapterPos < chapters.length - 1 ? chapters[chapterPos + 1] : null

  const topics = content.data || []
  const loading = index.loading || content.loading
  const error = index.error || content.error

  // Page ranges live on the index, not on the content payload; merge them in.
  const pageByTopic = useMemo(() => {
    const map = new Map()
    chapters.forEach((ch) => (ch.topics || []).forEach((tp) => map.set(tp._id, tp)))
    return map
  }, [chapters])

  const titleOf = useCallback(
    (item) =>
      (language === 'english'
        ? item.title_en || item.title_hn
        : item.title_hn || item.title_en) || '',
    [language]
  )

  /* ── In-chapter search ────────────────────────────────────────── */
  const q = find.trim().toLowerCase()

  const visibleTopics = useMemo(() => {
    if (!q) return topics
    return topics.filter((item) => topicSearchBlob(item, language).includes(q))
  }, [topics, q, language])

  /* ── Open state: first topic expands by itself ────────────────── */
  useEffect(() => {
    setOpenIds(new Set())
    setActiveTopic(null)
    jumpedTo.current = null
  }, [chapterId])

  const hashTopic = hash?.startsWith('#t-') ? hash.slice(3) : null

  // Mirrored so `revealTopic` can read the open set without being rebuilt on
  // every expand and collapse.
  useEffect(() => {
    openRef.current = openIds
  }, [openIds])

  /**
   * Opens a topic and brings it to the top of the page. Expanding one animates
   * `height: auto`, and that measurement pass resets the window scroll, so a
   * jump that also opens a topic has to wait for the expansion to settle.
   */
  const revealTopic = useCallback((id) => {
    const wasOpen = openRef.current.has(id)
    setOpenIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
    setSheetOpen(false)
    const scroll = () =>
      pieceRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (wasOpen) requestAnimationFrame(scroll)
    else window.setTimeout(scroll, OPEN_MS)
  }, [])

  useEffect(() => {
    if (!topics.length) return
    setOpenIds((prev) => {
      if (prev.size) return prev
      const deep = hashTopic && topics.some((item) => item._id === hashTopic)
      return new Set([deep ? hashTopic : topics[0]._id])
    })
  }, [topics, hashTopic])

  // While a search is active, every match is expanded so hits are readable.
  useEffect(() => {
    if (!q) return
    setOpenIds(new Set(visibleTopics.map((item) => item._id)))
  }, [q, visibleTopics])

  /* ── Deep link: open and scroll to the topic named in the hash ─── */
  useEffect(() => {
    if (!hashTopic || jumpedTo.current === hashTopic || !topics.length) return
    if (!topics.some((item) => item._id === hashTopic)) return
    if (!pieceRefs.current.has(hashTopic)) return
    jumpedTo.current = hashTopic
    revealTopic(hashTopic)
  }, [topics, hashTopic, revealTopic])

  /* ── Reading progress ─────────────────────────────────────────── */
  const { scrollYProgress, scrollY } = useScroll()
  const progressScale = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 })

  // Hide the reader bar while scrolling down, bring it back on the way up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - lastScroll.current
    if (Math.abs(delta) < 8) return
    lastScroll.current = y
    if (y < 140) {
      setBarHidden(false)
      return
    }
    setBarHidden(delta > 0)
    if (delta > 0) setPrefsOpen(false)
  })

  /* ── Track which topic is being read ──────────────────────────── */
  useEffect(() => {
    if (!visibleTopics.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveTopic(visible[0].target.dataset.topic)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
    )
    pieceRefs.current.forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [visibleTopics])

  useEffect(() => {
    if (!chapter || !activeTopic) return
    saveProgress(bookId, {
      categoryId,
      chapterId,
      chapterName: chapter.name,
      topicId: activeTopic,
    })
  }, [activeTopic, bookId, categoryId, chapterId, chapter])

  /* ── Prefetch the neighbouring chapters ───────────────────────── */
  useEffect(() => {
    if (nextChapter) prefetchChapter(categoryId, bookId, nextChapter.id)
    if (prevChapter) prefetchChapter(categoryId, bookId, prevChapter.id)
  }, [categoryId, bookId, nextChapter, prevChapter])

  // A new chapter opens at the top, unless the URL names a topic to jump to.
  useEffect(() => {
    if (window.location.hash.startsWith('#t-')) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [chapterId])

  /* ── Actions ──────────────────────────────────────────────────── */
  const toggleTopic = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allOpen = visibleTopics.length > 0 && visibleTopics.every((item) => openIds.has(item._id))

  const toggleAll = () =>
    setOpenIds(allOpen ? new Set() : new Set(visibleTopics.map((item) => item._id)))

  const goChapter = useCallback(
    (target) => {
      if (!target) return
      navigate(`/books/${categoryId}/${bookId}/${target.id}`)
    },
    [navigate, categoryId, bookId]
  )

  const toggleMark = (id) =>
    setMarks((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))

  const handleShare = async (item) => {
    const url = `${window.location.origin}/books/${categoryId}/${bookId}/${chapterId}#t-${item._id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: titleOf(item), text: book?.name, url })
        return
      } catch {
        /* dismissed — fall back to copying */
      }
    }
    if (await copyToClipboard(url)) showToast(t('linkCopied'))
  }

  /* ── Keyboard shortcuts ───────────────────────────────────────── */
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable
      if (event.key === 'Escape') {
        setPrefsOpen(false)
        setSheetOpen(false)
        if (findOn) { setFindOn(false); setFind('') }
        return
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'ArrowRight') { goChapter(nextChapter); return }
      if (event.key === 'ArrowLeft') { goChapter(prevChapter); return }
      if (event.key === 't') { setSidebarOn((v) => !v); setSheetOpen((v) => !v); return }
      if (event.key === 'f') { event.preventDefault(); setFindOn(true); return }
      if (event.key === 'a') { setPrefsOpen((v) => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goChapter, nextChapter, prevChapter, findOn, setSidebarOn])

  useEffect(() => {
    if (findOn) requestAnimationFrame(() => findInput.current?.focus())
  }, [findOn])

  // Dismiss the typography popover on any outside click.
  useEffect(() => {
    if (!prefsOpen) return
    const onDown = (event) => {
      if (!event.target.closest('.bk-prefs') && !event.target.closest('[data-prefs-toggle]')) {
        setPrefsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [prefsOpen])

  /* ── Style variables from preferences ─────────────────────────── */
  const readerStyle = {
    '--rd-size': SIZE_STEPS[prefs.size] ?? SIZE_STEPS[2],
    '--rd-leading': LEADING_STEPS[prefs.leading] ?? LEADING_STEPS[1],
    '--rd-measure': MEASURE_STEPS[prefs.measure] ?? MEASURE_STEPS[1],
    '--rd-align': prefs.justify ? 'justify' : 'start',
  }

  const crumbs = [
    { label: t('library'), to: '/books' },
    { label: book?.category?.name || t('categories'), to: `/books/${categoryId}` },
    { label: book?.name || t('book'), to: `/books/${categoryId}/${bookId}` },
    { label: chapter?.name || t('chapter') },
  ]

  /* ── Table of contents (shared by sidebar and mobile sheet) ───── */
  const renderToc = () => (
    <div className="bk-side-scroll">
      {chapters.map((ch, i) => {
        const isCurrent = String(ch.id) === String(chapterId)
        return (
          <div key={ch.id}>
            <button
              type="button"
              className={`bk-side-ch${isCurrent ? ' is-current' : ''}`}
              onClick={() => (isCurrent ? setSheetOpen(false) : goChapter(ch))}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <span className="bk-side-ch-no">{localeNum(ch.chapter_no ?? i + 1, language)}</span>
              <span className="bk-side-ch-name">{ch.name}</span>
              {ch.start_page > 0 && (
                <span className="bk-side-ch-no">{localeNum(ch.start_page, language)}</span>
              )}
            </button>

            {isCurrent && topics.length > 0 && (
              <div className="bk-side-topics">
                {topics.map((item, ti) => (
                  <button
                    key={item._id}
                    type="button"
                    className={`bk-side-topic${activeTopic === item._id ? ' is-active' : ''}`}
                    onClick={() => revealTopic(item._id)}
                  >
                    <i>{localeNum(pageByTopic.get(item._id)?.topic_no ?? ti + 1, language)}</i>
                    <span>{titleOf(item)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  /* ── One topic ────────────────────────────────────────────────── */
  const renderTopic = (item, order) => {
    const isOpen = openIds.has(item._id)
    const meta = pageByTopic.get(item._id)
    const locked = item.locked && !item.purchased
    const marked = marks.includes(item._id)
    const title = titleOf(item)
    const subtitle = language === 'english' ? item.title_hn : item.title_en

    // The śloka is Sanskrit, so it stays in both languages; the commentary
    // follows the chosen one. Only about a quarter of the topics carry an
    // English translation, so fall back to the Hindi commentary — labelled as
    // such — instead of leaving an English reader with an empty topic.
    const latinBody = isEnglish && hasText(item.extra) ? item.extra : null
    const devaBody = !latinBody && hasText(item.details) ? item.details : null

    return (
      <motion.article
        key={item._id}
        className={`bk-piece${isOpen ? ' is-open' : ''}`}
        data-topic={item._id}
        ref={(node) => {
          if (node) pieceRefs.current.set(item._id, node)
          else pieceRefs.current.delete(item._id)
        }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: Math.min(order * 0.035, 0.3) }}
      >
        <button
          type="button"
          className="bk-piece-head"
          onClick={() => toggleTopic(item._id)}
          aria-expanded={isOpen}
        >
          <span className="bk-piece-no">
            {localeNum(meta?.topic_no ?? order + 1, language)}
          </span>
          <span className="bk-piece-titles">
            <span className={`bk-piece-title${language === 'english' ? ' bk-piece-title--latin' : ''}`}>
              {title}
            </span>
            {subtitle && subtitle !== title && <span className="bk-piece-sub">{subtitle}</span>}
          </span>
          {meta?.page > 0 && (
            <span className="bk-piece-pages">
              <IconPages s={11} />
              {meta.start_page === meta.end_page || !meta.end_page
                ? localeNum(meta.page, language)
                : `${localeNum(meta.start_page, language)}–${localeNum(meta.end_page, language)}`}
            </span>
          )}
          <motion.span
            className="bk-piece-chev"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <IconChevronDown s={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              className="bk-piece-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: OPEN_S, ease: EASE }}
            >
              <div className="bk-piece-inner">
                {locked ? (
                  <div className="bk-block">
                    <p className="bk-prose bk-prose--deva">{t('emptyContent')}</p>
                  </div>
                ) : (
                  <>
                    {item.meaning && (
                      <div className="bk-block">
                        <span className="bk-block-label">
                          <i><IconOrnament s={13} /></i>
                          {t('verse')}
                        </span>
                        <BookText text={item.meaning} variant="verse" query={find.trim()} id={`${item._id}-v`} />
                      </div>
                    )}

                    {devaBody && (
                      <div className="bk-block">
                        <span className="bk-block-label">
                          {t('meaning')}
                          {isEnglish && <em className="bk-block-note">{t('noTranslation')}</em>}
                        </span>
                        <BookText text={devaBody} variant="deva" query={find.trim()} id={`${item._id}-d`} />
                      </div>
                    )}

                    {latinBody && (
                      <div className="bk-block">
                        <span className="bk-block-label">{t('english')}</span>
                        <BookText text={latinBody} variant="latin" query={find.trim()} id={`${item._id}-e`} />
                      </div>
                    )}
                  </>
                )}

                <div className="bk-piece-tools">
                  <button type="button" className="bk-tool" onClick={() => toggleMark(item._id)}>
                    <IconBookmark s={14} filled={marked} />
                    {marked ? t('bookmarked') : t('bookmark')}
                  </button>
                  <button type="button" className="bk-tool" onClick={() => handleShare(item)}>
                    <IconShare s={14} />
                    {t('share')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    )
  }

  const showSidebar = sidebarOn && chapters.length > 1

  return (
    <div className="bk" data-lang={language}>
      <Header language={language} setLanguage={handleLanguageChange} />

      <motion.div className="bk-progress" style={{ scaleX: progressScale }} aria-hidden="true" />

      <div
        className={`bk-reader${focusMode ? ' is-focus' : ''}`}
        data-theme={prefs.theme}
        style={readerStyle}
      >
        <div className="bk-shell bk-shell--wide">
          <Crumbs items={crumbs} />

          {/* ── Reader bar ─────────────────────────────────────── */}
          <div className={`bk-bar${barHidden ? ' is-hidden' : ''}`}>
            <div className="bk-bar-side">
              <Link
                to={`/books/${categoryId}/${bookId}`}
                className="bk-icon-btn"
                aria-label={t('back')}
                title={t('back')}
              >
                <IconArrowLeft s={19} />
              </Link>
              <button
                type="button"
                className={`bk-icon-btn${showSidebar ? ' is-on' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 1080) setSheetOpen(true)
                  else setSidebarOn((v) => !v)
                }}
                aria-label={t('contents')}
                title={`${t('contents')} · T`}
              >
                <IconToc s={19} />
              </button>
            </div>

            <div className="bk-bar-mid">
              <span className="bk-bar-book">{book?.name}</span>
              <span className="bk-bar-chapter">{chapter?.name || t('chapter')}</span>
            </div>

            <div className="bk-bar-side">
              <button
                type="button"
                className={`bk-icon-btn${findOn ? ' is-on' : ''}`}
                onClick={() => { setFindOn((v) => !v); if (findOn) setFind('') }}
                aria-label={t('searchTopics')}
                title={`${t('searchTopics')} · F`}
              >
                <IconSearch s={18} />
              </button>
              <button
                type="button"
                className={`bk-icon-btn bk-bar-hide-sm${focusMode ? ' is-on' : ''}`}
                onClick={() => setFocusMode((v) => !v)}
                aria-label={t('focusMode')}
                title={t('focusMode')}
              >
                <IconFocus s={18} />
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  data-prefs-toggle
                  className={`bk-icon-btn${prefsOpen ? ' is-on' : ''}`}
                  onClick={() => setPrefsOpen((v) => !v)}
                  aria-label={t('typography')}
                  title={`${t('typography')} · A`}
                >
                  <IconTextSize s={19} />
                </button>
                <AnimatePresence>
                  {prefsOpen && (
                    <ReaderPrefs prefs={prefs} setPrefs={setPrefs} t={t} language={language} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── In-chapter find ────────────────────────────────── */}
          <AnimatePresence>
            {findOn && (
              <motion.div
                className="bk-find"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                <IconSearch s={17} style={{ marginInlineStart: 6, color: 'var(--rd-ink-3)' }} />
                <input
                  ref={findInput}
                  type="search"
                  value={find}
                  placeholder={t('searchTopics')}
                  onChange={(e) => setFind(e.target.value)}
                />
                <span className="bk-find-count">
                  {q
                    ? visibleTopics.length
                      ? `${localeNum(visibleTopics.length, language)} ${t('results')}`
                      : t('noResults')
                    : `${localeNum(topics.length, language)} ${t('topics')}`}
                </span>
                <button
                  type="button"
                  className="bk-icon-btn"
                  onClick={() => { setFindOn(false); setFind('') }}
                  aria-label={t('clearSearch')}
                >
                  <IconX s={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && !loading && (
            <ErrorState
              title={t('error')}
              hint={t('errorHint')}
              retryLabel={t('retry')}
              onRetry={() => { index.reload(true); content.reload(true) }}
            />
          )}

          {!error && (
            <div className={`bk-reader-grid${showSidebar ? '' : ' is-solo'}`}>
              {showSidebar && (
                <aside className="bk-side-host">
                  <div className="bk-side">
                    <div className="bk-side-head">
                      <span>{t('contents')}</span>
                      <button
                        type="button"
                        className="bk-icon-btn"
                        onClick={() => setSidebarOn(false)}
                        aria-label={t('collapseAll')}
                        style={{ width: 28, height: 28 }}
                      >
                        <IconChevronLeft s={16} />
                      </button>
                    </div>
                    {renderToc()}
                  </div>
                </aside>
              )}

              <div className="bk-col">
                {/* Chapter plate */}
                {chapter && (
                  <motion.header
                    className="bk-chapter-plate"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <span className="bk-chapter-kicker">
                      {t('chapter')} {localeNum(chapter.chapter_no ?? chapterPos + 1, language)}
                    </span>
                    <h1 className="bk-chapter-name">{chapter.name}</h1>
                    <div className="bk-chapter-facts">
                      <span>{localeNum(chapter.topic_count ?? topics.length, language)} {t('topics')}</span>
                      {chapter.start_page > 0 && (
                        <>
                          <span className="dot" />
                          <span>
                            {t('pages')} {localeNum(chapter.start_page, language)}–{localeNum(chapter.end_page, language)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="bk-flourish" aria-hidden="true">
                      <span />
                      <IconOrnament s={20} />
                      <span />
                    </div>
                  </motion.header>
                )}

                {loading && <ReaderSkeleton />}

                {!loading && topics.length === 0 && (
                  <EmptyState
                    title={t('emptyContent')}
                    hint={t('emptyChaptersHint')}
                    action={
                      <Link to={`/books/${categoryId}/${bookId}`} className="bk-btn bk-btn--primary">
                        {t('index')}
                        <IconArrowRight s={16} />
                      </Link>
                    }
                  />
                )}

                {!loading && topics.length > 0 && visibleTopics.length === 0 && (
                  <EmptyState
                    icon="search"
                    title={t('emptySearch')}
                    hint={t('emptySearchHint')}
                    action={
                      <button type="button" className="bk-btn" onClick={() => setFind('')}>
                        {t('clearSearch')}
                      </button>
                    }
                  />
                )}

                {!loading && visibleTopics.length > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                      <button type="button" className="bk-btn bk-btn--ghost bk-btn--sm" onClick={toggleAll}>
                        {allOpen ? <IconCollapse s={15} /> : <IconExpand s={15} />}
                        {allOpen ? t('collapseAll') : t('expandAll')}
                      </button>
                    </div>

                    <div className="bk-topics">
                      {visibleTopics.map((item, i) => renderTopic(item, i))}
                    </div>
                  </>
                )}

                {/* Chapter pager */}
                {!loading && (prevChapter || nextChapter) && (
                  <nav className="bk-pager" aria-label={t('chapters')}>
                    {prevChapter ? (
                      <Link className="bk-pager-card" to={`/books/${categoryId}/${bookId}/${prevChapter.id}`}>
                        <span className="bk-pager-kicker">
                          <IconChevronLeft s={13} />
                          {t('prevChapter')}
                        </span>
                        <span className="bk-pager-name">{prevChapter.name}</span>
                      </Link>
                    ) : <span />}
                    {nextChapter && (
                      <Link
                        className="bk-pager-card bk-pager-card--next"
                        to={`/books/${categoryId}/${bookId}/${nextChapter.id}`}
                      >
                        <span className="bk-pager-kicker">
                          {t('nextChapter')}
                          <IconChevronRight s={13} />
                        </span>
                        <span className="bk-pager-name">{nextChapter.name}</span>
                      </Link>
                    )}
                  </nav>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Floating actions ─────────────────────────────────── */}
        <div className="bk-fabs">
          {nextChapter && (
            <button
              type="button"
              className="bk-fab"
              onClick={() => goChapter(nextChapter)}
              aria-label={t('nextChapter')}
              title={t('nextChapter')}
            >
              <IconChevronRight s={19} />
            </button>
          )}
          <button
            type="button"
            className="bk-fab"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t('top')}
            title={t('top')}
          >
            <IconArrowUp s={19} />
          </button>
        </div>

        {/* ── Mobile contents sheet ────────────────────────────── */}
        <AnimatePresence>
          {sheetOpen && (
            <>
              <motion.div
                className="bk-sheet-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
              />
              <motion.div
                className="bk-sheet bk-sheet--left"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                role="dialog"
                aria-label={t('contents')}
              >
                <div className="bk-sheet-head">
                  <span className="bk-sheet-title">{t('contents')}</span>
                  <button
                    type="button"
                    className="bk-icon-btn"
                    onClick={() => setSheetOpen(false)}
                    aria-label={t('clearSearch')}
                  >
                    <IconX s={18} />
                  </button>
                </div>
                <div className="bk-sheet-body">{renderToc()}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="bk-toast"
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.26, ease: EASE }}
              role="status"
            >
              <IconCheck s={16} />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer language={language} />
    </div>
  )
}

export default BookReaderPage
