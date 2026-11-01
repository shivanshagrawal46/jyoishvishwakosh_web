/**
 * UI copy for the Kundli-API tool pages (matching, vrat/parv, muhurat finder).
 * Astrological names arrive already localized from the API (`language` param);
 * this file only holds the pages' own labels. Same shape as kundliLabels.js.
 */

export const UI = {
  /* ── shared ───────────────────────────────────────────────── */
  offline: { en: 'Service is not available right now. Please try again in a moment.', hi: 'सेवा उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।' },
  retry: { en: 'Try again', hi: 'पुनः प्रयास करें' },
  edit: { en: 'Edit details', hi: 'विवरण बदलें' },
  print: { en: 'Print', hi: 'प्रिंट' },
  share: { en: 'Copy link', hi: 'लिंक कॉपी करें' },
  copied: { en: 'Link copied', hi: 'लिंक कॉपी हो गया' },
  name: { en: 'Name', hi: 'नाम' },
  namePh: { en: 'Full name', hi: 'पूरा नाम' },
  dob: { en: 'Date of birth', hi: 'जन्म तिथि' },
  tob: { en: 'Time of birth', hi: 'जन्म समय' },
  place: { en: 'Place of birth', hi: 'जन्म स्थान' },
  location: { en: 'Location', hi: 'स्थान' },
  placePh: { en: 'Type a city, e.g. Jaipur, Rajasthan', hi: 'शहर लिखें, जैसे जयपुर, राजस्थान' },
  placeHint: { en: 'Pick from the list for exact coordinates and timezone.', hi: 'सटीक अक्षांश-देशांतर और समय क्षेत्र के लिए सूची से चुनें।' },
  didYouMean: { en: 'did you mean', hi: 'क्या आपका मतलब' },
  needDate: { en: 'Please enter date and time of birth', hi: 'कृपया जन्म तिथि और समय दर्ज करें' },
  needPlace: { en: 'Please enter the place of birth', hi: 'कृपया जन्म स्थान दर्ज करें' },
  needLocation: { en: 'Please pick a location from the list', hi: 'कृपया सूची से स्थान चुनें' },
  missingParams: { en: 'Details are missing. Please fill the form again.', hi: 'विवरण उपलब्ध नहीं है। कृपया फ़ॉर्म दोबारा भरें।' },
  today: { en: 'Today', hi: 'आज' },
  sunrise: { en: 'Sunrise', hi: 'सूर्योदय' },
  sunset: { en: 'Sunset', hi: 'सूर्यास्त' },
  tithi: { en: 'Tithi', hi: 'तिथि' },
  nakshatra: { en: 'Nakshatra', hi: 'नक्षत्र' },
  yoga: { en: 'Yoga', hi: 'योग' },
  pada: { en: 'Pada', hi: 'चरण' },
  footnote: { en: 'Computed with the Swiss Ephemeris, Lahiri ayanamsa. For guidance; consult a learned astrologer for decisions.', hi: 'स्विस एफेमेरिस, लाहिड़ी अयनांश से गणना। मार्गदर्शन हेतु; निर्णय के लिए विद्वान ज्योतिषी से परामर्श लें।' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  points: { en: 'points', hi: 'गुण' },

  /* ── matching ─────────────────────────────────────────────── */
  mBadge: { en: 'Free Kundli Matching', hi: 'निःशुल्क कुंडली मिलान' },
  mTitle: { en: 'Kundli Matching', hi: 'कुंडली मिलान' },
  mSubtitle: {
    en: 'Ashtakoota (36 guna) compatibility, Bhakoot and Nadi dosha with cancellations, and Manglik comparison for both partners.',
    hi: 'अष्टकूट (36 गुण) मिलान, भकूट व नाड़ी दोष एवं उनका भंग, और वर-वधू दोनों का मांगलिक विचार।',
  },
  mvp1: { en: 'Ashtakoota · 36 gunas', hi: 'अष्टकूट · 36 गुण' }, mvp1s: { en: 'All eight kootas scored, with the reasoning', hi: 'आठों कूट अंकों और कारण सहित' },
  mvp2: { en: 'Bhakoot & Nadi dosha', hi: 'भकूट व नाड़ी दोष' }, mvp2s: { en: 'Detected, and the classical cancellations applied', hi: 'दोष की पहचान और शास्त्रीय भंग' },
  mvp3: { en: 'Manglik comparison', hi: 'मांगलिक विचार' }, mvp3s: { en: 'Mars from Lagna, Moon and Venus for both', hi: 'दोनों के लग्न, चंद्र व शुक्र से मंगल' },
  mvp4: { en: 'Shareable report', hi: 'साझा करने योग्य रिपोर्ट' }, mvp4s: { en: 'Bookmark, print or send the link', hi: 'बुकमार्क, प्रिंट या लिंक भेजें' },
  boy: { en: 'Boy', hi: 'वर' },
  girl: { en: 'Girl', hi: 'वधू' },
  boyDetails: { en: "Boy's birth details", hi: 'वर का जन्म विवरण' },
  girlDetails: { en: "Girl's birth details", hi: 'वधू का जन्म विवरण' },
  mSubmit: { en: 'Match Kundlis', hi: 'गुण मिलान करें' },
  mWorking: { en: 'Matching the two charts...', hi: 'दोनों कुंडलियों का मिलान हो रहा है...' },
  mReport: { en: 'Matching report', hi: 'मिलान परिणाम' },
  gunaScore: { en: 'Guna score', hi: 'गुण मिलान' },
  outOf: { en: 'out of', hi: 'में से' },
  effective: { en: 'Effective after cancellations', hi: 'दोष-भंग के बाद प्रभावी' },
  percentage: { en: 'Match', hi: 'मिलान' },
  verdict: { en: 'Verdict', hi: 'निष्कर्ष' },
  overall: { en: 'Overall', hi: 'समग्र' },
  born: { en: 'Born', hi: 'जन्म' },
  at: { en: 'at', hi: 'को' },
  moonSign: { en: 'Moon sign', hi: 'चंद्र राशि' },
  moonLord: { en: 'Sign lord', hi: 'राशि स्वामी' },
  lagna: { en: 'Lagna', hi: 'लग्न' },
  varna: { en: 'Varna', hi: 'वर्ण' },
  vashya: { en: 'Vashya', hi: 'वश्य' },
  yoni: { en: 'Yoni', hi: 'योनि' },
  gana: { en: 'Gana', hi: 'गण' },
  nadi: { en: 'Nadi', hi: 'नाड़ी' },
  natives: { en: 'The two natives', hi: 'वर-वधू परिचय' },
  kootas: { en: 'Ashtakoota — eight kootas', hi: 'अष्टकूट मिलान' },
  kootasSub: { en: 'Each koota compares one quality of the two Moon nakshatras; the maxima add up to 36.', hi: 'प्रत्येक कूट दोनों के चंद्र नक्षत्र के एक गुण की तुलना करता है; अधिकतम योग 36 है।' },
  koota: { en: 'Koota', hi: 'कूट' },
  relation: { en: 'Sign relation', hi: 'राशि संबंध' },
  doshaPresent: { en: 'Dosha', hi: 'दोष' },
  doshaCancelled: { en: 'Dosha cancelled', hi: 'दोष भंग' },
  doshaNone: { en: 'No dosha', hi: 'दोष नहीं' },
  cancellations: { en: 'Cancellation', hi: 'भंग के कारण' },
  noCancellation: { en: 'No cancellation applies', hi: 'कोई भंग लागू नहीं' },
  doshas: { en: 'Bhakoot & Nadi dosha', hi: 'भकूट व नाड़ी दोष' },
  doshasSub: { en: 'The two heaviest kootas. A cancelled dosha restores its points in the effective score.', hi: 'सबसे भारी दो कूट। भंग हुए दोष के अंक प्रभावी गुणों में जुड़ जाते हैं।' },
  manglik: { en: 'Manglik (Kuja) dosha', hi: 'मांगलिक विचार' },
  manglikYes: { en: 'Manglik', hi: 'मांगलिक' },
  manglikNo: { en: 'Not Manglik', hi: 'मांगलिक नहीं' },
  manglikLevel: { en: 'Level', hi: 'स्तर' },
  manglikFrom: { en: 'Mars in house (from)', hi: 'मंगल भाव (से)' },
  compatible: { en: 'Compatible', hi: 'अनुकूल' },
  notCompatible: { en: 'Needs attention', hi: 'विचारणीय' },
  notes: { en: 'Notes & remedies', hi: 'टिप्पणियाँ व उपाय' },
  mFoot: { en: 'Matching report', hi: 'मिलान रिपोर्ट' },

  /* ── vrat / parv ──────────────────────────────────────────── */
  vBadge: { en: 'Hindu calendar', hi: 'हिन्दू पंचांग' },
  vTitle: { en: 'Vrat & Parv', hi: 'व्रत एवं पर्व' },
  vSubtitle: {
    en: 'Festivals, ekadashi, pradosh, sankranti and monthly vrat for any year — computed for your city from sunrise tithi.',
    hi: 'किसी भी वर्ष के पर्व, एकादशी, प्रदोष, संक्रांति और मासिक व्रत — आपके शहर के सूर्योदय-कालीन तिथि से गणना।',
  },
  year: { en: 'Year', hi: 'वर्ष' },
  month: { en: 'Month', hi: 'माह' },
  allMonths: { en: 'All months', hi: 'पूरा वर्ष' },
  monthly: { en: 'Show monthly vrat', hi: 'मासिक व्रत दिखाएँ' },
  monthlySub: { en: 'Chaturthi, pradosh, shivaratri, purnima, amavasya...', hi: 'चतुर्थी, प्रदोष, शिवरात्रि, पूर्णिमा, अमावस्या...' },
  category: { en: 'Category', hi: 'श्रेणी' },
  all: { en: 'All', hi: 'सभी' },
  eventsCount: { en: 'events', hi: 'पर्व / व्रत' },
  lunarMonths: { en: 'Lunar months (amanta)', hi: 'चांद्र मास (अमांत)' },
  adhik: { en: 'Adhik', hi: 'अधिक' },
  kshaya: { en: 'Kshaya', hi: 'क्षय' },
  tithiSunrise: { en: 'Tithi at sunrise', hi: 'सूर्योदय तिथि' },
  nakSunrise: { en: 'Nakshatra', hi: 'नक्षत्र' },
  rule: { en: 'Rule', hi: 'निर्णय' },
  vaishnava: { en: 'Vaishnava', hi: 'वैष्णव' },
  sankrantiAt: { en: 'Sankranti at', hi: 'संक्रांति' },
  noEvents: { en: 'No events match these filters.', hi: 'इन फ़िल्टर में कोई पर्व नहीं मिला।' },
  jumpToday: { en: 'Jump to today', hi: 'आज पर जाएँ' },
  vWorking: { en: 'Preparing the calendar...', hi: 'पंचांग तैयार हो रहा है...' },

  /* ── muhurat finder ───────────────────────────────────────── */
  muBadge: { en: 'Muhurat finder', hi: 'मुहूर्त खोज' },
  muTitle: { en: 'Shubh Muhurat Finder', hi: 'शुभ मुहूर्त खोज' },
  muSubtitle: {
    en: 'Auspicious days for marriage, griha pravesh, travel, business and more — scored by tithi, nakshatra, weekday and yoga.',
    hi: 'विवाह, गृह प्रवेश, यात्रा, व्यापार आदि के लिए शुभ दिन — तिथि, नक्षत्र, वार और योग के आधार पर अंकित।',
  },
  activity: { en: 'Activity', hi: 'कार्य' },
  startDate: { en: 'From date', hi: 'प्रारंभ तिथि' },
  days: { en: 'Search window', hi: 'अवधि' },
  daysUnit: { en: 'days', hi: 'दिन' },
  minScore: { en: 'Minimum score', hi: 'न्यूनतम अंक' },
  find: { en: 'Find muhurat', hi: 'मुहूर्त खोजें' },
  muWorking: { en: 'Scanning the days...', hi: 'दिनों की जाँच हो रही है...' },
  rules: { en: 'Rules for this activity', hi: 'इस कार्य के नियम' },
  approvedNak: { en: 'Approved nakshatras', hi: 'शुभ नक्षत्र' },
  approvedTithi: { en: 'Approved tithis', hi: 'शुभ तिथियाँ' },
  approvedWeekday: { en: 'Approved weekdays', hi: 'शुभ वार' },
  avoidPeriods: { en: 'Avoid', hi: 'वर्जित काल' },
  daysFound: { en: 'auspicious days', hi: 'शुभ दिन' },
  score: { en: 'Score', hi: 'अंक' },
  lunarMonth: { en: 'Lunar month', hi: 'चांद्र मास' },
  reasons: { en: 'Why this day', hi: 'कारण' },
  restrictions: { en: 'Restrictions', hi: 'प्रतिबंध' },
  windows: { en: 'Auspicious windows', hi: 'शुभ समय' },
  avoidWindows: { en: 'Avoid (Rahu kaal, varjyam, dur muhurta…)', hi: 'त्याज्य समय (राहु काल, वर्ज्य, दुर्मुहूर्त…)' },
  min: { en: 'min', hi: 'मिनट' },
  viewPanchang: { en: 'Day panchang', hi: 'दिन का पंचांग' },
  noDays: { en: 'No day reached the minimum score. Lower the score or widen the window.', hi: 'न्यूनतम अंक तक कोई दिन नहीं पहुँचा। अंक घटाएँ या अवधि बढ़ाएँ।' },
  weekday: { en: 'Weekday', hi: 'वार' },
  bestDays: { en: 'Best days', hi: 'सर्वोत्तम दिन' },
  bestDaysSub: { en: 'Highest score, earliest first', hi: 'सर्वाधिक अंक, पहले आने वाले पहले' },
  bestWindow: { en: 'Best window', hi: 'सर्वोत्तम समय' },
  heatmap: { en: 'Score calendar', hi: 'अंक कैलेंडर' },
  heatmapSub: { en: 'Darker green = higher score. Tap a day to jump to it.', hi: 'गहरा हरा = अधिक अंक। दिन पर टैप करें।' },
  allDays: { en: 'All auspicious days', hi: 'सभी शुभ दिन' },
  change: { en: 'Change', hi: 'बदलें' },
  queryFor: { en: 'Searching for', hi: 'खोज' },
  muForm: { en: 'What are you planning?', hi: 'आप क्या योजना बना रहे हैं?' },
  muFormSub: { en: 'Pick the activity, a start date and how far ahead to look.', hi: 'कार्य, प्रारंभ तिथि और कितने दिन आगे देखना है — चुनें।' },
  muVp1: { en: 'Scored, not just listed', hi: 'सूची नहीं — अंक' },
  muVp1s: { en: 'Every day gets a 0–100 score from tithi, nakshatra, weekday and yoga.', hi: 'हर दिन को तिथि, नक्षत्र, वार और योग से 0–100 अंक।' },
  muVp2: { en: 'Exact windows', hi: 'सटीक समय' },
  muVp2s: { en: 'Choghadiya-aware auspicious windows for your city, with Rahu kaal removed.', hi: 'आपके शहर के चौघड़िया-आधारित शुभ समय, राहु काल हटाकर।' },
  muVp3: { en: 'Restrictions respected', hi: 'प्रतिबंध ध्यान में' },
  muVp3s: { en: 'Kharmas, chaturmas, holashtak, pitru paksha, combust Venus / Jupiter.', hi: 'खरमास, चातुर्मास, होलाष्टक, पितृ पक्ष, शुक्र / गुरु अस्त।' },
  muVp4: { en: 'Up to a year ahead', hi: 'एक वर्ष तक आगे' },
  muVp4s: { en: 'Scan 30 to 365 days from any start date.', hi: 'किसी भी तिथि से 30 से 365 दिन तक।' },
  scoreLegend: { en: 'Score', hi: 'अंक' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  /* muhurat v0.4: lagna windows, flags, rules, rejected days */
  lagna: { en: 'Lagna', hi: 'लग्न' },
  bana: { en: 'Bana', hi: 'बाण' },
  cautions: { en: 'Cautions', hi: 'सावधानियाँ' },
  clean: { en: 'Clean', hi: 'शुद्ध' },
  cleanNote: { en: 'No cautions — the cleanest window', hi: 'कोई सावधानी नहीं — सबसे शुद्ध समय' },
  reason: { en: 'Reason', hi: 'कारण' },
  rejectedLagna: { en: 'Considered and rejected', hi: 'जाँचे गए पर अस्वीकृत' },
  rejectedDays: { en: 'Why the other days were rejected', hi: 'अन्य दिन क्यों अस्वीकृत हुए' },
  rejectedDaysSub: { en: 'Days in the search window that failed a rule, by reason', hi: 'खोज अवधि के जो दिन किसी नियम में अटके, कारण सहित' },
  altNak: { en: 'Also approved (alternative opinion)', hi: 'मतांतर से मान्य नक्षत्र' },
  approvedTithiShukla: { en: 'Shukla paksha tithis', hi: 'शुक्ल पक्ष तिथियाँ' },
  approvedTithiKrishna: { en: 'Krishna paksha tithis', hi: 'कृष्ण पक्ष तिथियाँ' },
  approvedSunMonths: { en: 'Solar months (Sun in)', hi: 'सौर मास (सूर्य राशि)' },
  approvedLagnas: { en: 'Approved lagnas', hi: 'शुभ लग्न' },
  avoidYogas: { en: 'Yogas to avoid', hi: 'वर्जित योग' },
  uttarayanaOnly: { en: 'Uttarayana only', hi: 'केवल उत्तरायण' },
  bhadraAvoided: { en: 'Bhadra (Mrityulok) avoided', hi: 'मृत्युलोक भद्रा वर्जित' },
  banaAvoid: { en: 'Bana avoided', hi: 'वर्जित बाण' },
  vedhaChakra: { en: 'Vedha chakra', hi: 'वेध चक्र' },
  timeOfDay: { en: 'Time of day', hi: 'समय' },
  note: { en: 'Note', hi: 'टिप्पणी' },
  sunSign: { en: 'Sun sign', hi: 'सूर्य राशि' },
  noDaysRules: { en: 'No day in this window passed every rule for this activity.', hi: 'इस अवधि में कोई दिन इस कार्य के सभी नियमों पर खरा नहीं उतरा।' },
  daysUnitShort: { en: 'days', hi: 'दिन' },
}

export const t = (key, hi) => (UI[key] ? UI[key][hi ? 'hi' : 'en'] : key)

/**
 * Muhurat activity ids (Kundli API v0.4, 25 keys — the live list comes from /api/v1/ephemeris
 * `muhurat_activities`). Hindi names for the picker; the find / day responses also carry
 * `hindi_name`, which wins when present.
 */
export const ACTIVITY_HI = {
  griharambha: 'गृहारंभ', grihpravesh: 'गृह प्रवेश', jirna_griha_pravesh: 'जीर्ण गृह प्रवेश', dev_pratishtha: 'देव प्रतिष्ठा',
  jalashay_arambh: 'जलाशय आरंभ', mantra_deeksha: 'मंत्र दीक्षा',
  garbhadhan: 'गर्भाधान', punsavan_seemant: 'पुंसवन / सीमंतोन्नयन', jatakarma: 'जातकर्म', prasuti_snana: 'प्रसूति स्नान',
  namkaran: 'नामकरण', annaprashan: 'अन्नप्राशन', karnavedh: 'कर्णवेध', mundan: 'मुंडन',
  aksharambh: 'अक्षरारंभ', upanayan: 'उपनयन / यज्ञोपवीत', vidyarambh: 'विद्यारंभ',
  vivah: 'विवाह', vadhu_pravesh: 'वधू प्रवेश', dwiragaman: 'द्विरागमन',
  vehicle: 'वाहन क्रय', travel: 'यात्रा', business: 'व्यापार आरंभ', property: 'संपत्ति क्रय', general: 'शुभ कार्य',
}

/** Fallback when /ephemeris is unreachable — same ids and order as the API. */
export const ACTIVITY_FALLBACK = {
  griharambha: 'Griharambha (foundation / start of construction)',
  grihpravesh: 'Griha Pravesh (house warming)',
  jirna_griha_pravesh: 'Jirna Griha Pravesh (re-entry into an old / renovated house)',
  dev_pratishtha: 'Dev Pratishtha (idol consecration)',
  jalashay_arambh: 'Jalashay Arambh (borewell / well / water body)',
  mantra_deeksha: 'Mantra Deeksha (initiation / Guru mantra)',
  garbhadhan: 'Garbhadhan (conception sanskar)',
  punsavan_seemant: 'Punsavan / Seemantonnayan',
  jatakarma: 'Jatakarma (birth rites)',
  prasuti_snana: 'Prasuti Snana (post-natal bath)',
  namkaran: 'Namkaran (naming ceremony)',
  annaprashan: 'Annaprashan (first solid food)',
  karnavedh: 'Karnavedh (ear piercing)',
  mundan: 'Mundan (first haircut)',
  aksharambh: 'Aksharambh (learning letters)',
  upanayan: 'Upanayan / Yagyopavit (sacred thread)',
  vidyarambh: 'Vidyarambh (start of education)',
  vivah: 'Vivah (marriage)',
  vadhu_pravesh: "Vadhu Pravesh (bride's entry)",
  dwiragaman: "Dwiragaman (bride's second homecoming)",
  vehicle: 'Vahan kharid (vehicle purchase)',
  travel: 'Yatra (travel)',
  business: 'Vyapar arambh (business / shop opening)',
  property: 'Sampatti kharid (property purchase)',
  general: 'Shubh karya (general auspicious work)',
}

/** Old activity names (still accepted by the API) → current keys. Used for saved prefs and shared links. */
export const LEGACY_ACTIVITY = { marriage: 'vivah', griha_pravesh: 'grihpravesh', naming: 'namkaran', education: 'vidyarambh' }
export const canonActivity = (id) => LEGACY_ACTIVITY[id] || id

export const activityLabel = (id, apiLabel, hi, hindiName) => {
  const key = canonActivity(id)
  return hi ? hindiName || ACTIVITY_HI[key] || apiLabel || key : apiLabel || ACTIVITY_FALLBACK[key] || key
}

/** Planet ids that come back untranslated inside `manglik.*.from`. */
export const PLANET_HI = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि',
  Rahu: 'राहु', Ketu: 'केतु', Lagna: 'लग्न', Ascendant: 'लग्न',
}
export const planetName = (id, hi) => (hi ? PLANET_HI[id] || id : id)

export const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
}
export const monthName = (m, hi) => MONTHS[hi ? 'hi' : 'en'][m - 1] || String(m)

/** Default location for the calendar tools: New Delhi. */
export const DEFAULT_PLACE = {
  display_name: 'New Delhi, Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
}
