import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fetchPanchangData, fetchPopularCities } from '../services/api'

const Panchang = ({ language }) => {
  const [panchangData, setPanchangData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Always use today's date for main page
  const selectedDate = new Date()
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Initialize with default location (Bhopal)
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const cities = await fetchPopularCities()
        if (cities && cities.length > 0) {
          // Try to find Bhopal or use first city
          const bhopal = cities.find(c => c.name?.toLowerCase().includes('bhopal'))
          setSelectedLocation(bhopal || cities[0])
        } else {
          // Fallback default location
          setSelectedLocation({
            id: 1,
            name: 'Bhopal',
            state: 'Madhya Pradesh',
            coordinates: { latitude: 23.2599, longitude: 77.4126 }
          })
        }
      } catch (err) {
        console.error('Error initializing location:', err)
        // Fallback default location
        setSelectedLocation({
          id: 1,
          name: 'Bhopal',
          state: 'Madhya Pradesh',
          coordinates: { latitude: 23.2599, longitude: 77.4126 }
        })
      }
    }
    initializeLocation()
  }, [])

  // Fetch panchang data - always use today's date
  useEffect(() => {
    const loadPanchangData = async () => {
      // Use default location if selectedLocation is not set yet
      const defaultLat = 23.2599 // Bhopal
      const defaultLon = 77.4126 // Bhopal
      
      setLoading(true)
      setError(null)

      try {
        const lat = selectedLocation?.coordinates?.latitude || selectedLocation?.lat || defaultLat
        const lon = selectedLocation?.coordinates?.longitude || selectedLocation?.lon || defaultLon
        const today = new Date() // Always use today's date
        
        const data = await fetchPanchangData({
          date: today,
          lat,
          lon,
          language
        })

        // Handle different response structures
        if (data) {
          // Normalize the data structure
          let normalizedData = null
          
          if (data.details) {
            normalizedData = data
          } else if (data.response) {
            if (data.response.details) {
              normalizedData = data.response
            } else {
              normalizedData = data.response
            }
          } else if (data.data) {
            if (data.data.details) {
              normalizedData = data.data
            } else {
              normalizedData = data.data
            }
          } else {
            // Try using data directly
            normalizedData = data
          }
          
          // Check if we have details or if the data itself is the details
          if (normalizedData && (normalizedData.details || Object.keys(normalizedData).length > 0)) {
            setPanchangData(normalizedData)
            setError(null)
          } else {
            console.error('Unexpected panchang data structure:', data)
            setError('Invalid data format received')
            setPanchangData(null)
          }
        } else {
          setError('No data received')
          setPanchangData(null)
        }
      } catch (err) {
        console.error('Error fetching panchang:', err)
        setError(err.message || 'Failed to load panchang data')
      } finally {
        setLoading(false)
      }
    }

    // Always try to load data (use default location if selectedLocation is null)
    // Reload when location or language changes
    loadPanchangData()
  }, [selectedLocation, language])

  // Format panchang data for display
  const formatPanchangData = () => {
    if (!panchangData) {
      return []
    }
    
    // Handle different data structures - normalize to get details
    let details = null
    if (panchangData.details) {
      details = panchangData.details
    } else if (panchangData.response && panchangData.response.details) {
      details = panchangData.response.details
    } else if (panchangData.data && panchangData.data.details) {
      details = panchangData.data.details
    } else if (typeof panchangData === 'object' && !panchangData.response && !panchangData.data) {
      // If panchangData itself is the details object
      details = panchangData
    }
    
    if (!details) {
      return []
    }

    // Helper function to safely get value - more lenient
    const getValue = (primaryKey, altKey = null, samayKey = null) => {
      // Try primary key first
      let value = details[primaryKey]
      
      // Try alternative key if primary is not found
      if ((!value || value === null || value === undefined || value === '') && altKey) {
        value = details[altKey]
      }
      
      // Try camelCase variations
      if (!value || value === null || value === undefined || value === '') {
        const camelCaseKey = primaryKey.charAt(0).toLowerCase() + primaryKey.slice(1)
        value = details[camelCaseKey]
      }
      
      // Try uppercase variations
      if (!value || value === null || value === undefined || value === '') {
        const upperKey = primaryKey.toUpperCase()
        value = details[upperKey]
      }
      
      // Try lowercase variations
      if (!value || value === null || value === undefined || value === '') {
        const lowerKey = primaryKey.toLowerCase()
        value = details[lowerKey]
      }
      
      // Check if value is valid (not null, undefined, or empty string)
      if (value === null || value === undefined || value === '') {
        return ''
      }
      
      // Convert to string and trim (handle numbers, objects, etc.)
      let stringValue = ''
      if (typeof value === 'object') {
        // If it's an object, try to stringify or get a meaningful value
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value).trim()
      }
      
      // Add samay if available
      if (samayKey && stringValue) {
        let samay = details[samayKey]
        if (!samay && samayKey.toLowerCase() !== samayKey) {
          samay = details[samayKey.toLowerCase()]
        }
        if (samay && samay !== null && samay !== undefined && String(samay).trim() !== '') {
          stringValue = `${stringValue} ${String(samay).trim()}`.trim()
        }
      }
      
      return stringValue
    }

    // Main information fields only (essential panchang data)
    const mainFields = [
      { 
        label: 'Tithi', 
        labelHi: 'तिथि', 
        value: getValue('tithi', null, 'tithiSamay'),
        valueHi: getValue('tithi', null, 'tithiSamay')
      },
      { 
        label: 'Paksha', 
        labelHi: 'पक्ष', 
        value: getValue('paksha'),
        valueHi: getValue('paksha')
      },
      { 
        label: 'Solar Maah', 
        labelHi: 'सौर मास', 
        value: getValue('solarMaah', 'day', null),
        valueHi: getValue('solarMaah', 'day', null)
      },
      { 
        label: 'Nakshatra', 
        labelHi: 'नक्षत्र', 
        value: getValue('nakshatra', null, 'nakshatraSamay'),
        valueHi: getValue('nakshatra', null, 'nakshatraSamay')
      },
      { 
        label: 'Yoga', 
        labelHi: 'योग', 
        value: getValue('yoga', null, 'yogaSamay'),
        valueHi: getValue('yoga', null, 'yogaSamay')
      },
      { 
        label: 'Ayan', 
        labelHi: 'अयन', 
        value: getValue('ayan'),
        valueHi: getValue('ayan')
      },
      { 
        label: 'Rashi', 
        labelHi: 'राशि', 
        value: getValue('rashi', null, 'rashiSamay'),
        valueHi: getValue('rashi', null, 'rashiSamay')
      },
      { 
        label: 'Karan', 
        labelHi: 'करण', 
        value: getValue('karan', null, 'karanSamay'),
        valueHi: getValue('karan', null, 'karanSamay')
      },
    ]

    const filteredMainFields = mainFields.filter(item => item.value && item.value.trim() !== '')
    
    return {
      mainFields: filteredMainFields,
      details: details
    }
  }

  // Get Nakshatra Charan data
  const getNakshatraCharan = () => {
    if (!panchangData) return []
    
    let details = null
    if (panchangData.details) {
      details = panchangData.details
    } else if (panchangData.response && panchangData.response.details) {
      details = panchangData.response.details
    } else if (panchangData.data && panchangData.data.details) {
      details = panchangData.data.details
    } else if (typeof panchangData === 'object' && !panchangData.response && !panchangData.data) {
      details = panchangData
    }
    
    if (!details) return []
    
    const charanData = []
    const padaKeys = ['padaSamay', 'padaSamay2', 'padaSamay3', 'padaSamay4']
    
    padaKeys.forEach((key, index) => {
      const padaSamay = details[key]
      if (padaSamay) {
        const currentPada = (parseInt(details.pada || 1) + index) % 4 || 4
        const nakshatraName = index < (5 - parseInt(details.pada || 1))
          ? details.nakshatra
          : details.nakshatra2 || details.nakshatra
        
        charanData.push({
          pada: currentPada,
          nakshatra: nakshatraName,
          samay: padaSamay
        })
      }
    })
    
    return charanData
  }

  const formattedData = panchangData ? formatPanchangData() : { mainFields: [], details: null }
  const displayData = formattedData.mainFields || []
  const nakshatraCharan = panchangData ? getNakshatraCharan() : []
  
  // Get details from various possible structures
  let details = null
  if (panchangData) {
    if (panchangData.details) {
      details = panchangData.details
    } else if (panchangData.response && panchangData.response.details) {
      details = panchangData.response.details
    } else if (panchangData.data && panchangData.data.details) {
      details = panchangData.data.details
    } else {
      // If panchangData itself is the details object
      details = panchangData
    }
  }
  
  // Build header info from details
  const buildHeaderInfo = () => {
    if (!details) {
      return language === 'hindi' 
        ? 'मार्गशीर्ष, कृष्ण पक्ष, पंचमी, मंगलवार, आश्लेषा'
        : 'Margasirsa, Krishna Paksha, panchami, Tuesday, Ashlesha'
    }
    
    const parts = []
    
    // Month
    const month = details.purnimantMaah || details.solarMaah || details.maas || details.month
    if (month) parts.push(month)
    
    // Paksha
    if (details.paksha) parts.push(details.paksha)
    
    // Tithi
    if (details.tithi) parts.push(details.tithi)
    
    // Day
    const day = details.hinduDay || details.day || details.vaar
    if (day) parts.push(day)
    
    // Nakshatra
    if (details.nakshatra) parts.push(details.nakshatra)
    
    return parts.length > 0 ? parts.join(', ') : (language === 'hindi' 
      ? 'मार्गशीर्ष, कृष्ण पक्ष, पंचमी, मंगलवार, आश्लेषा'
      : 'Margasirsa, Krishna Paksha, panchami, Tuesday, Ashlesha')
  }
  
  const headerInfo = buildHeaderInfo()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  }

  return (
    <motion.section 
      id="panchang" 
      className="panchang-section"
      initial="hidden"
      animate="visible"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="panchang-wrapper">
        <motion.div
          className="panchang-card-slim"
          variants={cardVariants}
        >
          {/* Title */}
          <motion.div 
            className="panchang-title-bar"
            initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
            <h2 className={`panchang-main-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'आज का पंचांग' : "Today's Panchang"}
            </h2>
          </motion.div>

          {/* Yellow Banner */}
          <motion.div 
            className="panchang-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <div className="panchang-banner-indicator"></div>
            <p className={`panchang-banner-text ${language === 'hindi' ? 'hindi' : ''}`}>
              {headerInfo}
            </p>
          </motion.div>

          {/* Scrollable Table Content */}
          <div className="panchang-scroll-container">
            {loading ? (
              <div className="panchang-loading">
                <div className="panchang-spinner"></div>
                <p className={language === 'hindi' ? 'hindi' : ''}>
                  {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
                </p>
              </div>
            ) : error ? (
              <div className="panchang-error">
                <p className={language === 'hindi' ? 'hindi' : ''}>
                  {language === 'hindi' ? 'डेटा लोड करने में त्रुटि' : 'Error loading data'}
                </p>
              </div>
            ) : (
              <motion.div 
                className="panchang-table-content"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                  }
                }}
              >
                {/* Main Information Section */}
                {displayData.length > 0 && (
                  <>
                    <div className="panchang-section-header">
                      <h3 className={`panchang-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
                        {language === 'hindi' ? 'मुख्य जानकारी' : 'Main Information'}
                      </h3>
                    </div>
                    {displayData.map((item, index) => {
                      const displayLabel = language === 'hindi' ? item.labelHi : item.label
                      const displayValue = language === 'hindi' ? item.valueHi : item.value
                      
                      if (!displayValue || displayValue.trim() === '') {
                        return null
                      }
                      
                      return (
                        <motion.div
                          key={`${item.label}-${index}`}
                          className="panchang-row"
                          initial="hidden"
                          animate="visible"
                          variants={rowVariants}
                          whileHover={{ 
                            backgroundColor: "#FFF8F0",
                            x: 4,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className={`panchang-row-label ${language === 'hindi' ? 'hindi' : ''}`}>
                            {displayLabel}
                          </div>
                          <div className={`panchang-row-value ${language === 'hindi' ? 'hindi' : ''}`}>
                            {displayValue}
                          </div>
                        </motion.div>
                      )
                    })}
                  </>
                )}

                {/* Nakshatra Charan Section */}
                {nakshatraCharan.length > 0 && (
                  <>
                    <div className="panchang-section-header" style={{ marginTop: '24px' }}>
                      <h3 className={`panchang-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
                        {language === 'hindi' ? 'नक्षत्र चरण' : 'Nakshatra Charan'}
                      </h3>
                    </div>
                    {nakshatraCharan.map((charan, index) => {
                      const capitalize = (str) => {
                        if (!str) return ''
                        return str.charAt(0).toUpperCase() + str.slice(1)
                      }
                      
                      return (
                        <motion.div
                          key={`charan-${index}`}
                          className="panchang-row"
                          initial="hidden"
                          animate="visible"
                          variants={rowVariants}
                          whileHover={{ 
                            backgroundColor: "#FFF8F0",
                            x: 4,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className={`panchang-row-label ${language === 'hindi' ? 'hindi' : ''}`}>
                            {capitalize(charan.nakshatra)} {language === 'hindi' ? 'चरण' : 'Charan'} {charan.pada}:
                          </div>
                          <div className={`panchang-row-value ${language === 'hindi' ? 'hindi' : ''}`}>
                            {charan.samay}
                          </div>
                        </motion.div>
                      )
                    })}
                  </>
                )}

                {/* Empty State */}
                {displayData.length === 0 && nakshatraCharan.length === 0 && panchangData && (
                  <div className="panchang-empty">
                    <p className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'डेटा प्राप्त हुआ लेकिन प्रदर्शित करने योग्य फ़ील्ड नहीं मिले' : 'Data received but no displayable fields found'}
                    </p>
                  </div>
                )}
                
                {!panchangData && !loading && !error && (
                  <div className="panchang-empty">
                    <p className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
          
          {/* Footer Button */}
          <motion.div 
            className="panchang-btn-footer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/panchang">
              <motion.div
                className="panchang-know-more"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'hindi' ? 'और जानें' : 'Know More'}
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Panchang
