import React, { useState } from 'react'
import { motion } from 'framer-motion'

const AINumerology = ({ language }) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('Numerology form submitted:', formData)
  }

  return (
    <div className="ai-numerology-card">
      <div className="numerology-title-bar">
        <h3 className={`numerology-main-title ${language === 'hindi' ? 'hindi' : ''}`}>
          {language === 'hindi' ? '🔢 AI अंक ज्योतिष' : '🔢 AI Numerology'}
        </h3>
      </div>

      <form className="numerology-form" onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="form-group">
          <label className="form-label">{language === 'hindi' ? 'नाम' : 'Name'}</label>
          <div className="form-input-wrapper">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={language === 'hindi' ? 'अपना नाम दर्ज करें' : 'Enter Your Name'}
              className="form-input"
              required
            />
            <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Birth Date Field */}
        <div className="form-group">
          <label className="form-label">{language === 'hindi' ? 'जन्म तिथि' : 'Date of Birth'}</label>
          <div className="form-input-wrapper">
            <input
              type="text"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              placeholder="DD / MM / YYYY"
              className="form-input"
              required
            />
            <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <motion.button
          type="submit"
          className="numerology-submit-btn"
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)" }}
          whileTap={{ scale: 0.98 }}
        >
          {language === 'hindi' ? 'अंक ज्योतिष जानें' : 'Get Numerology Report'}
        </motion.button>
      </form>
    </div>
  )
}

export default AINumerology

