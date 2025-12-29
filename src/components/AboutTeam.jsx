import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchAboutTeam } from '../services/api'

const AboutTeam = ({ language }) => {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAboutTeam()
        if (data && Array.isArray(data)) {
          // Filter only active members
          const activeMembers = data.filter(member => member.isActive)
          setTeamMembers(activeMembers)
        } else {
          console.warn('No data in response:', data)
        }
      } catch (err) {
        console.error('Error fetching team data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return `https://www.jyotishvishwakosh.in${imagePath}`
  }

  if (loading) {
    return (
      <motion.section 
        id="about-team" 
        className="about-team-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center',
            color: '#666'
          }}>
            {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
          </div>
        </div>
      </motion.section>
    )
  }

  if (error) {
    console.error('AboutTeam error:', error)
    return (
      <motion.section 
        id="about-team" 
        className="about-team-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center',
            color: '#d32f2f'
          }}>
            {language === 'hindi' ? 'टीम डेटा लोड करने में त्रुटि' : 'Error loading team data'}
            <br />
            <small>{error}</small>
          </div>
        </div>
      </motion.section>
    )
  }

  if (teamMembers.length === 0 && !loading) {
    return null // Don't show if no team members
  }

  return (
    <motion.section 
      id="about-team" 
      className="about-team-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div
          className="about-team-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="about-team-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{language === 'hindi' ? 'हमारी टीम' : 'Our Team'}</span>
          </div>

          <h2 className={`about-team-title ${language === 'hindi' ? 'hindi' : ''}`}>
            {language === 'hindi' ? 'हमारी टीम से मिलें' : 'Meet Our Team'}
          </h2>
          <p className={`about-team-subtitle ${language === 'hindi' ? 'hindi' : ''}`}>
            {language === 'hindi' 
              ? 'ज्योतिष विश्वकोष को आगे बढ़ाने वाले प्रतिभाशाली लोग' 
              : 'The talented people behind Jyotish Vishwakosh'}
          </p>
        </motion.div>

        {teamMembers.length > 0 ? (
          <motion.div
            className="about-team-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {teamMembers.map((member, index) => {
              const imageUrl = getImageUrl(member.image)
              
              return (
                <motion.div
                  key={member._id}
                  className="about-team-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="about-team-card-inner">
                    <div className="about-team-image-wrapper">
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={member.name}
                            className="about-team-image"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image load error for:', imageUrl)
                              e.target.style.display = 'none'
                              const placeholder = e.target.parentElement.querySelector('.about-team-image-placeholder')
                              if (placeholder) placeholder.style.display = 'flex'
                            }}
                          />
                          <div 
                            className="about-team-image-placeholder"
                            style={{ display: 'none' }}
                          >
                            <span>{member.name.charAt(0)}</span>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="about-team-image-placeholder"
                          style={{ display: 'flex' }}
                        >
                          <span>{member.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="about-team-image-border"></div>
                    </div>

                    <div className="about-team-card-content">
                      <h3 className={`about-team-member-name ${language === 'hindi' ? 'hindi' : ''}`}>
                        {member.name}
                      </h3>
                      <div className={`about-team-member-designation ${language === 'hindi' ? 'hindi' : ''}`}>
                        {member.designation}
                      </div>
                      {member.team_name && (
                        <div className="about-team-member-team">
                          {member.team_name}
                        </div>
                      )}
                      {member.details && member.details !== 'Om' && (
                        <p className={`about-team-member-details ${language === 'hindi' ? 'hindi' : ''}`}>
                          {member.details}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            color: '#666'
          }}>
            {language === 'hindi' ? 'कोई टीम सदस्य नहीं मिले' : 'No team members found'}
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default AboutTeam

