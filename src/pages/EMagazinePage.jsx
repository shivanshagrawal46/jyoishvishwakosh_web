import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { useAuth } from '../contexts/AuthContext'
import { 
  fetchEMagazines, 
  fetchEMagazineWriters, 
  fetchEMagazineSubjects,
  fetchEMagazineByWriter,
  fetchEMagazineBySubject
} from '../services/api'

const EMagazinePage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const [magazines, setMagazines] = useState([])
  const [writers, setWriters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)
  const [selectedWriter, setSelectedWriter] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)

  // Fetch writers and subjects on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [writersData, subjectsData] = await Promise.all([
          fetchEMagazineWriters(),
          fetchEMagazineSubjects()
        ])
        setWriters(writersData || [])
        setSubjects(subjectsData || [])
      } catch (err) {
        console.error('Error loading filters:', err)
      }
    }
    loadFilters()
  }, [])

  // Fetch magazines based on filters
  useEffect(() => {
    const loadMagazines = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let result
        if (selectedWriter) {
          result = await fetchEMagazineByWriter(selectedWriter, currentPage)
        } else if (selectedSubject) {
          result = await fetchEMagazineBySubject(selectedSubject, currentPage)
        } else {
          result = await fetchEMagazines(currentPage)
        }
        
        setMagazines(result.magazines || [])
        setTotalPages(result.pagination?.totalPages || 1)
      } catch (err) {
        setError(`Failed to load magazines: ${err.message}`)
        setMagazines([])
      } finally {
        setLoading(false)
      }
    }
    loadMagazines()
  }, [currentPage, selectedWriter, selectedSubject])

  const handleWriterFilter = (writerId) => {
    setSelectedWriter(writerId === 'all' ? null : writerId)
    setSelectedSubject(null)
    setCurrentPage(1)
  }

  const handleSubjectFilter = (subjectId) => {
    setSelectedSubject(subjectId === 'all' ? null : subjectId)
    setSelectedWriter(null)
    setCurrentPage(1)
  }

  const getWriterImage = (writerName) => {
    const writer = writers.find(w => w.name === writerName)
    if (writer && writer.image) {
      return writer.image.startsWith('http') 
        ? writer.image 
        : `https://www.jyotishvishwakosh.in${writer.image}`
    }
    return null
  }

  const handleMagazineClick = (magazine) => {
    if (!user) {
      alert(language === 'hindi' ? 'कृपया पहले लॉगिन करें' : 'Please login first')
      return
    }
    navigate(`/emagazine/${magazine._id}`, { state: { magazine } })
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="emagazine" />

      <main className="emagazine-page-main">
        <div className="container">
          <div className="emagazine-page-header">
            <h1 className={`emagazine-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? '📰 ई-मैगजीन' : '📰 E-Magazine'}
            </h1>
            <p className="emagazine-page-subtitle">
              {language === 'hindi' 
                ? 'ज्योतिष और वास्तु से संबंधित लेख पढ़ें' 
                : 'Read articles on Jyotish and Vastu'}
            </p>
          </div>

          {/* Filters */}
          <div className="emagazine-filters">
            <div className="emagazine-filter-group">
              <label className="emagazine-filter-label">
                {language === 'hindi' ? 'लेखक द्वारा फ़िल्टर करें' : 'Filter by Writer'}
              </label>
              <select
                value={selectedWriter || 'all'}
                onChange={(e) => handleWriterFilter(e.target.value)}
                className="emagazine-filter-select"
              >
                <option value="all">{language === 'hindi' ? 'सभी लेखक' : 'All Writers'}</option>
                {writers.map((writer) => (
                  <option key={writer._id || writer.id} value={writer._id || writer.id}>
                    {writer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="emagazine-filter-group">
              <label className="emagazine-filter-label">
                {language === 'hindi' ? 'विषय द्वारा फ़िल्टर करें' : 'Filter by Subject'}
              </label>
              <select
                value={selectedSubject || 'all'}
                onChange={(e) => handleSubjectFilter(e.target.value)}
                className="emagazine-filter-select"
              >
                <option value="all">{language === 'hindi' ? 'सभी विषय' : 'All Subjects'}</option>
                {subjects.map((subject) => (
                  <option key={subject._id || subject.id} value={subject._id || subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="emagazine-loading">
              <div className="emagazine-loader"></div>
              <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="emagazine-error">
              <p>⚠️ {error}</p>
            </div>
          ) : magazines.length === 0 ? (
            <div className="emagazine-empty">
              <p>{language === 'hindi' ? 'कोई मैगजीन उपलब्ध नहीं' : 'No magazines available'}</p>
            </div>
          ) : (
            <>
              <div className="emagazine-grid">
                {magazines.map((magazine, index) => {
                  const writerImage = getWriterImage(magazine.writer)
                  
                  return (
                    <motion.div
                      key={magazine._id}
                      className="emagazine-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                      onClick={() => handleMagazineClick(magazine)}
                    >
                      {/* Writer Image */}
                      <div className="emagazine-card-writer-section">
                        {writerImage ? (
                          <img 
                            src={writerImage} 
                            alt={magazine.writer} 
                            className="emagazine-card-writer-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="emagazine-card-writer-placeholder">
                            <span>👤</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="emagazine-card-content">
                        <div className="emagazine-card-header">
                          <span className="emagazine-card-language">{magazine.language}</span>
                          <span className="emagazine-card-date">
                            {magazine.month} {magazine.year}
                          </span>
                        </div>

                        <h3 className={`emagazine-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                          {magazine.title}
                        </h3>

                        <div className="emagazine-card-meta">
                          <div className="emagazine-card-meta-item">
                            <span className="emagazine-card-meta-label">
                              {language === 'hindi' ? 'लेखक' : 'Writer'}:
                            </span>
                            <span className={`emagazine-card-meta-value ${language === 'hindi' ? 'hindi' : ''}`}>
                              {magazine.writer}
                            </span>
                          </div>
                          <div className="emagazine-card-meta-item">
                            <span className="emagazine-card-meta-label">
                              {language === 'hindi' ? 'श्रेणी' : 'Category'}:
                            </span>
                            <span className={`emagazine-card-meta-value ${language === 'hindi' ? 'hindi' : ''}`}>
                              {magazine.category}
                            </span>
                          </div>
                          <div className="emagazine-card-meta-item">
                            <span className="emagazine-card-meta-label">
                              {language === 'hindi' ? 'विषय' : 'Subject'}:
                            </span>
                            <span className={`emagazine-card-meta-value ${language === 'hindi' ? 'hindi' : ''}`}>
                              {magazine.subject}
                            </span>
                          </div>
                        </div>

                        {magazine.introduction && (
                          <div 
                            className="emagazine-card-intro"
                            dangerouslySetInnerHTML={{ 
                              __html: magazine.introduction.substring(0, 150) + '...' 
                            }}
                          />
                        )}

                        <div className="emagazine-card-read-more">
                          {language === 'hindi' ? 'पूरा पढ़ें →' : 'Read More →'}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="emagazine-pagination">
                  <button
                    className="emagazine-pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    {language === 'hindi' ? '← पिछला' : '← Previous'}
                  </button>
                  
                  <span className="emagazine-pagination-info">
                    {language === 'hindi' 
                      ? `पृष्ठ ${currentPage} का ${totalPages}` 
                      : `Page ${currentPage} of ${totalPages}`}
                  </span>
                  
                  <button
                    className="emagazine-pagination-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    {language === 'hindi' ? 'अगला →' : 'Next →'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default EMagazinePage

