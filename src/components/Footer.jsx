import React from 'react'
import { Link } from 'react-router-dom'
import { CONTACT, FOOTER_GROUPS } from '../data/site'
import { IconMail, IconPhone, IconWhatsapp, Ornament } from './ui/Icons'
import logoImg from '../assets/icons/logo_new.png'

const Footer = ({ language }) => {
  const hi = language === 'hindi'

  return (
    <footer className="sitefoot">
      <div className="u-shell sitefoot__inner">
        <div className="sitefoot__grid">
          <div className="sitefoot__brand">
            <Link to="/" className="sitefoot__logo">
              <img src={logoImg} alt="" width="44" height="44" loading="lazy" />
              <span>ज्योतिष विश्वकोष</span>
            </Link>
            <p className="sitefoot__blurb">
              {hi
                ? 'वैदिक ज्ञान और आधुनिक तकनीक का संगम — पंचांग, राशिफल, ग्रंथ और ई-पूजा एक ही जगह।'
                : 'Vedic wisdom meets modern technology — panchang, horoscopes, scriptures and e-pooja in one place.'}
            </p>

            <ul className="sitefoot__contact">
              <li>
                <a href={`tel:${CONTACT.phone}`}>
                  <IconPhone s={15} /><span className="tnum">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                  <IconWhatsapp s={15} />{hi ? 'व्हाट्सएप पर बात करें' : 'Chat on WhatsApp'}
                </a>
              </li>
              <li>
                <Link to="/contact"><IconMail s={15} />{hi ? 'संपर्क करें' : 'Contact us'}</Link>
              </li>
            </ul>

            <div className="sitefoot__social">
              <a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2C23 15.8 23 12 23 12ZM9.8 15.4V8.6l5.9 3.4-5.9 3.4Z" />
                </svg>
              </a>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <IconWhatsapp s={17} />
              </a>
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} className="sitefoot__col" aria-label={hi ? group.titleHi : group.title}>
              <h4 className="sitefoot__title">{hi ? group.titleHi : group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{hi ? link.nameHi : link.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="sitefoot__rule" aria-hidden="true"><Ornament s={14} /></div>

        <div className="sitefoot__bottom">
          <p>© {new Date().getFullYear()} Pandit Awadhnaresh Pandey Shiksha Samiti, Bhopal.</p>
          <p>{hi ? 'सर्वाधिकार सुरक्षित' : 'All rights reserved'}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
