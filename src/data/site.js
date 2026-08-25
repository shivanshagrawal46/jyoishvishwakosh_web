import panchangIcon from '../assets/icons/panchang.png'
import rashifalsIcon from '../assets/icons/rashifals.png'
import epoojaIcon from '../assets/icons/e_pooja.png'
import karmkandIcon from '../assets/icons/karmkand1.png'
import koshIcon from '../assets/icons/kosh.png'
import astroshopIcon from '../assets/icons/astroshop.png'
import jyotishPredIcon from '../assets/icons/jyotish_prediction.png'
import tantraIcon from '../assets/icons/tantra.png'
import calculatorIcon from '../assets/icons/calculator.png'
import hasthRekhaIcon from '../assets/icons/hasth_rekha.png'
import vastuIcon from '../assets/icons/vastu.png'
import dharmaIcon from '../assets/icons/dharma.png'
import ankjyotishIcon from '../assets/icons/ankjyotish.png'
import granthIcon from '../assets/icons/granth.png'
import emagazineIcon from '../assets/icons/emagazine.png'
import youtubeIcon from '../assets/icons/youtube.png'
import numerologyIcon from '../assets/icons/numerology.png'
import numerologyCalcIcon from '../assets/icons/numerology_calculator.png'
import divineQuotesIcon from '../assets/icons/divine_quotes.png'
import aartiIcon from '../assets/icons/aarti.png'
import kundliIcon from '../assets/icons/kundli.png'

/** Single point of contact for every "call us" / "chat with us" affordance. */
export const CONTACT = {
  phone: '+919754648985',
  phoneDisplay: '+91 97546 48985',
  whatsapp: 'https://wa.me/919754648985?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87',
  youtube: 'https://www.youtube.com/@jyotishvishwakoshapp',
  facebook: 'https://www.facebook.com/jyotishvishwakosh',
  playStore: 'https://play.google.com/store/apps/details?id=jyotishvivkosh.mobileapplication',
}

/**
 * Every service in one array. `featured` drives the eight landing tiles;
 * everything else renders as a compact chip. A missing `path` means the
 * destination does not exist yet and the item renders disabled.
 *
 * Original service illustrations are intentionally retained, but their visual
 * treatment is controlled by the component so they read as one quiet system.
 */
export const SERVICES = [
  { id: 'panchang',   name: 'Panchang',       nameHi: 'पंचांग',        icon: panchangIcon,       path: '/panchang',       category: 'daily',   featured: true,  descHi: 'आज का शुभ-अशुभ समय',        desc: "Today's auspicious timings" },
  { id: 'rashifal',   name: 'Rashifal',       nameHi: 'राशिफल',       icon: rashifalsIcon,      path: '/rashi-fal',      category: 'daily',   featured: true,  descHi: 'बारह राशियों का दैनिक फल',  desc: 'Daily horoscope for all signs' },
  // The full chart is only computed in the mobile app, so the web tiles open a
  // download prompt instead of routing to a report that has no data.
  { id: 'kundli',     name: 'Kundli',         nameHi: 'कुंडली',        icon: kundliIcon,         path: '/jyotish-report', appOnly: true, category: 'reports', featured: true,  descHi: 'जन्म कुंडली और विश्लेषण',   desc: 'Birth chart and analysis' },
  { id: 'epooja',     name: 'E-Pooja',        nameHi: 'ई-पूजा',        icon: epoojaIcon,         path: '/e-pooja',        category: 'seva',    featured: true,  descHi: 'ऑनलाइन पूजा बुकिंग',        desc: 'Book a pooja online' },
  { id: 'astroshop',  name: 'AstroShop',      nameHi: 'एस्ट्रो शॉप',    icon: astroshopIcon,      path: '/astroshop',      category: 'shop',    featured: true,  descHi: 'रत्न, रुद्राक्ष और यंत्र',    desc: 'Gemstones, rudraksha, yantra' },
  { id: 'aijyotish',  name: 'AI Jyotish',     nameHi: 'AI ज्योतिष',    icon: jyotishPredIcon,    path: '/#ai-jyotish',    category: 'tools',   featured: true,  descHi: 'मुफ़्त भविष्यवाणी',          desc: 'Free instant prediction' },
  { id: 'granth',     name: 'Granth',         nameHi: 'ग्रंथ',          icon: granthIcon,         path: '/books',          category: 'library', featured: true,  descHi: 'शास्त्र और ग्रंथालय',        desc: 'Scriptures and library' },
  { id: 'karmkand',   name: 'Karmkand',       nameHi: 'कर्मकांड',      icon: karmkandIcon,       path: '/karmkand',       category: 'seva',    featured: true,  descHi: 'विधि-विधान और संस्कार',     desc: 'Rituals and ceremonies' },

  { id: 'kosh',       name: 'Kosh',           nameHi: 'कोष',           icon: koshIcon,           path: '/kosh',           category: 'library' },
  { id: 'mantra',     name: 'Mantra Tantra',  nameHi: 'मंत्र तंत्र',     icon: tantraIcon,         path: '/mantra-tantra',  category: 'library' },
  { id: 'dharma',     name: 'Dharma Shastra', nameHi: 'धर्म शास्त्र',    icon: dharmaIcon,         path: '/dharma-shastra', category: 'library' },
  { id: 'chalisa',    name: 'Chalisa Aarti',  nameHi: 'चालीसा आरती',   icon: aartiIcon,          path: '/chalisa-aarti',  category: 'library' },
  { id: 'emagazine',  name: 'E-Magazine',     nameHi: 'ई-मैगज़ीन',      icon: emagazineIcon,      path: '/emagazine',      category: 'library' },
  { id: 'quotes',     name: 'Divine Quotes',  nameHi: 'दिव्य वाणी',     icon: divineQuotesIcon,   path: '/divine-quotes',  category: 'library' },
  { id: 'hasthrekha', name: 'Hasth Rekha',    nameHi: 'हस्त रेखा',      icon: hasthRekhaIcon,     path: '/hasth-rekha',    category: 'tools' },
  { id: 'vastu',      name: 'Vastu',          nameHi: 'वास्तु',         icon: vastuIcon,          path: '/vastu',          category: 'tools' },
  { id: 'ankjyotish', name: 'Ank Jyotish',    nameHi: 'अंक ज्योतिष',    icon: ankjyotishIcon,     path: '/ank-jyotish',    category: 'tools' },
  { id: 'ainumero',   name: 'AI Numerology',  nameHi: 'AI न्यूमरोलॉजी', icon: numerologyIcon,     path: '/ai-ank',         category: 'tools' },
  { id: 'ankfal',     name: 'Ank Fal',        nameHi: 'अंक फल',        icon: numerologyCalcIcon, path: '/ank-fal',        category: 'daily' },
  { id: 'calculator', name: 'Calculators',    nameHi: 'कैलकुलेटर',      icon: calculatorIcon,     path: '/#calculations',  category: 'tools' },
  { id: 'videos',     name: 'Videos',         nameHi: 'वीडियो',        icon: youtubeIcon,        path: '/videos',         category: 'library' },
]

