import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import hanumanjiImg from '../assets/icons/hanumanji_icon.jfif'

const PrashanYantra = ({ language }) => {
  const navigate = useNavigate()
  
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

  const handleCardClick = () => {
    navigate('/prashan-yantra')
  }

  return (
    <motion.div 
      className="prashan-yantra-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
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
        
        <div className="prashan-yantra-pyramid">
          {pyramidRows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className={`prashan-yantra-row ${row.length === 1 ? 'prashan-yantra-single' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
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
                >
                  {num}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default PrashanYantra

