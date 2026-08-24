import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import BookCover from '../components/book/BookCover'
import { Crumbs, CategoryRail, Toolbar, Flourish } from '../components/book/BookChrome'
import { CardSkeleton, RowSkeleton, EmptyState, ErrorState } from '../components/book/States'
import {
  IconArrowRight, IconBookOpen, IconLayers, IconGlobe, IconBook, IconOrnament, Mandala,
} from '../components/book/Icons'
import { useT, localeNum, useStored } from '../components/book/bookUtils'
import { useCategories, useBooks, useChapterCounts, useBookCounts } from '../hooks/useBookData'
import '../styles/book.css'

const EASE = [0.22, 1, 0.36, 1]

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const collator = new Intl.Collator(['hi', 'en'], { numeric: true, sensitivity: 'base' })

const sortRecords = (items, mode, counts = {}) => {
  const list = [...items]
  switch (mode) {
    case 'az':
      return list.sort((a, b) => collator.compare(a.name || '', b.name || ''))
    case 'za':
      return list.sort((a, b) => collator.compare(b.name || '', a.name || ''))
    case 'size':
      return list.sort((a, b) => (counts[b.id] ?? -1) - (counts[a.id] ?? -1))
    default:
      return list.sort((a, b) => (a.id || 0) - (b.id || 0))
  }
}

const matches = (item, query) => {
  if (!query) return true
  return (item.name || '').toLowerCase().includes(query.toLowerCase())
}

const BookPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const t = useT(language)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('default')
  const [view, setView] = useStored('bk:view', 'grid')

  const categories = useCategories()
  const books = useBooks(categoryId)
  const chapterCounts = useChapterCounts(categoryId, books.data)
  const bookCounts = useBookCounts(categories.data)

  const libraryTotal = useMemo(
    () => Object.values(bookCounts).reduce((sum, n) => sum + (n || 0), 0),
    [bookCounts]
  )

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  // Reset the filter when moving between the library and a category.
  useEffect(() => {
    setQuery('')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [categoryId])

  const activeCategory = useMemo(
    () => (categories.data || []).find((c) => String(c.id) === String(categoryId)) || null,
    [categories.data, categoryId]
  )

  const visibleCategories = useMemo(
    () => sortRecords((categories.data || []).filter((c) => matches(c, query)), sort),
    [categories.data, query, sort]
  )

  const visibleBooks = useMemo(
    () => sortRecords((books.data || []).filter((b) => matches(b, query)), sort, chapterCounts),
    [books.data, query, sort, chapterCounts]
  )

  const inCategory = Boolean(categoryId)
  const loading = inCategory ? books.loading : categories.loading
  const error = inCategory ? books.error : categories.error
  const total = inCategory ? (books.data || []).length : (categories.data || []).length
  const visible = inCategory ? visibleBooks : visibleCategories

  const crumbs = [{ label: t('library'), to: inCategory ? '/books' : null }]
  if (activeCategory) crumbs.push({ label: activeCategory.name })

  const sortOptions = {
    label: t('sort'),
    items: [
      { value: 'default', label: t('sortDefault') },
      { value: 'az', label: t('sortAZ') },
      { value: 'za', label: t('sortZA') },
      ...(inCategory ? [{ value: 'size', label: t('sortPages') }] : []),
    ],
  }

  const renderBookCard = (book) => {
    const count = chapterCounts[book.id]
    return (
      <motion.div variants={itemVariants} key={book.id}>
        <Link className="bk-card" to={`/books/${categoryId}/${book.id}`}>
          {count > 0 && (
            <span className="bk-ribbon">
              <IconLayers s={12} />
              {localeNum(count, language)} {t('chapters')}
            </span>
          )}
          <BookCover image={book.book_image} name={book.name} />
          <div className="bk-card-body">
            <h3 className="bk-card-name">{book.name}</h3>
            <div className="bk-card-meta">
              <span>{t('hindiSanskrit')}</span>
              {count > 0 && (
                <>
                  <span className="dot" />
                  <span>{localeNum(count, language)} {t('chapters')}</span>
                </>
              )}
            </div>
            <span className="bk-card-cta">
              {t('read')} <IconArrowRight s={14} />
            </span>
          </div>
        </Link>
      </motion.div>
    )
  }

  const renderBookRow = (book) => {
    const count = chapterCounts[book.id]
    return (
      <motion.div variants={itemVariants} key={book.id}>
        <Link className="bk-row" to={`/books/${categoryId}/${book.id}`}>
          <BookCover image={book.book_image} name={book.name} />
          <div className="bk-row-body">
            <h3 className="bk-row-name">{book.name}</h3>
            <div className="bk-tags">
              {count > 0 && (
                <span className="bk-tag bk-tag--deva">
                  <IconLayers s={12} />
                  {localeNum(count, language)} {t('chapters')}
                </span>
              )}
              <span className="bk-tag bk-tag--deva">
                <IconGlobe s={12} />
                {t('hindiSanskrit')}
              </span>
              {activeCategory && (
                <span className="bk-tag bk-tag--gold bk-tag--deva">{activeCategory.name}</span>
              )}
            </div>
          </div>
          <div className="bk-row-action">
            <span className="bk-btn bk-btn--primary bk-btn--sm">
              <IconBookOpen s={15} />
              {t('read')}
            </span>
          </div>
        </Link>
      </motion.div>
    )
  }

  const renderCategoryCard = (category) => {
    const count = bookCounts[category.id]
    return (
    <motion.div variants={itemVariants} key={category.id}>
      <Link className="bk-card" to={`/books/${category.id}`}>
        {count > 0 && (
          <span className="bk-ribbon">
            <IconBook s={12} />
            {localeNum(count, language)} {t('books')}
          </span>
        )}
        <BookCover image={category.cover_image} name={category.name} />
        <div className="bk-card-body">
          <h3 className="bk-card-name">{category.name}</h3>
          <div className="bk-card-meta">
            <IconBook s={13} />
            <span>
              {count > 0 ? `${localeNum(count, language)} ${t('books')}` : t('books')}
            </span>
          </div>
          <span className="bk-card-cta">
            {t('openBook')} <IconArrowRight s={14} />
          </span>
        </div>
      </Link>
    </motion.div>
    )
  }

  return (
    <div className="bk" data-lang={language}>
      <Header language={language} setLanguage={handleLanguageChange} />

      <main>
        <div className="bk-shell">
          <Crumbs items={crumbs} />

          <AnimatePresence mode="wait">
            {inCategory ? (
              <motion.header
                key="cat-head"
                className="bk-sec-head"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div>
                  <span className="bk-eyebrow">{t('categories')}</span>
                  <h1 className="bk-title bk-title--page" style={{ marginTop: 8 }}>
                    {activeCategory?.name || t('libraryTitle')}
                  </h1>
                  <p>
                    {loading ? t('loading') : `${localeNum(total, language)} ${t('books')}`}
                  </p>
                </div>
                <Link to="/books" className="bk-btn bk-btn--ghost">
                  <IconOrnament s={16} />
                  {t('allCategories')}
                </Link>
              </motion.header>
            ) : (
              <motion.header
                key="lib-head"
                className="bk-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Mandala className="bk-hero-glyph" />
                <motion.span
                  className="bk-eyebrow"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {t('library')}
                </motion.span>
                <motion.h1
                  className="bk-title bk-title--hero"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.62, ease: EASE, delay: 0.06 }}
                >
                  {t('libraryTitle')}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.4 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
                >
                  <Flourish />
                </motion.div>
                <motion.p
                  className="bk-lede"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
                >
                  {t('libraryLede')}
                </motion.p>
                {(categories.data || []).length > 0 && (
                  <motion.div
                    className="bk-hero-stats"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: EASE, delay: 0.28 }}
                  >
                    <div className="bk-stat">
                      <b>{localeNum(categories.data.length, language)}</b>
                      <span>{t('categories')}</span>
                    </div>
                    {libraryTotal > 0 && (
                      <div className="bk-stat">
                        <b>{localeNum(libraryTotal, language)}</b>
                        <span>{t('books')}</span>
                      </div>
                    )}
                    <div className="bk-stat">
                      <b>{localeNum(2, language)}</b>
                      <span>{t('langBoth')}</span>
                    </div>
                  </motion.div>
                )}
              </motion.header>
            )}
          </AnimatePresence>

          {(categories.data || []).length > 0 && (
            <CategoryRail
              categories={categories.data}
              activeId={categoryId}
              allLabel={t('allCategories')}
              counts={bookCounts}
              onSelect={(id) => navigate(id ? `/books/${id}` : '/books')}
            />
          )}

          <Toolbar
            query={query}
            onQuery={setQuery}
            placeholder={t('search')}
            clearLabel={t('clearSearch')}
            sort={sort}
            onSort={setSort}
            sortOptions={sortOptions}
            view={view}
            onView={setView}
            gridLabel={t('gridView')}
            listLabel={t('listView')}
          />

          {loading && (inCategory && view === 'list' ? <RowSkeleton /> : <CardSkeleton wide={!inCategory} />)}

          {!loading && error && (
            <ErrorState
              title={t('error')}
              hint={t('errorHint')}
              retryLabel={t('retry')}
              onRetry={() => (inCategory ? books.reload(true) : categories.reload(true))}
            />
          )}

          {!loading && !error && visible.length === 0 && (
            query ? (
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
            ) : (
              <EmptyState
                title={inCategory ? t('emptyBooks') : t('empty')}
                hint={inCategory ? t('emptyBooksHint') : undefined}
                action={
                  inCategory ? (
                    <Link to="/books" className="bk-btn bk-btn--primary">
                      {t('allCategories')}
                      <IconArrowRight s={16} />
                    </Link>
                  ) : undefined
                }
              />
            )
          )}

          {!loading && !error && visible.length > 0 && (
            <motion.div
              key={`${categoryId || 'root'}-${view}`}
              className={inCategory && view === 'list' ? 'bk-list' : `bk-grid${inCategory ? '' : ' bk-grid--cat'}`}
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              {inCategory
                ? visibleBooks.map(view === 'list' ? renderBookRow : renderBookCard)
                : visibleCategories.map(renderCategoryCard)}
            </motion.div>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default BookPage
