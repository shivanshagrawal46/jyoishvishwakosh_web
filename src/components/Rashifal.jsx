import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionHeader } from './ui'
import RailArrows from './ui/RailArrows'
import { ZODIAC } from './ui/Zodiac'

const EASE = [0.22, 1, 0.36, 1]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.035 } } }
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: .32, ease: EASE } },
}

const Rashifal = ({ language }) => {
  const hi = language === 'hindi'
  const railRef = useRef(null)

  return (
    <section id="rashifal" className="u-section u-section--warm">
      <div className="u-shell">
        <SectionHeader
          language={language}
          eyebrow={hi ? 'राशिफल' : 'Horoscope'}
          title={hi ? 'आज आपकी राशि क्या कहती है' : 'What your sign says today'}
          linkTo="/rashi-fal"
          linkLabel={hi ? 'सभी राशियां' : 'All signs'}
        />

        {/* A grid on desktop, a snap rail on a phone — the arrows hide
            themselves whenever there is nothing to scroll. */}
        <div className="u-railwrap">
          <motion.ul
            ref={railRef}
            className="zodiac no-bar"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {ZODIAC.map(({ id, name, nameHi, Glyph }) => (
              <motion.li key={id} variants={item} className="zodiac__cell">
                <Link to="/rashi-fal" className="zodiac__card">
                  <span className="zodiac__medallion"><Glyph s={30} /></span>
                  <span className="zodiac__name">{hi ? nameHi : name}</span>
                  {hi && <span className="zodiac__alt">{name}</span>}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <RailArrows targetRef={railRef} />
        </div>
      </div>
    </section>
  )
}

export default Rashifal
