import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import BookCover from '../components/book/BookCover'
import BookText from '../components/book/BookText'
import { Crumbs, Toolbar, Flourish } from '../components/book/BookChrome'
import { EmptyState, ErrorState } from '../components/book/States'
import {
  IconArrowRight, IconBookOpen, IconChevronDown, IconLayers, IconPages, IconUser,
  IconPress, IconBarcode, IconSeal, IconQuill, IconToc, IconOrnament, IconBook,
} from '../components/book/Icons'
import { useT, localeNum, loadProgress } from '../components/book/bookUtils'
import { useBookIndex } from '../hooks/useBookData'
import '../styles/book.css'

const EASE = [0.22, 1, 0.36, 1]

const BookDetailPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const { categoryId, bookId } = useParams()
  const t = useT(language)

  const { data, loading, error, reload } = useBookIndex(bookId)
  const [openChapter, setOpenChapter] = useState(null)
  const [query, setQuery] = useState('')
  const [progress, setProgress] = useState(null)
  const [ackOpen, setAckOpen] = useState(false)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    setProgress(loadProgress(bookId))
  }, [bookId])

  const book = data?.book || null
  const chapters = data?.chapters || []
  const frontMatter = data?.front_matter || []

  // The first chapter opens by itself, so the index is never a wall of closed rows.
  useEffect(() => {
    if (chapters.length) setOpenChapter((prev) => (prev === null ? chapters[0].id : prev))
  }, [chapters])

  const filtered = useMemo(() => {
    if (!query.trim()) return chapters
    const q = query.trim().toLowerCase()
    return chapters
      .map((ch) => {
        const chapterHit = (ch.name || '').toLowerCase().includes(q)
        const topics = (ch.topics || []).filter((tp) =>
          [tp.title, tp.title_hn, tp.title_en, tp.title_hinglish]
            .filter(Boolean)
            .some((s) => s.toLowerCase().includes(q))
        )
        if (!chapterHit && topics.length === 0) return null
        return { ...ch, topics: chapterHit ? ch.topics : topics }
      })
      .filter(Boolean)
  }, [chapters, query])

  // While searching, every matching chapter is expanded so hits are visible.
  const isSearching = Boolean(query.trim())

  const firstChapter = chapters[0]
  const readerHref = firstChapter ? `/books/${categoryId}/${bookId}/${firstChapter.id}` : null

  const resumeHref =
    progress?.chapterId && chapters.some((c) => String(c.id) === String(progress.chapterId))
      ? `/books/${categoryId}/${bookId}/${progress.chapterId}${progress.topicId ? `#t-${progress.topicId}` : ''}`
      : null

  const crumbs = [
    { label: t('library'), to: '/books' },
    { label: book?.category?.name || t('categories'), to: `/books/${categoryId}` },
    { label: book?.name || t('book') },
  ]

  const topicTitle = (tp) =>
    (language === 'english' ? tp.title_en || tp.title_hn : tp.title_hn || tp.title) || tp.title_en || ''

  const text = (value) => (typeof value === 'string' ? value.trim() : '')

  const metaRows = [
    { key: 'author', icon: <IconUser s={15} />, value: text(book?.author), mono: false },
    { key: 'publications', icon: <IconPress s={15} />, value: text(book?.publications), mono: false },
    { key: 'isbn', icon: <IconBarcode s={15} />, value: text(book?.isbn_no), mono: true },
    { key: 'category', icon: <IconBook s={15} />, value: text(book?.category?.name), mono: false },
  ]

  // The index payload carries `acknowledgement_title`; the body is taken from
  // whichever content field holds text, so it shows up as soon as the API
  // returns one.
  const ackTitle = text(book?.acknowledgement_title)
  const ackBody =
    [book?.acknowledgement, book?.acknowledgement_content, book?.acknowledgement_text]
      .map(text)
      .find(Boolean) || ''
  const ackLong = ackBody.length > 560

  return (
    <div className="bk" data-lang={language}>
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />

      <main>
        <div className="bk-shell">
          <Crumbs items={crumbs} />

          {error && !loading && (
            <ErrorState
              title={t('error')}
              hint={t('errorHint')}
              retryLabel={t('retry')}
              onRetry={() => reload(true)}
            />
          )}

          {loading && (
            <div className="bk-title-page" aria-hidden="true">
              <div className="bk-title-page-vol">
                <div className="bk-sk bk-sk--cover" style={{ width: '100%', maxWidth: 290 }} />
              </div>
              <div style={{ display: 'grid', gap: 18, width: '100%' }}>
                <div className="bk-sk bk-sk--line" style={{ width: 120 }} />
                <div className="bk-sk" style={{ height: 38, width: '72%' }} />
                <div className="bk-sk bk-sk--line" style={{ width: '44%' }} />
                <div className="bk-metrics">
                  {[0, 1, 2].map((i) => <div className="bk-sk" style={{ height: 66 }} key={i} />)}
                </div>
                <div className="bk-sk" style={{ height: 210, borderRadius: 14 }} />
              </div>
            </div>
          )}

          {!loading && !error && book && (
            <>
              {/* ── Title page ─────────────────────────────────────── */}
              <section className="bk-title-page">
                <motion.div
                  className="bk-title-page-vol"
                  initial={{ opacity: 0, y: 30, rotateY: -14 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.75, ease: EASE }}
                >
                  <BookCover image={book.book_image} name={book.name} tilt priority />
                  {readerHref && (
                    <Link to={readerHref} className="bk-btn bk-btn--primary bk-btn--lg" style={{ width: '100%' }}>
                      <IconBookOpen s={17} />
                      {t('readNow')}
                    </Link>
                  )}
                </motion.div>

                <div className="bk-title-page-main">
                  <div className="bk-title-page-head">
                    <motion.span
                      className="bk-eyebrow"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
                    >
                      {book.category?.name || t('categories')}
                    </motion.span>

                    <motion.h1
                      className="bk-title bk-title--page"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
                    >
                      {book.name}
                    </motion.h1>

                  {/* Shown only when recorded — the colophon below always lists it. */}
                  {text(book.author) && (
                    <motion.div
                      className="bk-authorline"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
                    >
                      <IconQuill s={18} />
                      <em>{t('author')}</em>
                      <strong>{text(book.author)}</strong>
                    </motion.div>
                  )}

                    <motion.div
                      className="bk-metrics"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.24 }}
                    >
                      <div className="bk-metric">
                        <b>{localeNum(data.total_chapters ?? chapters.length, language)}</b>
                        <span>{t('chapters')}</span>
                      </div>
                      <div className="bk-metric">
                        <b>{localeNum(data.total_topics ?? 0, language)}</b>
                        <span>{t('topics')}</span>
                      </div>
                      <div className="bk-metric">
                        <b>{localeNum(data.total_pages ?? 0, language)}</b>
                        <span>{t('pages')}</span>
                      </div>
                    </motion.div>

                    {resumeHref && (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
                      >
                        <Link to={resumeHref} className="bk-resume">
                          <span className="bk-resume-ico"><IconBookOpen s={17} /></span>
                          <span className="bk-resume-txt">
                            <b>{progress.chapterName || t('continueReading')}</b>
                            <span>{t('lastRead')}</span>
                          </span>
                          <IconArrowRight s={17} style={{ marginInlineStart: 'auto', color: 'var(--bk-saffron-deep)' }} />
                        </Link>
                      </motion.div>
                    )}

                    {/* ── Colophon ──────────────────────────────────── */}
                    <motion.div
                      className="bk-colophon"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, ease: EASE, delay: 0.34 }}
                    >
                    <div className="bk-plate-head">
                      <IconSeal s={15} />
                      {t('colophon')}
                    </div>
                    <dl>
                      {metaRows.map((row) => (
                        <div className="bk-colophon-row" key={row.key}>
                          <dt>{row.icon}{t(row.key)}</dt>
                          <dd className={`${row.mono ? 'is-mono' : ''} ${row.value ? '' : 'is-empty'}`.trim()}>
                            {row.value || '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    </motion.div>

                  {/* ── Acknowledgement ─────────────────────────────── */}
                  <motion.section
                    className="bk-ack"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: EASE, delay: 0.4 }}
                  >
                    <div className="bk-plate-head">
                      <IconQuill s={15} />
                      {t('acknowledgement')}
                    </div>

                    <div className="bk-ack-inner">
                      {ackTitle && <h3 className="bk-ack-title">{ackTitle}</h3>}

                      {ackBody && (
                        <>
                          <div
                            className={`bk-ack-body bk-selectable${
                              ackLong && !ackOpen ? ' is-clamped' : ''
                            }`}
                          >
                            <BookText text={ackBody} variant="deva" id={`ack-${bookId}`} />
                          </div>
                          {ackLong && (
                            <button
                              type="button"
                              className="bk-btn bk-btn--sm bk-ack-more"
                              onClick={() => setAckOpen((v) => !v)}
                              aria-expanded={ackOpen}
                            >
                              {ackOpen ? t('readLess') : t('readFull')}
                              <motion.span
                                animate={{ rotate: ackOpen ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: EASE }}
                                style={{ display: 'grid' }}
                              >
                                <IconChevronDown s={15} />
                              </motion.span>
                            </button>
                          )}
                        </>
                      )}

                      {!ackTitle && !ackBody && <p className="bk-ack-empty">{t('ackEmpty')}</p>}
                    </div>
                  </motion.section>

                    <div className="bk-cta-row">
                      {readerHref && (
                        <Link to={readerHref} className="bk-btn bk-btn--primary">
                          <IconBookOpen s={16} />
                          {t('readNow')}
                        </Link>
                      )}
                      <Link to={`/books/${categoryId}`} className="bk-btn">
                        <IconOrnament s={15} />
                        {book.category?.name || t('allCategories')}
                      </Link>
                    </div>
                  </div>

                <div style={{ padding: '38px 0 6px' }}><Flourish /></div>

                {/* ── Index ──────────────────────────────────────────── */}
                <section className="bk-index-sec">
                  <header className="bk-sec-head">
                    <div>
                      <span className="bk-eyebrow">{t('inThisBook')}</span>
                      <h2 className="bk-title bk-title--sec" style={{ marginTop: 8 }}>
                        {t('index')}
                      </h2>
                      <p>
                        {localeNum(chapters.length, language)} {t('chapters')} ·{' '}
                        {localeNum(data.total_topics ?? 0, language)} {t('topics')}
                      </p>
                    </div>
                    <IconToc s={22} style={{ color: 'var(--bk-gold)' }} />
                  </header>

                  {chapters.length > 4 && (
                    <Toolbar
                      query={query}
                      onQuery={setQuery}
                      placeholder={t('searchIndex')}
                      clearLabel={t('clearSearch')}
                    />
                  )}

                  {chapters.length === 0 && (
                    <EmptyState title={t('emptyChapters')} hint={t('emptyChaptersHint')} />
                  )}

                  {chapters.length > 0 && filtered.length === 0 && (
                    <EmptyState
                      icon="search"
                      title={t('emptySearch')}
                      hint={t('emptySearchHint')}
                      action={
                        <button type="button" className="bk-btn" onClick={() => setQuery('')}>
                          {t('clearSearch')}
                        </button>
                      }
                    />
                  )}

                  {filtered.length > 0 && (
                    <div className="bk-toc">
                      {frontMatter.length > 0 && !isSearching && (
                        <div className="bk-toc-node">
                          <div className="bk-toc-head" style={{ cursor: 'default' }}>
                            <span className="bk-toc-num"><IconPages s={16} /></span>
                            <span className="bk-toc-name">
                              {t('contents')}
                              <span className="bk-toc-sub">
                                {frontMatter.map((f) => f.title || f.name).filter(Boolean).join(' · ')}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}

                      {filtered.map((chapter, i) => {
                        const isOpen = isSearching || openChapter === chapter.id
                        const topics = chapter.topics || []
                        return (
                          <div className={`bk-toc-node${isOpen ? ' is-open' : ''}`} key={chapter.id}>
                            <button
                              type="button"
                              className="bk-toc-head"
                              onClick={() => setOpenChapter(isOpen && !isSearching ? null : chapter.id)}
                              aria-expanded={isOpen}
                            >
                              <span className="bk-toc-num">
                                {localeNum(chapter.chapter_no ?? i + 1, language)}
                              </span>
                              <span className="bk-toc-name">
                                {chapter.name}
                                <span className="bk-toc-sub">
                                  {localeNum(chapter.topic_count ?? topics.length, language)} {t('topics')}
                                  {chapter.page_count ? ` · ${localeNum(chapter.page_count, language)} ${t('pages')}` : ''}
                                </span>
                              </span>
                              <span className="bk-toc-pages">
                                {chapter.start_page
                                  ? `${localeNum(chapter.start_page, language)}–${localeNum(chapter.end_page, language)}`
                                  : ''}
                              </span>
                              <motion.span
                                className="bk-toc-chev"
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.32, ease: EASE }}
                              >
                                <IconChevronDown s={18} />
                              </motion.span>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  className="bk-toc-body"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.36, ease: EASE }}
                                >
                                  <div className="bk-toc-topics">
                                    {topics.length === 0 && (
                                      <Link
                                        to={`/books/${categoryId}/${bookId}/${chapter.id}`}
                                        className="bk-topic"
                                      >
                                        <span className="bk-topic-name">{t('startFrom')}</span>
                                      </Link>
                                    )}
                                    {topics.map((tp) => (
                                      <Link
                                        key={tp._id || tp.topic_no}
                                        to={`/books/${categoryId}/${bookId}/${chapter.id}#t-${tp._id}`}
                                        className="bk-topic"
                                      >
                                        <span className="bk-topic-no">
                                          {localeNum(tp.topic_no ?? tp.sequence, language)}.
                                        </span>
                                        <span className="bk-topic-name">{topicTitle(tp)}</span>
                                        <span className="bk-topic-leader" aria-hidden="true" />
                                        <span className="bk-topic-page">
                                          {tp.page ? localeNum(tp.page, language) : ''}
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {readerHref && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '34px 0 20px' }}>
                      <Link to={readerHref} className="bk-btn bk-btn--primary bk-btn--lg">
                        <IconLayers s={17} />
                        {t('readNow')}
                        <IconArrowRight s={16} />
                      </Link>
                    </div>
                  )}
                </section>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default BookDetailPage
