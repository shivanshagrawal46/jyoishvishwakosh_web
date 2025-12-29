import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchBookCategories, fetchBooksByCategory, fetchChaptersByBook, fetchChapterContent } from '../services/api'

const BookPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const { categoryId, bookId, chapterId } = useParams()
  const navigate = useNavigate()
  
  const [categories, setCategories] = useState([])
  const [books, setBooks] = useState([])
  const [chapters, setChapters] = useState([])
  const [content, setContent] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest') // 'latest', 'name', 'name-desc'
  const [viewMode, setViewMode] = useState('list') // 'grid', 'list'
  const [showIndex, setShowIndex] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState(new Set())
  const [bookChapterCounts, setBookChapterCounts] = useState({})

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const data = await fetchBookCategories()
        setCategories(data || [])
        setError(null)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError(err.message || 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Fetch books when category is selected
  useEffect(() => {
    const loadBooks = async () => {
      if (!categoryId) {
        setBooks([])
        setSelectedCategory(null)
        return
      }
      try {
        setLoading(true)
        const data = await fetchBooksByCategory(categoryId)
        setBooks(data || [])
        const cat = categories.find(c => c.id === parseInt(categoryId))
        if (cat) {
          setSelectedCategory(cat)
        } else if (categories.length === 0) {
          // If categories not loaded yet, fetch them first
          const cats = await fetchBookCategories()
          setCategories(cats || [])
          const foundCat = (cats || []).find(c => c.id === parseInt(categoryId))
          setSelectedCategory(foundCat)
        }
        setError(null)
      } catch (err) {
        console.error('Error loading books:', err)
        setError(err.message || 'Failed to load books')
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [categoryId, categories])

  // Fetch chapters when book is selected
  useEffect(() => {
    const loadChapters = async () => {
      if (!categoryId || !bookId) {
        setChapters([])
        setSelectedBook(null)
        return
      }
      try {
        setLoading(true)
        const data = await fetchChaptersByBook(categoryId, bookId)
        setChapters(data || [])
        const book = books.find(b => b.id === parseInt(bookId))
        if (book) {
          setSelectedBook(book)
        } else if (books.length === 0 && categoryId) {
          // If books not loaded yet, fetch them first
          const booksData = await fetchBooksByCategory(categoryId)
          setBooks(booksData || [])
          const foundBook = (booksData || []).find(b => b.id === parseInt(bookId))
          setSelectedBook(foundBook)
        }
        setError(null)
      } catch (err) {
        console.error('Error loading chapters:', err)
        setError(err.message || 'Failed to load chapters')
      } finally {
        setLoading(false)
      }
    }
    loadChapters()
  }, [categoryId, bookId, books])

  // Fetch content when chapter is selected
  useEffect(() => {
    const loadContent = async () => {
      if (!categoryId || !bookId || !chapterId) {
        setContent([])
        setSelectedChapter(null)
        return
      }
      try {
        setLoading(true)
        const data = await fetchChapterContent(categoryId, bookId, chapterId)
        setContent(data || [])
        const chapter = chapters.find(c => c.id === parseInt(chapterId))
        if (chapter) {
          setSelectedChapter(chapter)
        } else if (chapters.length === 0 && categoryId && bookId) {
          // If chapters not loaded yet, fetch them first
          const chaptersData = await fetchChaptersByBook(categoryId, bookId)
          setChapters(chaptersData || [])
          const foundChapter = (chaptersData || []).find(c => c.id === parseInt(chapterId))
          setSelectedChapter(foundChapter)
        }
        setError(null)
      } catch (err) {
        console.error('Error loading content:', err)
        setError(err.message || 'Failed to load content')
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [categoryId, bookId, chapterId, chapters])

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    return `https://www.jyotishvishwakosh.in${imagePath}`
  }

  // Filter and sort functions
  const filterItems = (items, query) => {
    if (!query) return items
    const lowerQuery = query.toLowerCase()
    return items.filter(item => {
      const name = item.name || ''
      return name.toLowerCase().includes(lowerQuery)
    })
  }

  const sortItems = (items, sortType) => {
    const sorted = [...items]
    switch (sortType) {
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
      case 'name-desc':
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameB.localeCompare(nameA)
        })
      case 'latest':
      default:
        // Show first data first (ascending by ID)
        return sorted.sort((a, b) => (a.id || 0) - (b.id || 0))
    }
  }

  const toggleChapterExpansion = (chapterId) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  // Get filtered and sorted data
  const filteredCategories = sortItems(filterItems(categories, searchQuery), sortBy)
  const filteredBooks = sortItems(filterItems(books, searchQuery), sortBy)
  const filteredChapters = sortItems(filterItems(chapters, searchQuery), sortBy)
  const filteredContent = filterItems(content, searchQuery)

  const renderContent = (item) => {
    const title = language === 'hindi' ? item.title_hn : item.title_en
    const meaning = item.meaning || ''
    const details = item.details || ''
    const extra = item.extra || ''

    return (
      <motion.div
        key={item._id}
        className="book-content-item"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className={`book-content-title ${language === 'hindi' ? 'hindi' : ''}`}>
          {title}
        </h3>
        {meaning && (
          <div className="book-content-meaning">
            <h4 className={`book-content-subtitle ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'अर्थ' : 'Meaning'}
            </h4>
            <div 
              className={`book-content-text ${language === 'hindi' ? 'hindi' : ''}`}
              dangerouslySetInnerHTML={{ __html: meaning }}
            />
          </div>
        )}
        {details && (
          <div className="book-content-details">
            <h4 className={`book-content-subtitle ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'विवरण' : 'Details'}
            </h4>
            <div 
              className={`book-content-text ${language === 'hindi' ? 'hindi' : ''}`}
              dangerouslySetInnerHTML={{ __html: details }}
            />
          </div>
        )}
        {extra && language === 'english' && (
          <div className="book-content-extra">
            <h4 className="book-content-subtitle">Additional Information</h4>
            <div 
              className="book-content-text"
              dangerouslySetInnerHTML={{ __html: extra }}
            />
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <>
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      
      <main className="book-page-main">
        <div className="container">
          {/* Breadcrumb Navigation */}
          {(categoryId || selectedCategory || selectedBook || selectedChapter) && (
            <motion.div
              className="book-breadcrumb"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link to="/books" className="book-breadcrumb-link">
                {language === 'hindi' ? 'ग्रंथ' : 'Books'}
              </Link>
              {selectedCategory && (
                <>
                  <span className="book-breadcrumb-separator">›</span>
                  {bookId ? (
                    <Link 
                      to={`/books/${categoryId}`} 
                      className="book-breadcrumb-link"
                    >
                      {selectedCategory.name}
                    </Link>
                  ) : (
                    <span className={`book-breadcrumb-current ${language === 'hindi' ? 'hindi' : ''}`}>
                      {selectedCategory.name}
                    </span>
                  )}
                </>
              )}
              {selectedBook && (
                <>
                  <span className="book-breadcrumb-separator">›</span>
                  {chapterId ? (
                    <Link 
                      to={`/books/${categoryId}/${bookId}`} 
                      className="book-breadcrumb-link"
                    >
                      {selectedBook.name}
                    </Link>
                  ) : (
                    <span className={`book-breadcrumb-current ${language === 'hindi' ? 'hindi' : ''}`}>
                      {selectedBook.name}
                    </span>
                  )}
                </>
              )}
              {selectedChapter && (
                <>
                  <span className="book-breadcrumb-separator">›</span>
                  <span className={`book-breadcrumb-current ${language === 'hindi' ? 'hindi' : ''}`}>
                    {selectedChapter.name}
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Page Header */}
          <motion.div
            className="book-page-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h1 className={`book-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {selectedChapter 
                ? selectedChapter.name 
                : selectedBook 
                ? selectedBook.name 
                : selectedCategory 
                ? selectedCategory.name 
                : language === 'hindi' ? 'ग्रंथ संग्रह' : 'Book Collection'}
            </h1>
            <p className="book-page-subtitle">
              {language === 'hindi' 
                ? 'प्राचीन ज्योतिष ग्रंथों का विशाल संग्रह' 
                : 'A vast collection of ancient astrological books'}
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="book-loading">
              <div className="book-spinner"></div>
              <p className={language === 'hindi' ? 'hindi' : ''}>
                {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="book-error">
              <p className={language === 'hindi' ? 'hindi' : ''}>
                {language === 'hindi' ? 'त्रुटि: ' : 'Error: '}{error}
              </p>
            </div>
          )}

          {/* Filter and Search Bar */}
          {!loading && (
            <motion.div
              className="book-filter-bar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="book-search-wrapper">
                <input
                  type="text"
                  placeholder={language === 'hindi' ? 'खोजें...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="book-search-input"
                />
                <svg className="book-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              
              <div className="book-filter-controls">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="book-sort-select"
                >
                  <option value="latest">{language === 'hindi' ? 'नवीनतम' : 'Latest'}</option>
                  <option value="name">{language === 'hindi' ? 'नाम (आरोही)' : 'Name (A-Z)'}</option>
                  <option value="name-desc">{language === 'hindi' ? 'नाम (अवरोही)' : 'Name (Z-A)'}</option>
                </select>
                
                {!categoryId && (
                  <div className="book-view-toggle">
                    <button
                      className={`book-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title={language === 'hindi' ? 'ग्रिड दृश्य' : 'Grid View'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                      </svg>
                    </button>
                    <button
                      className={`book-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title={language === 'hindi' ? 'सूची दृश्य' : 'List View'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
                
                {chapterId && (
                  <button
                    className={`book-index-btn ${showIndex ? 'active' : ''}`}
                    onClick={() => setShowIndex(!showIndex)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="6" x2="20" y2="6"></line>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                    <span>{language === 'hindi' ? 'सूची' : 'Index'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Categories View */}
          {!categoryId && !loading && filteredCategories.length > 0 && (
            <>
              {/* Category Tabs */}
              <motion.div
                className="book-category-tabs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="book-category-tabs-scroll">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      className="book-category-tab"
                      onClick={() => navigate(`/books/${category.id}`)}
                    >
                      <span className={`book-category-tab-name ${language === 'hindi' ? 'hindi' : ''}`}>
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Category Cards Grid */}
              <motion.div
                className="book-categories-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="book-category-card"
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/books/${category.id}`)}
                  >
                    <div className="book-category-image-wrapper">
                      <img
                        src={getImageUrl(category.cover_image)}
                        alt={category.name}
                        className="book-category-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400?text=Book'
                        }}
                      />
                      <div className="book-category-overlay"></div>
                    </div>
                    <div className="book-category-info">
                      <h3 className={`book-category-name ${language === 'hindi' ? 'hindi' : ''}`}>
                        {category.name}
                      </h3>
                      <div className="book-category-read-now">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <span className="book-category-read-now-text">
                          {language === 'hindi' ? 'पढ़ें' : 'Read now'}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* Books View */}
          {categoryId && !bookId && !loading && filteredBooks.length > 0 && (
            <>
              {/* Category Tabs for Books View */}
              <motion.div
                className="book-category-tabs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="book-category-tabs-scroll">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`book-category-tab ${parseInt(categoryId) === category.id ? 'active' : ''}`}
                      onClick={() => navigate(`/books/${category.id}`)}
                    >
                      <span className={`book-category-tab-name ${language === 'hindi' ? 'hindi' : ''}`}>
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Books List View */}
              <motion.div
                className="book-books-list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                {filteredBooks.map((book) => {
                  const chapterCount = bookChapterCounts[book.id] ?? '...'
                  const hasChapters = chapterCount !== 0 && chapterCount !== '...'
                  
                  // Load chapter count if not loaded
                  if (bookChapterCounts[book.id] === undefined) {
                    fetchChaptersByBook(categoryId, book.id)
                      .then(chaptersData => {
                        const count = (chaptersData || []).length
                        setBookChapterCounts(prev => ({ ...prev, [book.id]: count }))
                      })
                      .catch(() => {
                        setBookChapterCounts(prev => ({ ...prev, [book.id]: 0 }))
                      })
                  }
                  
                  return (
                    <motion.div
                      key={book.id}
                      className="book-book-list-card"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => hasChapters ? navigate(`/books/${categoryId}/${book.id}`) : null}
                    >
                      <div className="book-book-list-cover">
                        <img
                          src={getImageUrl(book.book_image)}
                          alt={book.name}
                          className="book-book-list-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/120x160?text=Book'
                          }}
                        />
                      </div>
                      <div className="book-book-list-content">
                        <h3 className={`book-book-list-title ${language === 'hindi' ? 'hindi' : ''}`}>
                          {book.name}
                        </h3>
                        <div className="book-book-list-meta">
                          <span className="book-book-list-chapters">
                            {language === 'hindi' ? 'अध्याय: ' : 'Chapters: '}
                            {typeof chapterCount === 'number' ? chapterCount : '...'}
                          </span>
                          <span className="book-book-list-language">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="2" y1="12" x2="22" y2="12"></line>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            {language === 'hindi' ? 'हिंदी / संस्कृत' : 'Hindi / Sanskrit'}
                          </span>
                        </div>
                      </div>
                      <div className="book-book-list-action">
                        {hasChapters && (
                          <button
                            className="book-book-read-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/books/${categoryId}/${book.id}`)
                            }}
                          >
                            {language === 'hindi' ? 'पढ़ें' : 'Read'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </>
          )}

          {/* Chapters View */}
          {categoryId && bookId && !chapterId && !loading && filteredChapters.length > 0 && (
            <>
              {showIndex && (
                <motion.div
                  className="book-index-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className={`book-index-title ${language === 'hindi' ? 'hindi' : ''}`}>
                    {language === 'hindi' ? 'सूची' : 'Index'}
                  </h3>
                  <p className="book-index-subtitle">
                    {language === 'hindi' ? 'अध्याय पर क्लिक करके पढ़ना शुरू करें' : 'Tap a chapter to start reading'}
                  </p>
                  <div className="book-index-list">
                    {filteredChapters.map((chapter, index) => {
                      const isExpanded = expandedChapters.has(chapter.id)
                      return (
                        <div key={chapter.id} className="book-index-item">
                          <div
                            className="book-index-header"
                            onClick={() => toggleChapterExpansion(chapter.id)}
                          >
                            <span className="book-index-number">{index + 1}</span>
                            <span className={`book-index-name ${language === 'hindi' ? 'hindi' : ''}`}>
                              {chapter.name}
                            </span>
                            <span className="book-index-toggle">
                              {isExpanded ? '−' : '+'}
                            </span>
                          </div>
                          {isExpanded && (
                            <div className="book-index-content">
                              <div
                                className="book-index-chapter-link"
                                onClick={() => navigate(`/books/${categoryId}/${bookId}/${chapter.id}`)}
                              >
                                {language === 'hindi' ? 'पढ़ना शुरू करें' : 'Start Reading'}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
              <motion.div
                className="book-chapters-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {filteredChapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    className="book-chapter-item"
                    whileHover={{ x: 8, backgroundColor: '#FFF8F0' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/books/${categoryId}/${bookId}/${chapter.id}`)}
                  >
                    <div className="book-chapter-number">
                      {index + 1}
                    </div>
                    <div className="book-chapter-content">
                      <h3 className={`book-chapter-name ${language === 'hindi' ? 'hindi' : ''}`}>
                        {chapter.name}
                      </h3>
                    </div>
                    <div className="book-chapter-arrow">→</div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* Content View */}
          {categoryId && bookId && chapterId && !loading && (
            <div className="book-content-wrapper">
              {showIndex && chapters.length > 0 && (
                <motion.div
                  className="book-content-index"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className={`book-content-index-title ${language === 'hindi' ? 'hindi' : ''}`}>
                    {language === 'hindi' ? 'सूची' : 'Index'}
                  </h3>
                  <div className="book-content-index-list">
                    {chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className={`book-content-index-item ${parseInt(chapterId) === chapter.id ? 'active' : ''}`}
                        onClick={() => navigate(`/books/${categoryId}/${bookId}/${chapter.id}`)}
                      >
                        <span className="book-content-index-number">{index + 1}</span>
                        <span className={`book-content-index-name ${language === 'hindi' ? 'hindi' : ''}`}>
                          {chapter.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {filteredContent.length > 0 && (
                <motion.div
                  className={`book-content-container ${showIndex ? 'with-index' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <AnimatePresence>
                    {filteredContent.map((item) => renderContent(item))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && (
            <>
              {!categoryId && filteredCategories.length === 0 && categories.length > 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'खोज से मेल खाने वाली कोई श्रेणी नहीं मिली' : 'No categories match your search'}
                  </p>
                </div>
              )}
              {!categoryId && categories.length === 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'कोई श्रेणी उपलब्ध नहीं' : 'No categories available'}
                  </p>
                </div>
              )}
              {categoryId && !bookId && filteredBooks.length === 0 && books.length > 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'खोज से मेल खाने वाली कोई पुस्तक नहीं मिली' : 'No books match your search'}
                  </p>
                </div>
              )}
              {categoryId && !bookId && books.length === 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'कोई पुस्तक उपलब्ध नहीं' : 'No books available'}
                  </p>
                </div>
              )}
              {categoryId && bookId && !chapterId && filteredChapters.length === 0 && chapters.length > 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'खोज से मेल खाने वाला कोई अध्याय नहीं मिला' : 'No chapters match your search'}
                  </p>
                </div>
              )}
              {categoryId && bookId && !chapterId && chapters.length === 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'कोई अध्याय उपलब्ध नहीं' : 'No chapters available'}
                  </p>
                </div>
              )}
              {categoryId && bookId && chapterId && filteredContent.length === 0 && content.length > 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'खोज से मेल खाने वाली कोई सामग्री नहीं मिली' : 'No content match your search'}
                  </p>
                </div>
              )}
              {categoryId && bookId && chapterId && content.length === 0 && (
                <div className="book-empty">
                  <p className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? 'कोई सामग्री उपलब्ध नहीं' : 'No content available'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </>
  )
}

export default BookPage

