import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconX } from './Icons'
import { CONTACT } from '../../data/site'
import logoImg from '../../assets/icons/logo_new.png'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Some features — a full kundli among them — are only computed in the mobile
 * app. Rather than route to a dead end, the web sends people to the store.
 */
const AppPromptDialog = ({ open, feature, language, onClose }) => {
  const hi = language === 'hindi'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const name = feature || (hi ? 'यह सुविधा' : 'This feature')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="appmodal__scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .2 }}
          onClick={onClose}
        >
          <motion.div
            className="appmodal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appmodal-title"
            initial={{ opacity: 0, y: 18, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .98 }}
            transition={{ duration: .3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="appmodal__close"
              onClick={onClose}
              aria-label={hi ? 'बंद करें' : 'Close'}
            >
              <IconX s={18} />
            </button>

            <img src={logoImg} alt="" className="appmodal__logo" />

            <h2 className="appmodal__title" id="appmodal-title">
              {hi ? `${name} ऐप पर उपलब्ध है` : `${name} lives in our app`}
            </h2>

            <p className="appmodal__body">
              {hi
                ? 'पूरी जन्म कुंडली, ग्रह-दशा और विस्तृत विश्लेषण के लिए ज्योतिष विश्वकोष ऐप डाउनलोड करें — निःशुल्क।'
                : 'Download the Jyotish Vishwakosh app for your full birth chart, planetary periods and detailed analysis — free.'}
            </p>

            <a
              className="u-btn u-btn--primary u-btn--block"
              href={CONTACT.playStore}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
            >
              {hi ? 'ऐप डाउनलोड करें' : 'Download the app'}
            </a>

            <button type="button" className="appmodal__later" onClick={onClose}>
              {hi ? 'बाद में' : 'Maybe later'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AppPromptDialog
