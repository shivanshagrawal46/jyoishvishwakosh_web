import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fetchDailyMuhuratData, fetchPopularCities } from '../services/api'

const TodayMuhurat = ({ language }) => {
  const [activeTab, setActiveTab] = useState('yoga')
  const [muhuratData, setMuhuratData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Initialize location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const cities = await fetchPopularCities()
        if (cities && cities.length > 0) {
          const bhopal = cities.find(c => c.name?.toLowerCase().includes('bhopal'))
          setSelectedLocation(bhopal || cities[0])
        } else {
          setSelectedLocation({
            id: 1,
            name: 'Bhopal',
            state: 'Madhya Pradesh',
            coordinates: { latitude: 23.2599, longitude: 77.4126 }
          })
        }
      } catch (err) {
        console.error('Error initializing location:', err)
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

  // Fetch muhurat data
  useEffect(() => {
    const loadMuhuratData = async () => {
      if (!selectedLocation) return

      setLoading(true)
      setError(null)

      try {
        const lat = selectedLocation?.coordinates?.latitude || selectedLocation?.lat || 23.2599
        const lon = selectedLocation?.coordinates?.longitude || selectedLocation?.lon || 77.4126
        const today = new Date()

        const data = await fetchDailyMuhuratData({
          date: today,
          lat,
          lon,
          language
        })

        if (data) {
          // Transform API data to component format
          const transformedData = {
            yoga: (data.yogas || []).slice(0, 7).map(item => ({
              label: item.name || '',
              labelHi: item.name || '',
              value: item.value || item.time || '',
              valueHi: item.value || item.time || ''
            })),
            choghadiya: [
              ...(data.choghadiya?.day || []).slice(0, 4).map(item => ({
                label: item.name || '',
                labelHi: item.name || '',
                value: item.value || item.time || '',
                valueHi: item.value || item.time || ''
              }))
            ],
            dayMahurat: [
              ...(data.dayMahurat?.day || []).slice(0, 3).map(item => ({
                label: item.name || '',
                labelHi: item.name || '',
                value: item.value || item.time || '',
                valueHi: item.value || item.time || ''
              }))
            ]
          }
          setMuhuratData(transformedData)
        } else {
          setError('No data received')
        }
      } catch (err) {
        console.error('Error fetching muhurat data:', err)
        setError(err.message || 'Failed to load muhurat data')
        // Fallback to empty data structure
        setMuhuratData({
          yoga: [],
          choghadiya: [],
          dayMahurat: []
        })
      } finally {
        setLoading(false)
      }
    }

    loadMuhuratData()
  }, [selectedLocation, language])

  const tabs = [
    { id: 'yoga', name: 'Yoga', nameHi: 'योग' },
    { id: 'choghadiya', name: 'Choghadiya', nameHi: 'चौघड़िया' },
    { id: 'dayMahurat', name: 'Day Mahurat', nameHi: 'दिन मुहूर्त' },
  ]

  const currentData = muhuratData?.[activeTab] || []

  return (
    <div className="today-muhurat-card">
      <div className="muhurat-title-bar">
        <h3 className={`muhurat-main-title ${language === 'hindi' ? 'hindi' : ''}`}>
          {language === 'hindi' ? "आज का मुहूर्त" : "Today's Muhurat"}
        </h3>
      </div>

      <div className="muhurat-tabs">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`muhurat-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {language === 'hindi' ? tab.nameHi : tab.name}
          </motion.button>
        ))}
      </div>

      <div className="muhurat-scroll-container">
        {loading ? (
          <div className="muhurat-loading">
            <div className="muhurat-spinner"></div>
            <p className={language === 'hindi' ? 'hindi' : ''}>
              {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
            </p>
          </div>
        ) : error ? (
          <div className="muhurat-error">
            <p className={language === 'hindi' ? 'hindi' : ''}>
              {language === 'hindi' ? 'डेटा लोड नहीं हो सका' : 'Failed to load data'}
            </p>
          </div>
        ) : currentData.length > 0 ? (
          <motion.div 
            className="muhurat-table-content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentData.map((item, index) => (
              <motion.div
                key={index}
                className="muhurat-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: "#FFF8F0", x: 4 }}
              >
                <div className={`muhurat-row-label ${language === 'hindi' ? 'hindi' : ''}`}>
                  {item.label || ''}
                </div>
                <div className={`muhurat-row-value ${language === 'hindi' ? 'hindi' : ''}`}>
                  {item.value || ''}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="muhurat-empty">
            <p className={language === 'hindi' ? 'hindi' : ''}>
              {language === 'hindi' ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
            </p>
          </div>
        )}
      </div>

      <div className="muhurat-btn-footer">
        <Link to="/dainik-muhurat" className="muhurat-know-more-link">
          <motion.button
            className="muhurat-know-more"
            whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)" }}
            whileTap={{ scale: 0.97 }}
          >
            {language === 'hindi' ? 'और जानें' : 'Know More'}
          </motion.button>
        </Link>
      </div>
    </div>
  )
}

export default TodayMuhurat

