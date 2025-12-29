import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPrashanYantraData } from '../services/api'
import hanumanjiImg from '../assets/icons/hanumanji_icon.jfif'

const PrashanYantraPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const [showInstruction, setShowInstruction] = useState(true)
  const [prashanData, setPrashanData] = useState([])
  const [shuffledData, setShuffledData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [selectedNumberIndex, setSelectedNumberIndex] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  // Generate pyramid structure: 3, 5, 7, 9, [49], 9, 7, 5, 3 (total 49)
  const pyramidRows = [
    [1, 2, 3],                    // 3 numbers
    [4, 5, 6, 7, 8],             // 5 numbers
    [9, 10, 11, 12, 13, 14, 15], // 7 numbers
    [16, 17, 18, 19, 20, 21, 22, 23, 24], // 9 numbers (line 4)
    [49],                         // 1 number (perfect middle between line 4 and line 5)
    [25, 26, 27, 28, 29, 30, 31, 32, 33], // 9 numbers (line 5)
    [34, 35, 36, 37, 38, 39, 40], // 7 numbers
    [41, 42, 43, 44, 45],        // 5 numbers
    [46, 47, 48]                 // 3 numbers
  ]

  // Fetch data from API and shuffle it
  useEffect(() => {
    const fetchPrashanData = async () => {
      try {
        setLoading(true)
        const data = await fetchPrashanYantraData()
        setPrashanData(data)
        
        // Shuffle the data randomly every time the page is visited
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setShuffledData(shuffled)
      } catch (error) {
        console.error('Error fetching prashan data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrashanData()
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  const handleNumberClick = (number, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (loading || shuffledData.length === 0) {
      console.warn('Data not loaded yet')
      return
    }
    
    const index = number - 1
    if (shuffledData[index]) {
      setSelectedNumber(shuffledData[index])
      setSelectedNumberIndex(number)
      setShowAnswer(true)
    } else {
      console.warn('No data available for number:', number, 'at index:', index)
    }
  }

  const closeAnswer = () => {
    setShowAnswer(false)
    setSelectedNumber(null)
    setSelectedNumberIndex(null)
  }

  const closeInstruction = () => {
    setShowInstruction(false)
  }

  const getContentForNumber = (number) => {
    const index = number - 1
    return shuffledData[index]?.content || ''
  }

  // Debug effect
  useEffect(() => {
    if (showAnswer) {
      console.log('Answer modal should be visible:', { 
        showAnswer, 
        selectedNumber: !!selectedNumber, 
        selectedNumberIndex,
        hasContent: !!selectedNumber?.content
      })
    }
  }, [showAnswer, selectedNumber, selectedNumberIndex])

  return (
    <>
      <Header language={language} setLanguage={handleLanguageChange} />
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Instruction Modal */}
          <AnimatePresence>
            {showInstruction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="instruction-modal-overlay"
                onClick={closeInstruction}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '20px'
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    position: 'relative',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <button
                    onClick={closeInstruction}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ×
                  </button>
                  
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '20px',
                    marginTop: '0'
                  }}>
                    Instruction
                  </h2>
                  
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#555',
                    marginBottom: '20px'
                  }}>
                    <p style={{ marginBottom: '12px' }}>
                      <strong>हिंदी:</strong> यदि आपके मन में किसी भी बात की चिंता है या कोई समस्या है, तो इसके माध्यम से उसका समाधान मिलेगा। 
                      <strong> नियम-</strong> श्री हनुमानजी को याद करें और अपने प्रश्न पर ध्यान केंद्रित करके सोचें। किसी भी संख्या पर अनामिका (रिंग फिंगर) रखें। उसका उत्तर जानें। एक प्रश्न का उत्तर केवल एक बार देखना उचित होगा। 
                      <strong> सावधानी-</strong> यदि प्रश्न से संबंधित कोई प्रश्न है, तो आचार्य (गुरुजी) से संपर्क करें।
                    </p>
                    <p>
                      <strong>English:</strong> If you are worried about anything or have any problem, then its solution will be found through this. 
                      <strong> Rule-</strong> You should remember Shri Hanumanji and think about your question with concentration. Place the ring finger on any number. Know its answer. It would be appropriate to see the answer to a question only once. 
                      <strong> Caution-</strong> If you have any query related to the question then contact Acharya (Guruji).
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right', marginTop: '24px' }}>
                    <button
                      onClick={closeInstruction}
                      style={{
                        backgroundColor: '#FF6B35',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e55a2b'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B35'}
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prashan Yantra Card */}
          <div className="prashan-yantra-card" style={{ marginTop: '40px' }}>
            <div className="prashan-yantra-header">
              <h3 className={`prashan-yantra-title ${language === 'hindi' ? 'hindi' : ''}`}>
                {language === 'hindi' ? 'प्रश्न यंत्र' : 'Prashan Yantra'}
              </h3>
              <p className={`prashan-yantra-subtitle ${language === 'hindi' ? 'hindi' : ''}`}>
                {language === 'hindi' ? 'हनुमत प्रश्नावली' : 'Hanumat Prashanwali'}
              </p>
            </div>

            <div className="prashan-yantra-content">
              <div 
                className="prashan-yantra-bg"
                style={{
                  backgroundImage: `url(${hanumanjiImg})`,
                }}
              ></div>
              
              {loading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '400px',
                  fontSize: '18px',
                  color: '#666'
                }}>
                  {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
                </div>
              ) : (
                <div className="prashan-yantra-pyramid">
                  {pyramidRows.map((row, rowIndex) => (
                    <motion.div
                      key={rowIndex}
                      className={`prashan-yantra-row ${row.length === 1 ? 'prashan-yantra-single' : ''}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: rowIndex * 0.05 }}
                    >
                      {row.map((num) => (
                        <motion.div
                          key={num}
                          className="prashan-yantra-number"
                          whileHover={{ 
                            scale: 1.15,
                            boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleNumberClick(num, e)
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                        >
                          {num}
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Answer Modal */}
          <AnimatePresence>
            {showAnswer && selectedNumber && selectedNumberIndex && (
              <motion.div
                key="answer-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="answer-modal-overlay"
                onClick={closeAnswer}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '20px'
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    position: 'relative',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                  }}
                >
                  <button
                    onClick={closeAnswer}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ×
                  </button>
                  
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000',
                    marginBottom: '16px',
                    marginTop: '0'
                  }}>
                    {language === 'hindi' ? `उत्तर - संख्या ${selectedNumberIndex}` : `Answer - Number ${selectedNumberIndex}`}
                  </h2>
                  
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#000000',
                    whiteSpace: 'pre-line',
                    fontWeight: '500'
                  }}>
                    {selectedNumber.content}
                  </div>
                  
                  <div style={{ textAlign: 'right', marginTop: '24px' }}>
                    <button
                      onClick={closeAnswer}
                      style={{
                        backgroundColor: '#FF6B35',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e55a2b'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B35'}
                    >
                      {language === 'hindi' ? 'बंद करें' : 'Close'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </>
  )
}

export default PrashanYantraPage