export const FEATURED_SERVICES = SERVICES.filter((s) => s.featured)
export const OTHER_SERVICES = SERVICES.filter((s) => !s.featured)

/** Calculation tools — shown as a chip strip, not their own icon grid. */
export const CALC_TOOLS = [
  { id: 'mulank',    name: 'Mulank',      nameHi: 'मूलांक',        path: '/mulank' },
  { id: 'bhagyank',  name: 'Bhagyank',    nameHi: 'भाग्यांक',      path: '/bhagyank' },
  { id: 'loshu',     name: 'Lo Shu Grid', nameHi: 'लो शू ग्रिड',   path: '/loshu' },
  { id: 'aiank',     name: 'AI Ank',      nameHi: 'AI अंक',       path: '/ai-ank', badge: 'AI' },
  { id: 'rashi',     name: 'Rashi',       nameHi: 'राशि',         path: '/rashi' },
  { id: 'nakshatra', name: 'Nakshatra',   nameHi: 'नक्षत्र',       path: '/nakshatra' },
  { id: 'dasha',     name: 'Dasha',       nameHi: 'दशा',          path: '/dasha' },
]

export const NAV_LINKS = [
  { name: 'Home',      nameHi: 'होम',      path: '/' },
  { name: 'Panchang',  nameHi: 'पंचांग',    path: '/panchang' },
  { name: 'Horoscope', nameHi: 'राशिफल',   path: '/rashi-fal' },
  { name: 'Granth',    nameHi: 'ग्रंथ',      path: '/books' },
  { name: 'E-Pooja',   nameHi: 'ई-पूजा',    path: '/e-pooja' },
  { name: 'Shop',      nameHi: 'शॉप',      path: '/astroshop' },
  { name: 'Contact',   nameHi: 'संपर्क',    path: '/contact' },
]

export const FOOTER_GROUPS = [
  {
    title: 'Services', titleHi: 'सेवाएं',
    links: [
      { name: 'Panchang',  nameHi: 'पंचांग',      path: '/panchang' },
      { name: 'Rashifal',  nameHi: 'राशिफल',     path: '/rashi-fal' },
      { name: 'Kundli',    nameHi: 'कुंडली',      path: '/jyotish-report', appOnly: true },
      { name: 'E-Pooja',   nameHi: 'ई-पूजा',      path: '/e-pooja' },
      { name: 'Karmkand',  nameHi: 'कर्मकांड',    path: '/karmkand' },
      { name: 'Muhurat',   nameHi: 'दैनिक मुहूर्त', path: '/dainik-muhurat' },
    ],
  },
  {
    title: 'Library', titleHi: 'ग्रंथालय',
    links: [
      { name: 'Granth',         nameHi: 'ग्रंथ',        path: '/books' },
      { name: 'Kosh',           nameHi: 'कोष',         path: '/kosh' },
      { name: 'Mantra Tantra',  nameHi: 'मंत्र तंत्र',    path: '/mantra-tantra' },
      { name: 'Dharma Shastra', nameHi: 'धर्म शास्त्र',   path: '/dharma-shastra' },
      { name: 'Chalisa Aarti',  nameHi: 'चालीसा आरती',  path: '/chalisa-aarti' },
      { name: 'E-Magazine',     nameHi: 'ई-मैगज़ीन',     path: '/emagazine' },
    ],
  },
  {
    title: 'Tools & Shop', titleHi: 'उपकरण और शॉप',
    links: [
      { name: 'AstroShop',     nameHi: 'एस्ट्रो शॉप',    path: '/astroshop' },
      { name: 'Ank Jyotish',   nameHi: 'अंक ज्योतिष',   path: '/ank-jyotish' },
      { name: 'Hasth Rekha',   nameHi: 'हस्त रेखा',     path: '/hasth-rekha' },
      { name: 'Vastu',         nameHi: 'वास्तु',        path: '/vastu' },
      { name: 'Prashn Yantra', nameHi: 'प्रश्न यंत्र',    path: '/prashan-yantra' },
      { name: 'Videos',        nameHi: 'वीडियो',       path: '/videos' },
    ],
  },
]
