import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { useAuth } from '../contexts/AuthContext'
import { fetchKoshCategories, fetchKoshContents } from '../services/api'

// Memoized content item to prevent unnecessary re-renders
const KoshContentItem = React.memo(({ content, index, getFirstChar, getIconColor, onTitleClick }) => {
  const firstChar = getFirstChar(content.hindiWord)
  const iconColor = getIconColor(index)
  
  return (
    <div className="kosh-content-item">
      <div 
        className="kosh-content-icon"
        style={{ background: iconColor }}
      >
        {firstChar}
      </div>
      <div className="kosh-content-text">
        <h4 
          className="kosh-content-title kosh-content-title-clickable"
          onClick={() => onTitleClick(content)}
        >
          {content.hindiWord || 'N/A'}
        </h4>
      </div>
    </div>
  )
})

KoshContentItem.displayName = 'KoshContentItem'

const KoshPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const { user } = useAuth()
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])
  
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [allContents, setAllContents] = useState([])
  const [visibleCount, setVisibleCount] = useState(50)
  const [visheshSuchi, setVisheshSuchi] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [filterTerm, setFilterTerm] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [selectedContent, setSelectedContent] = useState(null)
  const [showContentModal, setShowContentModal] = useState(false)
  
  const scrollContainerRef = useRef(null)
  const loadingMoreRef = useRef(false)
  const categoryIdRef = useRef(null)

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setInitialLoading(true)
        setError(null)
        const data = await fetchKoshCategories(1) // Category ID 1 for Kosh
        console.log('📋 Kosh categories data received:', data)
        
        // Handle different response structures
        const categoriesList = data.subcategories || data.categories || (Array.isArray(data) ? data : [])
        console.log('📋 Processed categories list:', categoriesList)
        
        setCategories(categoriesList)
        if (categoriesList.length > 0) {
          setSelectedCategory(categoriesList[0])
        } else {
          setError('No categories found. Please check the API response.')
        }
      } catch (err) {
        console.error('❌ Error loading kosh categories:', err)
        setError(`Failed to load categories: ${err.message}`)
      } finally {
        setInitialLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Optimized content loading
  useEffect(() => {
    if (!selectedCategory) {
      console.log('⚠️ No category selected, skipping content load')
      return
    }
    
    const categoryId = selectedCategory.id
    console.log('🔄 Loading contents for category:', categoryId, selectedCategory.name)
    
    // Prevent duplicate loading for same category
    if (categoryIdRef.current === categoryId) {
      console.log('⏭️ Skipping duplicate load for category:', categoryId)
      return
    }
    categoryIdRef.current = categoryId
    
    const loadContents = async () => {
      setInitialLoading(true)
      setAllContents([])
      setVisibleCount(50)
      setError(null)

      try {
        // PHASE 1: Load first page immediately (10 items)
        console.log('📄 Loading page 1 for category:', categoryId)
        const page1 = await fetchKoshContents(1, categoryId, 1) // Category ID 1 for Kosh
        console.log('📦 Page 1 response:', page1)
        
        if (categoryIdRef.current !== categoryId) {
          console.log('⚠️ Category changed during load, aborting')
          return
        }
        
        const initial = page1.contents || []
        console.log('📋 Initial contents count:', initial.length)
        setAllContents(initial)
        setVisheshSuchi(page1.vishesh_suchi || [])
        setInitialLoading(false)
        
        const totalPages = page1.totalPages || 1
        console.log('📊 Total pages:', totalPages)
        
        if (totalPages <= 1) {
          console.log('✅ Only one page, loading complete')
          return
        }

        // PHASE 2: Burst load pages 2-5 (40 more items)
        const burstPages = Math.min(5, totalPages)
        console.log('📄 Burst loading pages 2-', burstPages)
        const burstPromises = []
        for (let i = 2; i <= burstPages; i++) {
          burstPromises.push(fetchKoshContents(1, categoryId, i)) // Category ID 1 for Kosh
        }
        
        const burstResults = await Promise.all(burstPromises)
        if (categoryIdRef.current !== categoryId) {
          console.log('⚠️ Category changed during burst load, aborting')
          return
        }
        
        const burstContents = burstResults.flatMap(p => p.contents || [])
        console.log('📋 Burst contents count:', burstContents.length)
        
        // Combine all initial contents (pages 1-5)
        const allInitial = [...initial, ...burstContents]
        console.log('📋 Total contents after burst:', allInitial.length)
        setAllContents(allInitial)

        // PHASE 3: Background load remaining pages with progressive updates
        if (totalPages > 5) {
          console.log('📄 Starting background load for pages 6-', totalPages)
          loadBackgroundPages(1, categoryId, 6, totalPages, allInitial) // Category ID 1 for Kosh
        }
      } catch (err) {
        console.error('❌ Error loading contents:', err)
        if (categoryIdRef.current === categoryId) {
          setError(`Failed to load: ${err.message}`)
          setInitialLoading(false)
        }
      }
    }

    loadContents()
  }, [selectedCategory])

  // Background loading with progressive updates (no delay visible to user)
  const loadBackgroundPages = useCallback(async (mainCategoryId, subcategoryId, startPage, totalPages, existingContents) => {
    const BATCH_SIZE = 10 // Fetch 10 pages per batch for smoother updates
    
    let currentPage = startPage
    let accumulated = [...existingContents]
    
    while (currentPage <= totalPages) {
      if (categoryIdRef.current !== subcategoryId) return
      
      const endPage = Math.min(currentPage + BATCH_SIZE - 1, totalPages)
      const pagePromises = []
      
      // Create concurrent requests for this batch
      for (let p = currentPage; p <= endPage; p++) {
        pagePromises.push(fetchKoshContents(mainCategoryId, subcategoryId, p))
      }
      
      try {
        const results = await Promise.all(pagePromises)
        if (categoryIdRef.current !== subcategoryId) return // Fixed: was 'categoryId' which was undefined
        
        const newContents = results.flatMap(page => page.contents || [])
        accumulated = [...accumulated, ...newContents]
        
        // Update state with accumulated contents (replaces, not appends)
        setAllContents(accumulated)
      } catch (err) {
        console.error('Background load error:', err)
      }
      
      currentPage = endPage + 1
    }
  }, [])

  // Reset on category change
  useEffect(() => {
    setFilterTerm('')
    setSearchQuery('')
    setVisibleCount(50)
  }, [selectedCategory])

  // Filtered contents with memoization
  const filteredContents = useMemo(() => {
    let result = allContents
    
    if (filterTerm) {
      const term = filterTerm.toLowerCase()
      result = result.filter(c => 
        c.search?.toLowerCase().includes(term) ||
        c.hindiWord?.toLowerCase().includes(term)
      )
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.hindiWord?.toLowerCase().includes(query) ||
        c.meaning?.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [allContents, filterTerm, searchQuery])

  // Visible items (progressive reveal as user scrolls)
  const visibleItems = useMemo(() => {
    return filteredContents.slice(0, visibleCount)
  }, [filteredContents, visibleCount])

  // Infinite scroll handler with throttling
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
    
    // Load more when user reaches 80% scroll
    if (scrollPercentage > 0.8 && !loadingMoreRef.current) {
      loadingMoreRef.current = true
      
      setVisibleCount(prev => {
        const newCount = Math.min(prev + 100, filteredContents.length)
        return newCount
      })
      
      // Reset flag after small delay
      setTimeout(() => {
        loadingMoreRef.current = false
      }, 50)
    }
  }, [filteredContents.length])

  // Get first character (handles Hindi, English, Numbers)
  const getFirstChar = useCallback((word) => {
    if (!word) return '#'
    const firstChar = word.charAt(0)
    
    // Check if it's a number (0-9 or Hindi digits)
    if (/[0-9०-९]/.test(firstChar)) {
      return firstChar
    }
    
    // Hindi character
    if (/[\u0900-\u097F]/.test(firstChar)) {
      return firstChar
    }
    
    // English letter
    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase()
    }
    
    return '#'
  }, [])

  // Color palette for icons
  const getIconColor = useCallback((index) => {
    const colors = ['#17A2B8', '#FF6B9D', '#4ECDC4', '#FFC107', '#9C27B0', '#FF9800', '#2196F3', '#E91E63', '#00BCD4', '#8BC34A']
    return colors[index % colors.length]
  }, [])

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  const handleVisheshSuchiClick = useCallback((term) => {
    setFilterTerm(term)
    setShowFilterModal(false)
    setVisibleCount(50)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [])

  const clearFilter = useCallback(() => {
    setFilterTerm('')
    setVisibleCount(50)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [])

  const handleContentTitleClick = useCallback((content) => {
    if (!user) {
      alert(language === 'hindi' ? 'कृपया पहले लॉगिन करें' : 'Please login first')
      return
    }
    setSelectedContent(content)
    setShowContentModal(true)
  }, [user, language])

  const handleCloseContentModal = useCallback(() => {
    setShowContentModal(false)
    setSelectedContent(null)
  }, [])

  return (
    <div className="app kosh-app-fixed">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      
      {/* Horizontal Services Strip */}
      <ServicesStrip language={language} activeService="kosh" />
      
      <main className="kosh-page-main-new">
        <div className="kosh-page-layout">
          {/* Left Sidebar - Categories */}
          <aside className="kosh-sidebar">
            <div className="kosh-sidebar-header">
              <h3>{language === 'hindi' ? 'श्रेणियाँ' : 'Categories'}</h3>
            </div>
            <div className="kosh-sidebar-categories">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  className={`kosh-sidebar-category ${selectedCategory?.id === category.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="kosh-sidebar-category-image">
                    <img src={category.cover_image} alt={category.name} loading="lazy" />
                  </div>
                  <span className="kosh-sidebar-category-name">{category.name}</span>
                </motion.button>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="kosh-main-content-wrapper">
            {/* Search and Filter Bar */}
            <div className="kosh-search-filter-bar">
              <div className="kosh-search-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={language === 'hindi' ? 'खोजें...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setVisibleCount(50)
                  }}
                  className="kosh-search-input"
                />
              </div>
              <motion.button
                className={`kosh-filter-btn ${filterTerm ? 'active' : ''}`}
                onClick={() => setShowFilterModal(!showFilterModal)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>{language === 'hindi' ? 'विशेष सूची' : 'Special List'}</span>
                {filterTerm && <span className="kosh-filter-badge">1</span>}
              </motion.button>
            </div>

            {/* Contents Card */}
            <div className="kosh-contents-card">
              <div className="kosh-contents-card-header">
                <h4 className="kosh-contents-card-title">
                  {selectedCategory?.name || (language === 'hindi' ? 'सामग्री' : 'Contents')}
                  <span className="kosh-contents-count">
                    ({filteredContents.length} {language === 'hindi' ? 'शब्द' : 'words'})
                  </span>
                </h4>
                {filterTerm && (
                  <span className="kosh-active-filter">
                    {filterTerm}
                    <button onClick={clearFilter}>✕</button>
                  </span>
                )}
              </div>
              
              {initialLoading ? (
                <div className="kosh-loading-inline">
                  <div className="kosh-loader-small"></div>
                  <span>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
                </div>
              ) : error ? (
                <div className="kosh-error-inline">
                  <p>⚠️ {error}</p>
                </div>
              ) : (
                <div 
                  className="kosh-contents-list-scroll" 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                >
                  {visibleItems.length > 0 ? (
                    visibleItems.map((content, index) => (
                      <KoshContentItem
                        key={content.id || index}
                        content={content}
                        index={index}
                        getFirstChar={getFirstChar}
                        getIconColor={getIconColor}
                        onTitleClick={handleContentTitleClick}
                      />
                    ))
                  ) : (
                    <div className="kosh-no-results-inline">
                      <p>
                        {filterTerm 
                          ? (language === 'hindi' ? `"${filterTerm}" के लिए कोई परिणाम नहीं` : `No results for "${filterTerm}"`)
                          : (language === 'hindi' ? 'कोई सामग्री नहीं' : 'No contents')
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Filter Modal - Rendered at root level to avoid overflow clipping */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            <motion.div
              className="kosh-filter-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowFilterModal(false)}
            />
            <motion.div
              className="kosh-filter-modal"
              initial={{ opacity: 0, y: '100%', x: '-50%' }}
              animate={{ opacity: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, y: '100%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="kosh-filter-modal-header">
                <h4>{language === 'hindi' ? 'विशेष सूची' : 'Special List'}</h4>
                <button onClick={() => setShowFilterModal(false)}>✕</button>
              </div>
              <div className="kosh-filter-modal-content">
                {visheshSuchi.length > 0 ? (
                  <>
                    {visheshSuchi.map((term, index) => (
                      <button
                        key={index}
                        className={`kosh-filter-modal-item ${filterTerm === term ? 'active' : ''}`}
                        onClick={() => handleVisheshSuchiClick(term)}
                      >
                        {term}
                      </button>
                    ))}
                    {filterTerm && (
                      <button
                        className="kosh-filter-modal-clear"
                        onClick={() => {
                          clearFilter()
                          setShowFilterModal(false)
                        }}
                      >
                        ✕ {language === 'hindi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filter'}
                      </button>
                    )}
                  </>
                ) : (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    {language === 'hindi' ? 'कोई विशेष सूची उपलब्ध नहीं' : 'No special list available'}
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content Detail Modal */}
      <AnimatePresence>
        {showContentModal && selectedContent && (
          <>
            <motion.div
              className="kosh-content-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleCloseContentModal}
            />
            <motion.div
              className="kosh-content-modal"
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%'
              }}
            >
              <div className="kosh-content-modal-header">
                <h3 className={`kosh-content-modal-title ${language === 'hindi' ? 'hindi' : ''}`}>
                  {selectedContent.hindiWord || 'N/A'}
                </h3>
                <button 
                  className="kosh-content-modal-close"
                  onClick={handleCloseContentModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              
              <div className="kosh-content-modal-body">
                {selectedContent.meaning && (
                  <div 
                    className={`kosh-content-modal-section ${language === 'hindi' ? 'hindi' : ''}`}
                    dangerouslySetInnerHTML={{ __html: selectedContent.meaning }}
                  />
                )}
                
                {selectedContent.structure && (
                  <div 
                    className={`kosh-content-modal-section ${language === 'hindi' ? 'hindi' : ''}`}
                    dangerouslySetInnerHTML={{ __html: selectedContent.structure }}
                  />
                )}
                
                {selectedContent.extra && (
                  <div 
                    className={`kosh-content-modal-section kosh-content-modal-extra ${language === 'hindi' ? 'hindi' : ''}`}
                    dangerouslySetInnerHTML={{ __html: selectedContent.extra }}
                  />
                )}
                
                {!selectedContent.meaning && !selectedContent.structure && !selectedContent.extra && (
                  <div className="kosh-content-modal-empty">
                    <p className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'कोई विवरण उपलब्ध नहीं' : 'No details available'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default KoshPage
