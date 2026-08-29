import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useChrome } from '../contexts/ChromeContext'
import { SERVICES } from '../data/site'

const EASE = [0.22, 1, 0.36, 1]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.015 } } }
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: .28, ease: EASE } },
}

/**
 * Every service, on the first screen. This grid is both the storefront and the
 * primary navigation, so nothing is hidden behind a toggle or a carousel.
 */
const ServiceTile = ({ service, hi, onAppOnly }) => {
  const label = hi ? service.nameHi : service.name
  const body = (
    <>
      <span className="svc__tile" aria-hidden="true">
        {service.icon
          ? <img src={service.icon} alt="" loading="eager" decoding="async" />
          : <service.Glyph s={22} />}
      </span>
      <span className="svc__name">{label}</span>
    </>
  )

  if (!service.path) {
    return (
      <motion.div className="svc svc--soon" variants={item} aria-disabled="true">
        {body}
      </motion.div>
    )
  }

  if (service.appOnly) {
    return (
      <motion.div variants={item} className="svc__cell">
        <button type="button" className="svc" onClick={() => onAppOnly(label)}>{body}</button>
      </motion.div>
    )
  }

  if (service.path.startsWith('/#')) {
    return <motion.a href={service.path} className="svc" variants={item}>{body}</motion.a>
  }

  return (
    <motion.div variants={item} className="svc__cell">
      <Link to={service.path} className="svc">{body}</Link>
    </motion.div>
  )
}

const Services = ({ language }) => {
  const hi = language === 'hindi'
  const { openAppPrompt } = useChrome()

  return (
    <section id="services" className="services">
      <div className="u-shell">
        <div className="services__bar">
          <h2>{hi ? 'आज आप क्या जानना चाहते हैं?' : 'What would you like guidance on today?'}</h2>
        </div>

        <motion.div
          className="svc-grid"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {SERVICES.map((service) => (
            <ServiceTile key={service.id} service={service} hi={hi} onAppOnly={openAppPrompt} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Services
