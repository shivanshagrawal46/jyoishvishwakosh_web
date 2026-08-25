import React from 'react'
import { Link } from 'react-router-dom'
import { useChrome } from '../contexts/ChromeContext'
import { SERVICES } from '../data/site'

/**
 * Secondary navigation for inner pages. Reads the canonical service list so it
 * can never drift from the landing grid, and draws the same glyph set.
 */

/** Call sites predate the canonical ids, so translate rather than touch 30 pages. */
const ID_ALIASES = {
  'e-pooja': 'epooja',
  'e-magazine': 'emagazine',
  'ank-jyotish': 'ankjyotish',
  'ank-fal': 'ankfal',
  'hasth-rekha': 'hasthrekha',
  'ai-jyotish': 'aijyotish',
  'ai-numerology': 'ainumero',
  'ai-ank': 'ainumero',
  'divine-quotes': 'quotes',
  'mantra-tantra': 'mantra',
  'chalisa-aarti': 'chalisa',
  calculations: 'calculator',
}

const ServicesStrip = ({ language = 'hindi', activeService = null }) => {
  const hi = language === 'hindi'
  const active = ID_ALIASES[activeService] || activeService
  const { openAppPrompt } = useChrome()

  return (
    <nav className="services-strip" aria-label={hi ? 'सेवाएं' : 'Services'}>
      <div className="services-strip-track no-bar">
        {SERVICES.map((service) => {
          const isActive = active === service.id
          const label = hi ? service.nameHi : service.name
          const content = (
            <>
              <span className="services-strip-icon">
                <img src={service.icon} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="services-strip-name">{label}</span>
            </>
          )

          const className = `services-strip-item${isActive ? ' active' : ''}`
          const props = isActive ? { 'aria-current': 'page' } : {}

          if (service.appOnly) {
            return (
              <button
                key={service.id}
                type="button"
                className={className}
                onClick={() => openAppPrompt(label)}
              >
                {content}
              </button>
            )
          }

          return service.path.startsWith('/#') ? (
            <a key={service.id} href={service.path} className={className} {...props}>
              {content}
            </a>
          ) : (
            <Link key={service.id} to={service.path} className={className} {...props}>
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default ServicesStrip
