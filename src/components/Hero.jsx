import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Button } from './ui'
import { IconArrowRight, IconCheck, IconWhatsapp } from './ui/Icons'
import TempleSkyline from './ui/TempleSkyline'
import { CONTACT } from '../data/site'
import gurujiImg from '../assets/icons/bhupendra1.png'

const EASE = [0.22, 1, 0.36, 1]

/* TEMPORARY — Guruji's portrait is switched off for now and will be restored
   unchanged. Set this back to true and delete the `.hero--solo` block in
   styles/landing.css; nothing else needs touching. */
const SHOW_PORTRAIT = false

/* The first view arrives in sequence rather than all at once — the sky and
   horizon settle first, then the words, then Guruji. */
const stage = {
  hidden: {},
  show: { transition: { staggerChildren: .1, delayChildren: .15 } },
}

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: .65, ease: EASE } },
}

const MOTES = [
  { left: '14%', delay: '0s', dur: '26s' },
  { left: '31%', delay: '6s', dur: '32s' },
  { left: '47%', delay: '12s', dur: '24s' },
  { left: '63%', delay: '3s', dur: '30s' },
  { left: '79%', delay: '17s', dur: '28s' },
  { left: '91%', delay: '9s', dur: '34s' },
]

const Hero = ({ language }) => {
  const hi = language === 'hindi'
  const scene = useRef(null)
  const still = useReducedMotion()

  /* Each layer of the scene lags the scroll by a different amount — the dawn
     furthest, the near range least — so the horizon reads as distance rather
     than as a picture pinned to the page. */
  const { scrollYProgress } = useScroll({
    target: scene,
    offset: ['start start', 'end start'],
  })
  /* The mobile hero is roughly half the height, so the same pixel lag would be
     twice the proportional shift. */
  const compact = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 700px)').matches
  const lag = still ? 0 : compact ? .55 : 1

  const dawnY = useTransform(scrollYProgress, [0, 1], [0, 112 * lag])
  const farY = useTransform(scrollYProgress, [0, 1], [0, 78 * lag])
  const moteY = useTransform(scrollYProgress, [0, 1], [0, 60 * lag])
  const nearY = useTransform(scrollYProgress, [0, 1], [0, 44 * lag])

  return (
    <div className={`hero${SHOW_PORTRAIT ? '' : ' hero--solo'}`} ref={scene}>
      <motion.div
        className="hero__dawn"
        aria-hidden="true"
        style={{ y: dawnY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <span className="hero__sun" />
      </motion.div>

      <motion.div
        className="hero__horizon"
        aria-hidden="true"
        style={{ y: farY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: EASE, delay: .1 }}
      >
        <TempleSkyline className="hero__temples hero__temples--far" />
      </motion.div>

      <motion.div
        className="hero__horizon"
        aria-hidden="true"
        style={{ y: nearY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: EASE, delay: .2 }}
      >
        <TempleSkyline className="hero__temples hero__temples--near" width={1180} />
      </motion.div>

      {/* Incense drifting up through the dawn light. */}
      <motion.div className="hero__motes" aria-hidden="true" style={{ y: moteY }}>
        {MOTES.map((m) => (
          <span key={m.left} style={{ left: m.left, animationDelay: m.delay, animationDuration: m.dur }} />
        ))}
      </motion.div>

      <motion.div
        className="u-shell hero__inner"
        variants={stage}
        initial="hidden"
        animate="show"
      >
        <div className="hero__copy">
          <motion.h1 className="hero__title" variants={rise}>
            {hi
              ? <>जीवन के प्रश्नों का उत्तर, <em>शास्त्र और अनुभव</em> के साथ</>
              : <>Answers for life, guided by <em>scripture and experience</em></>}
          </motion.h1>

          <motion.div className="hero__cta" variants={rise}>
            <Button
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp s={16} />
              {hi ? 'गुरुजी से मार्गदर्शन लें' : 'Consult Guruji'}
            </Button>
            <Button variant="ghost" to="/books">
              {hi
                ? 'ग्रंथालय देखें'
                : <>Explore<span className="u-roomy-only"> the</span> library</>}
              <IconArrowRight s={16} />
            </Button>
          </motion.div>

          <motion.div
            className="hero__assurances"
            variants={rise}
            aria-label={hi ? 'हमारे मूल्य' : 'Our values'}
          >
            <span>
              <IconCheck s={14} />
              {hi ? 'शास्त्र आधारित' : 'Scripture-led'}
            </span>
            <span>
              <IconCheck s={14} />
              {hi ? 'व्यक्तिगत मार्गदर्शन' : 'Personal guidance'}
            </span>
            <span>
              <IconCheck s={14} />
              {hi ? 'हिंदी और अंग्रेज़ी' : 'Hindi & English'}
            </span>
          </motion.div>
        </div>

        {SHOW_PORTRAIT && (
          <motion.figure
            className="hero__portrait"
            initial={{ opacity: 0, y: 30, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: .3 }}
          >
            <img
              src={gurujiImg}
              alt={hi ? 'नमस्कार करते हुए डॉ. भूपेंद्र पांडेय' : 'Dr. Bhupendra Pandey greeting with namaste'}
              width="360"
              height="360"
              fetchPriority="high"
            />
            <figcaption className="hero__identity">
              <strong>{hi ? 'डॉ. भूपेंद्र पांडेय' : 'Dr. Bhupendra Pandey'}</strong>
              <span>{hi ? 'आपके ज्योतिष मार्गदर्शक' : 'Your Jyotish guide'}</span>
            </figcaption>
          </motion.figure>
        )}
      </motion.div>
    </div>
  )
}

export default Hero
