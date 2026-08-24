import React from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight } from './ui/Icons'

// The Hanumat Prashnavali grid: a diamond of 48 numbers around a central seed.
const ROWS = [
  [1, 2, 3],
  [4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23, 24],
  [49],
  [25, 26, 27, 28, 29, 30, 31, 32, 33],
  [34, 35, 36, 37, 38, 39, 40],
  [41, 42, 43, 44, 45],
  [46, 47, 48],
]

const PrashanYantra = ({ language }) => {
  const hi = language === 'hindi'

  return (
    <div className="aj">
      <div className="aj__head">
        <h3 className="aj__title">{hi ? 'प्रश्न यंत्र' : 'Prashan Yantra'}</h3>
        <p className="aj__note">
          {hi
            ? 'मन में प्रश्न रखें, एक अंक चुनें — हनुमत प्रश्नावली उत्तर देगी।'
            : 'Hold your question in mind, choose a number — the Hanumat Prashnavali answers.'}
        </p>
      </div>

      <div className="aj__body">
        <Link
          to="/prashan-yantra"
          className="aj-yantra"
          aria-label={hi ? 'हनुमत प्रश्नावली खोलें' : 'Open the Hanumat Prashnavali'}
        >
          <span className="aj-yantra__aura" aria-hidden="true" />
          {ROWS.map((row, i) => (
            <span className="aj-yrow" key={i} aria-hidden="true">
              {row.map((n) => (
                <span key={n} className={`aj-num${n === 49 ? ' aj-num--seed' : ''}`}>{n}</span>
              ))}
            </span>
          ))}
        </Link>
      </div>

      <div className="aj__foot">
        <Link to="/prashan-yantra" className="aj__link">
          {hi ? 'प्रश्न पूछें' : 'Ask your question'}<IconArrowRight s={15} />
        </Link>
      </div>
    </div>
  )
}

export default PrashanYantra
