import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import usePanchang from '../hooks/usePanchang'

/**
 * Home-page panchang card. Data comes from the Kundli API via usePanchang
 * (today, New Delhi or the place chosen on /panchang).
 */
const Panchang = ({ language }) => {
  const hi = language === 'hindi'
  const { rows, nakshatraCharan, summary, loading, error, details } = usePanchang({ language })

  const headerInfo = summary || (hi
    ? 'पंचांग लोड हो रहा है…'
    : 'Loading the panchang…')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
  }

  const Row = ({ label, value, k }) => (
    <motion.div
      key={k}
      className="panchang-row"
      initial="hidden"
      animate="visible"
      variants={rowVariants}
      whileHover={{ backgroundColor: '#FFF8F0', x: 4, transition: { duration: 0.2 } }}
    >
      <div className={`panchang-row-label ${hi ? 'hindi' : ''}`}>{label}</div>
      <div className={`panchang-row-value ${hi ? 'hindi' : ''}`}>{value}</div>
    </motion.div>
  )

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
        <motion.div className="panchang-card-slim" variants={cardVariants}>
          {/* Title */}
          <motion.div
            className="panchang-title-bar"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`panchang-main-title ${hi ? 'hindi' : ''}`}>
              {hi ? 'आज का पंचांग' : "Today's Panchang"}
            </h2>
          </motion.div>

          {/* Yellow Banner */}
          <motion.div
            className="panchang-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          >
            <div className="panchang-banner-indicator"></div>
            <p className={`panchang-banner-text ${hi ? 'hindi' : ''}`}>{headerInfo}</p>
          </motion.div>

          {/* Scrollable Table Content */}
          <div className="panchang-scroll-container">
            {loading ? (
              <div className="panchang-loading">
                <div className="panchang-spinner"></div>
                <p className={hi ? 'hindi' : ''}>{hi ? 'लोड हो रहा है...' : 'Loading...'}</p>
              </div>
            ) : error ? (
              <div className="panchang-error">
                <p className={hi ? 'hindi' : ''}>{hi ? 'डेटा लोड करने में त्रुटि' : 'Error loading data'}</p>
              </div>
            ) : (
              <motion.div
                className="panchang-table-content"
                initial="hidden"
                animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
              >
                {rows.length > 0 && (
                  <>
                    <div className="panchang-section-header">
                      <h3 className={`panchang-section-title ${hi ? 'hindi' : ''}`}>
                        {hi ? 'मुख्य जानकारी' : 'Main Information'}
                      </h3>
                    </div>
                    {rows.map((item) => <Row key={item.key} k={item.key} label={hi ? item.labelHi : item.label} value={item.value} />)}
                    {details?.rahu_kaal && (
                      <Row k="rahu" label={hi ? 'राहु काल' : 'Rahu Kaal'} value={`${details.rahu_kaal.start_clock} – ${details.rahu_kaal.end_clock}`} />
                    )}
                    {details?.abhijit_muhurta && details.abhijit_muhurta.valid !== false && (
                      <Row k="abhijit" label={hi ? 'अभिजीत मुहूर्त' : 'Abhijit Muhurat'} value={`${details.abhijit_muhurta.start_clock} – ${details.abhijit_muhurta.end_clock}`} />
                    )}
                    {details?.sunrise && (
                      <Row k="sun" label={hi ? 'सूर्योदय / सूर्यास्त' : 'Sunrise / Sunset'} value={`${details.sunrise.slice(11, 16)} / ${details.sunset.slice(11, 16)}`} />
                    )}
                  </>
                )}

                {nakshatraCharan.length > 0 && (
                  <>
                    <div className="panchang-section-header" style={{ marginTop: '24px' }}>
                      <h3 className={`panchang-section-title ${hi ? 'hindi' : ''}`}>
                        {hi ? 'नक्षत्र चरण' : 'Nakshatra Charan'}
                      </h3>
                    </div>
                    {nakshatraCharan.map((charan, index) => (
                      <Row key={`charan-${index}`} k={`charan-${index}`}
                        label={`${charan.nakshatra} ${hi ? 'चरण' : 'Charan'} ${charan.pada}:`}
                        value={`${charan.samay} ${hi ? 'तक' : ''}`.trim()} />
                    ))}
                  </>
                )}

                {rows.length === 0 && nakshatraCharan.length === 0 && (
                  <div className="panchang-empty">
                    <p className={hi ? 'hindi' : ''}>{hi ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}</p>
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
                whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                {hi ? 'और जानें' : 'Know More'}
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Panchang
