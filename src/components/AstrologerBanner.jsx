import React from 'react'
import { motion } from 'framer-motion'
import astrologerImg from '../assets/icons/astrologer.jpeg'

const AstrologerBanner = ({ language }) => {
  const features = [
    { textHi: 'पहली कॉल निःशुल्क', textEn: 'First Call Free' },
    { textHi: '500+ प्रमाणित ज्योतिषी', textEn: '500+ Certified Astrologers' },
    { textHi: '24/7 उपलब्ध', textEn: '24/7 Available' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const slideUpVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  }

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  const slideLeftVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <motion.section 
      id="chat" 
      className="astrologer-banner"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="container">
          <motion.div
          className="astrologer-banner-inner"
          variants={slideUpVariants}
        >
          <div className="astrologer-content">
          {/* Astrologer Image */}
          <motion.div
            className="astrologer-image-wrapper"
              variants={scaleInVariants}
          >
            <motion.img
              src={astrologerImg}
              alt="Expert Astrologer"
              className="astrologer-image"
                animate={{ 
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    "0 8px 24px rgba(0, 0, 0, 0.15)",
                    "0 12px 35px rgba(0, 0, 0, 0.2)",
                    "0 8px 24px rgba(0, 0, 0, 0.15)"
                  ]
                }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Content */}
          <div className="astrologer-text">
            <motion.h2
                variants={slideLeftVariants}
              className={language === 'hindi' ? 'hindi' : ''}
            >
              {language === 'hindi' 
                ? 'अनुभवी ज्योतिषियों से तुरंत बात करें' 
                : 'Talk to Experienced Astrologers Instantly'}
            </motion.h2>

              <motion.div 
                className="astrologer-features"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                  }
                }}
              >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-badge"
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.9 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { type: "spring", stiffness: 150, damping: 12 }
                      }
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
                    }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className={language === 'hindi' ? 'hindi' : ''}>
                    {language === 'hindi' ? feature.textHi : feature.textEn}
                  </span>
                </motion.div>
              ))}
              </motion.div>

            <motion.div
              className="astrologer-actions"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.5, type: "spring", stiffness: 100 }
                  }
                }}
            >
              <motion.button
                className="btn-call"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -4,
                    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.4)"
                  }}
                whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 6px 20px rgba(255, 107, 53, 0.4)",
                      "0 8px 30px rgba(255, 107, 53, 0.5)",
                      "0 6px 20px rgba(255, 107, 53, 0.4)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className={language === 'hindi' ? 'hindi' : ''}>
                  {language === 'hindi' ? 'अभी कॉल करें' : 'Call Now'}
                </span>
              </motion.button>

              <motion.button
                className="btn-chat"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -3,
                    borderColor: "#FF6B35"
                  }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className={language === 'hindi' ? 'hindi' : ''}>
                  {language === 'hindi' ? 'चैट करें' : 'Chat Now'}
                </span>
              </motion.button>
            </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default AstrologerBanner
