import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui'
import { IconCheck, IconPhone, IconWhatsapp } from './ui/Icons'
import { CONTACT } from '../data/site'
import astrologerImg from '../assets/icons/astrologer.jpeg'

const EASE = [0.22, 1, 0.36, 1]

const AstrologerBanner = ({ language }) => {
  const hi = language === 'hindi'

  const features = [
    { hi: 'पहली कॉल निःशुल्क', en: 'First call free' },
    { hi: 'अनुभवी ज्योतिषी', en: 'Experienced astrologers' },
    { hi: 'गोपनीय परामर्श', en: 'Private consultation' },
  ]

  return (
    <section id="chat" className="u-section u-section--tight">
      <div className="u-shell">
        <motion.div
          className="consult"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: .4, ease: EASE }}
        >
          <div className="consult__media">
            <img
              src={astrologerImg}
              alt={hi ? 'ज्योतिषी' : 'Astrologer'}
              loading="lazy"
              decoding="async"
              width="320"
              height="360"
            />
          </div>

          <div className="consult__body">
            <span className="u-eyebrow consult__eyebrow" lang={hi ? 'hi' : undefined}>
              {hi ? 'परामर्श' : 'Consultation'}
            </span>

            <h2 className="consult__title">
              {hi
                ? 'अनुभवी ज्योतिषियों से तुरंत बात करें'
                : 'Talk to experienced astrologers, right now'}
            </h2>

            <p className="consult__sub">
              {hi
                ? 'अपनी कुंडली, विवाह, करियर या स्वास्थ्य से जुड़े प्रश्न सीधे विशेषज्ञ से पूछें।'
                : 'Ask an expert directly about your chart, marriage, career or health.'}
            </p>

            <ul className="consult__features">
              {features.map((f) => (
                <li key={f.en}>
                  <IconCheck s={14} />
                  {hi ? f.hi : f.en}
                </li>
              ))}
            </ul>

            <div className="consult__actions">
              <Button href={`tel:${CONTACT.phone}`} size="lg">
                <IconPhone s={17} />
                {hi ? 'अभी कॉल करें' : 'Call now'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="consult__chat"
              >
                <IconWhatsapp s={17} />
                {hi ? 'चैट करें' : 'Chat now'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AstrologerBanner
