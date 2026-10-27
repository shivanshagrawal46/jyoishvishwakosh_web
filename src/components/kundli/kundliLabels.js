/**
 * UI copy for the Kundli pages. All astrological names (planets, signs,
 * nakshatras, dasha lords ...) come from the API already localized via its
 * `language` parameter; this file only holds the page's own labels.
 */

/** Standard flag symbols shown beside a planet everywhere (charts, tables, lists). */
export const FLAGS = {
  retro:       { sym: '*', en: 'Retrograde',  hi: 'वक्री',     tone: 'warn' },
  combust:     { sym: '^', en: 'Combust',     hi: 'अस्त',      tone: 'bad' },
  vargottama:  { sym: '▫', en: 'Vargottama',  hi: 'वर्गोत्तम',  tone: 'gold' },
  exalted:     { sym: '↑', en: 'Exalted',     hi: 'उच्च',     tone: 'good' },
  debilitated: { sym: '↓', en: 'Debilitated', hi: 'नीच',      tone: 'bad' },
}

/** Flags that apply to one planet record (planet table row or chart entry). */
export function planetFlags(p, hi) {
  const out = []
  // Trust the API's is_retrograde as-is (it marks Rahu/Ketu retrograde too, like AstroSage).
  if (p.is_retrograde) out.push(FLAGS.retro)
  if (p.is_combust) out.push(FLAGS.combust)
  if (p.is_vargottama) out.push(FLAGS.vargottama)
  const d = p.dignity_id || p.dignity
  if (d === 'Exalted') out.push(FLAGS.exalted)
  else if (d === 'Debilitated') out.push(FLAGS.debilitated)
  return out.map((f) => ({ ...f, label: hi ? f.hi : f.en }))
}

export const UI = {
  badge: { en: 'Free Kundli', hi: 'निःशुल्क कुंडली' },
  title: { en: 'Your Janam Kundli, computed to the arc-second', hi: 'आपकी जन्म कुंडली — अंश-अंश सटीक' },
  subtitle: {
    en: 'Lagna chart, planetary degrees, nakshatra, panchang and Vimshottari dasha — computed from the Swiss Ephemeris.',
    hi: 'लग्न कुंडली, ग्रहों के अंश, नक्षत्र, पंचांग और विंशोत्तरी दशा — स्विस एफेमेरिस से सटीक गणना।',
  },
  formTitle: { en: 'Birth details', hi: 'जन्म विवरण' },
  formSub: { en: 'Three facts are all the sky needs.', hi: 'सिर्फ़ तीन बातें — तिथि, समय और स्थान।' },
  vp1: { en: '16 varga charts', hi: '16 वर्ग कुंडलियाँ' }, vp1s: { en: 'Lagna, Chandra, Navamsa and the full Shodashvarga', hi: 'लग्न, चंद्र, नवमांश और पूरा षोडशवर्ग' },
  vp2: { en: 'Vimshottari dasha', hi: 'विंशोत्तरी दशा' }, vp2s: { en: 'Mahadasha → antardasha timeline, current period marked', hi: 'महादशा → अंतर्दशा, वर्तमान अवधि चिह्नित' },
  vp3: { en: 'Yogas & doshas', hi: 'योग एवं दोष' }, vp3s: { en: 'Parashari yogas, Mangal, Kaal Sarp, Sade Sati', hi: 'पाराशरी योग, मंगल, काल सर्प, साढ़े साती' },
  vp4: { en: 'KP · Lal Kitab · Faladesh', hi: 'KP · लाल किताब · फलादेश' }, vp4s: { en: 'Sub-lords, rin, remedies and life-area predictions', hi: 'उप-स्वामी, ऋण, उपाय और क्षेत्रवार फलादेश' },
  trust1: { en: 'Swiss Ephemeris', hi: 'स्विस एफेमेरिस' },
  trust2: { en: 'Lahiri ayanamsa', hi: 'लाहिड़ी अयनांश' },
  trust3: { en: 'No sign-up, no ads', hi: 'न साइन-अप, न विज्ञापन' },
  recent: { en: 'Recent', hi: 'हाल के' },
  name: { en: 'Name', hi: 'नाम' },
  namePh: { en: 'Full name', hi: 'पूरा नाम' },
  gender: { en: 'Gender', hi: 'लिंग' },
  male: { en: 'Male', hi: 'पुरुष' }, female: { en: 'Female', hi: 'स्त्री' }, other: { en: 'Other', hi: 'अन्य' },
  dob: { en: 'Date of birth', hi: 'जन्म तिथि' },
  tob: { en: 'Time of birth', hi: 'जन्म समय' },
  place: { en: 'Place of birth', hi: 'जन्म स्थान' },
  placePh: { en: 'Type a city, e.g. Jaipur, Rajasthan', hi: 'शहर लिखें, जैसे जयपुर, राजस्थान' },
  placeHint: { en: 'Pick from the list for exact coordinates and timezone.', hi: 'सटीक अक्षांश-देशांतर और समय क्षेत्र के लिए सूची से चुनें।' },
  advanced: { en: 'Advanced settings', hi: 'उन्नत सेटिंग' },
  ayanamsa: { en: 'Ayanamsa', hi: 'अयनांश' },
  node: { en: 'Rahu / Ketu', hi: 'राहु / केतु' },
  meanNode: { en: 'Mean node', hi: 'मध्यम' }, trueNode: { en: 'True node', hi: 'स्पष्ट' },
  outer: { en: 'Include Uranus, Neptune, Pluto', hi: 'यूरेनस, नेपच्यून, प्लूटो शामिल करें' },
  submit: { en: 'Generate Kundli', hi: 'कुंडली बनाएं' },
  working: { en: 'Preparing your Kundli...', hi: 'आपकी कुंडली बन रही है...' },
  workingSub: { en: 'Computing planetary positions from the Swiss Ephemeris', hi: 'स्विस एफेमेरिस से ग्रह स्थिति की गणना हो रही है' },
  needPlace: { en: 'Please enter the place of birth', hi: 'कृपया जन्म स्थान दर्ज करें' },
  needDate: { en: 'Please enter date and time of birth', hi: 'कृपया जन्म तिथि और समय दर्ज करें' },
  offline: { en: 'Kundli service is not reachable. Make sure the API server is running.', hi: 'कुंडली सेवा उपलब्ध नहीं है। कृपया API सर्वर चालू करें।' },
  didYouMean: { en: 'did you mean', hi: 'क्या आपका मतलब' },
  missingParams: { en: 'Birth details are missing. Please fill the form again.', hi: 'जन्म विवरण उपलब्ध नहीं है। कृपया फ़ॉर्म दोबारा भरें।' },
  // report
  report: { en: 'Kundli report', hi: 'कुंडली रिपोर्ट' },
  edit: { en: 'Edit details', hi: 'विवरण बदलें' },
  print: { en: 'Print / Save PDF', hi: 'प्रिंट / PDF' },
  share: { en: 'Copy link', hi: 'लिंक कॉपी करें' },
  copied: { en: 'Link copied', hi: 'लिंक कॉपी हो गया' },
  navOverview: { en: 'Overview', hi: 'सारांश' }, navCharts: { en: 'Charts', hi: 'कुंडली चक्र' },
  navPlanets: { en: 'Planets', hi: 'ग्रह' }, navDasha: { en: 'Dasha', hi: 'दशा' },
  basic: { en: 'Birth details', hi: 'जन्म विवरण' },
  avakhada: { en: 'Avakhada chakra', hi: 'अवकहड़ा चक्र' },
  panchang: { en: 'Birth panchang', hi: 'जन्म पंचांग' },
  charts: { en: 'Kundli charts', hi: 'कुंडली चक्र' },
  lagnaChart: { en: 'Lagna chart (D1)', hi: 'लग्न कुंडली (D1)' },
  lagnaChartSub: { en: 'Rashi chart — houses counted from the ascendant', hi: 'राशि चक्र — लग्न से भाव' },
  chandraChart: { en: 'Chandra chart', hi: 'चंद्र कुंडली' },
  chandraChartSub: { en: 'Houses counted from the Moon sign', hi: 'चंद्र राशि से भाव' },
  navamsaChart: { en: 'Navamsa (D9)', hi: 'नवमांश (D9)' },
  navamsaChartSub: { en: 'Ninth divisional chart — strength and marriage', hi: 'नवम वर्ग चक्र — बल एवं विवाह' },
  north: { en: 'North Indian', hi: 'उत्तर भारतीय' }, south: { en: 'South Indian', hi: 'दक्षिण भारतीय' },
  housesTitle: { en: 'House by house', hi: 'भाव अनुसार' },
  houseN: { en: 'House', hi: 'भाव' },
  empty: { en: 'Empty', hi: 'रिक्त' },
  legend: { en: 'Symbols', hi: 'संकेत' },
  planets: { en: 'Planetary positions', hi: 'ग्रह स्थिति' },
  dasha: { en: 'Vimshottari dasha', hi: 'विंशोत्तरी दशा' },
  balance: { en: 'Balance at birth', hi: 'जन्म के समय शेष' },
  current: { en: 'Running now', hi: 'वर्तमान' },
  newKundli: { en: 'New Kundli', hi: 'नई कुंडली' },
  planet: { en: 'Planet', hi: 'ग्रह' }, sign: { en: 'Sign', hi: 'राशि' }, signLord: { en: 'Sign lord', hi: 'राशि स्वामी' },
  degree: { en: 'Degree', hi: 'अंश' }, nakshatra: { en: 'Nakshatra', hi: 'नक्षत्र' }, pada: { en: 'Pada', hi: 'चरण' },
  nakLord: { en: 'Nak. lord', hi: 'नक्षत्र स्वामी' }, house: { en: 'House', hi: 'भाव' },
  dignity: { en: 'Dignity', hi: 'स्थिति' }, nature: { en: 'Nature', hi: 'स्वभाव' }, avastha: { en: 'Avastha', hi: 'अवस्था' },
  status: { en: 'Status', hi: 'विशेष' },
  mahadasha: { en: 'Mahadasha', hi: 'महादशा' }, antardasha: { en: 'Antardasha', hi: 'अंतर्दशा' },
  start: { en: 'Start', hi: 'आरंभ' }, end: { en: 'End', hi: 'समाप्ति' }, years: { en: 'yrs', hi: 'वर्ष' },
  date: { en: 'Date', hi: 'तिथि' }, time: { en: 'Time', hi: 'समय' }, tz: { en: 'Timezone', hi: 'समय क्षेत्र' },
  latlon: { en: 'Lat / Long', hi: 'अक्षांश / देशांतर' }, sunrise: { en: 'Sunrise', hi: 'सूर्योदय' }, sunset: { en: 'Sunset', hi: 'सूर्यास्त' },
  ayanamsaVal: { en: 'Ayanamsa', hi: 'अयनांश' }, lagna: { en: 'Lagna', hi: 'लग्न' }, lagnaLord: { en: 'Lagna lord', hi: 'लग्नेश' },
  moonSign: { en: 'Moon sign (Rashi)', hi: 'चंद्र राशि' }, sunSign: { en: 'Sun sign', hi: 'सूर्य राशि' },
  tithi: { en: 'Tithi', hi: 'तिथि' }, yoga: { en: 'Yoga', hi: 'योग' }, karana: { en: 'Karana', hi: 'करण' }, vara: { en: 'Vara', hi: 'वार' },
  varna: { en: 'Varna', hi: 'वर्ण' }, vashya: { en: 'Vashya', hi: 'वश्य' }, yoni: { en: 'Yoni', hi: 'योनि' }, gana: { en: 'Gana', hi: 'गण' },
  nadi: { en: 'Nadi', hi: 'नाड़ी' }, charan: { en: 'Charan', hi: 'चरण' }, nameAlpha: { en: 'Name alphabet', hi: 'नामाक्षर' },
  tatva: { en: 'Tatva', hi: 'तत्व' }, paya: { en: 'Paya', hi: 'पाया' }, yunja: { en: 'Yunja', hi: 'युंजा' },
  native: { en: 'Native', hi: 'जातक' },
  tabOverview: { en: 'Overview', hi: 'सारांश' }, tabCharts: { en: 'Charts', hi: 'कुंडली' }, tabPlanets: { en: 'Planets', hi: 'ग्रह' },
  tabYogas: { en: 'Yogas & Doshas', hi: 'योग-दोष' }, tabDasha: { en: 'Dasha', hi: 'दशा' }, tabVargas: { en: 'Divisional', hi: 'वर्ग' },
  tabAshtak: { en: 'Ashtakavarga', hi: 'अष्टकवर्ग' }, tabAdvanced: { en: 'Advanced', hi: 'उन्नत' },
  tabFaladesh: { en: 'Faladesh', hi: 'फलादेश' }, tabLalKitab: { en: 'Lal Kitab', hi: 'लाल किताब' }, tabKP: { en: 'KP Kundali', hi: 'KP कुंडली' },
  glance: { en: 'At a glance', hi: 'एक नज़र में' }, highlights: { en: 'Highlights', hi: 'मुख्य बिंदु' },
  formedYogas: { en: 'Yogas formed', hi: 'बने हुए योग' }, doshasPresent: { en: 'Doshas present', hi: 'उपस्थित दोष' },
  noDosha: { en: 'No major dosha', hi: 'कोई प्रमुख दोष नहीं' }, openCharts: { en: 'Open all charts', hi: 'सभी कुंडली देखें' },
  openYogas: { en: 'See all yogas', hi: 'सभी योग देखें' }, openDasha: { en: 'Explore dasha', hi: 'दशा देखें' },
  lagnaPreview: { en: 'Lagna chart', hi: 'लग्न कुंडली' }, born: { en: 'Born', hi: 'जन्म' }, at: { en: 'at', hi: 'को' },
  dashaNow: { en: 'Dasha running now', hi: 'वर्तमान दशा' }, until: { en: 'until', hi: 'तक' },
  sadeStatus: { en: 'Sade Sati', hi: 'साढ़े साती' }, generated: { en: 'Computed with Swiss Ephemeris', hi: 'स्विस एफेमेरिस से गणित' },
  // extended sections
  navYogas: { en: 'Yogas & Doshas', hi: 'योग-दोष' }, navVargas: { en: 'Divisional', hi: 'वर्ग' },
  navStrength: { en: 'Ashtakavarga', hi: 'अष्टकवर्ग' }, navMore: { en: 'More', hi: 'अन्य' },
  chalitChart: { en: 'Bhava Chalit', hi: 'भाव चलित' }, chalitChartSub: { en: 'Houses by Placidus cusps — a planet may shift one house from the Rashi chart', hi: 'भाव मध्य के अनुसार — ग्रह राशि चक्र से एक भाव खिसक सकता है' },
  vargas: { en: 'Divisional charts (Shodashvarga)', hi: 'वर्ग कुंडलियाँ (षोडशवर्ग)' },
  vargaTable: { en: 'Shodashvarga table', hi: 'षोडशवर्ग सारणी' }, ownVargas: { en: 'Own', hi: 'स्व' }, exaltedVargas: { en: 'Exalted', hi: 'उच्च' },
  signifies: { en: 'Signifies', hi: 'विषय' },
  yogas: { en: 'Yogas', hi: 'योग' }, yogasSub: { en: 'Classical Parashari yogas found in the Lagna chart', hi: 'लग्न कुंडली में पाए गए शास्त्रीय योग' },
  present: { en: 'Present', hi: 'उपस्थित' }, absent: { en: 'Not formed', hi: 'नहीं बना' }, showAll: { en: 'Show all yogas', hi: 'सभी योग दिखाएँ' },
  hideAll: { en: 'Show formed yogas only', hi: 'केवल बने योग' },
  doshas: { en: 'Doshas', hi: 'दोष' }, level: { en: 'Level', hi: 'स्तर' }, cancellations: { en: 'Cancellations', hi: 'भंग कारण' },
  from: { en: 'From', hi: 'से' }, marsIn: { en: 'Mars in house', hi: 'मंगल भाव' }, none: { en: 'None', hi: 'कोई नहीं' },
  partial: { en: 'Partial', hi: 'आंशिक' }, rahuHouse: { en: 'Rahu house', hi: 'राहु भाव' }, direction: { en: 'Direction', hi: 'दिशा' },
  outsideAxis: { en: 'Outside axis', hi: 'अक्ष से बाहर' },
  sadeSati: { en: 'Sade Sati & Dhaiya', hi: 'साढ़े साती और ढैया' }, saturnNow: { en: 'Saturn now in', hi: 'शनि अभी' },
  period: { en: 'Period', hi: 'अवधि' }, phase: { en: 'Phase', hi: 'चरण' }, saturnIn: { en: 'Saturn in', hi: 'शनि राशि' },
  showPast: { en: 'Show past periods', hi: 'पिछली अवधियाँ दिखाएँ' },
  ashtakavarga: { en: 'Ashtakavarga', hi: 'अष्टकवर्ग' }, sarva: { en: 'Sarvashtakavarga (by house)', hi: 'सर्वाष्टकवर्ग (भाव अनुसार)' },
  bhinna: { en: 'Bhinnashtakavarga (by sign)', hi: 'भिन्नाष्टकवर्ग (राशि अनुसार)' }, total: { en: 'Total', hi: 'योग' }, points: { en: 'points', hi: 'बिंदु' },
  aspects: { en: 'Planetary aspects (Drishti)', hi: 'ग्रह दृष्टि' }, aspectsHouses: { en: 'Aspects houses', hi: 'दृष्ट भाव' }, aspectsPlanets: { en: 'Aspects planets', hi: 'दृष्ट ग्रह' },
  friendship: { en: 'Planetary friendship', hi: 'ग्रह मैत्री' }, natural: { en: 'Natural', hi: 'नैसर्गिक' }, temporal: { en: 'Temporal', hi: 'तात्कालिक' }, compound: { en: 'Compound (Panchadha)', hi: 'पंचधा' },
  karakas: { en: 'Jaimini Chara Karakas', hi: 'जैमिनी चर कारक' }, karaka: { en: 'Karaka', hi: 'कारक' },
  kp: { en: 'KP sub-lords', hi: 'कृष्णमूर्ति उप-स्वामी' }, cusp: { en: 'Cusp', hi: 'भाव आरंभ' }, starLord: { en: 'Star lord', hi: 'नक्षत्र स्वामी' },
  subLord: { en: 'Sub lord', hi: 'उप स्वामी' }, subSubLord: { en: 'Sub-sub lord', hi: 'उप-उप स्वामी' },
  gems: { en: 'Gemstone recommendation', hi: 'रत्न सुझाव' }, gem: { en: 'Gemstone', hi: 'रत्न' },
  yogini: { en: 'Yogini dasha', hi: 'योगिनी दशा' }, yoginiName: { en: 'Yogini', hi: 'योगिनी' },
  dashaExplorer: { en: 'Vimshottari dasha explorer', hi: 'विंशोत्तरी दशा विस्तार' },
  dashaExplorerSub: { en: 'Click a period to open its sub-periods: mahadasha → antardasha → pratyantardasha → sookshma → prana', hi: 'उप-अवधि खोलने के लिए अवधि पर क्लिक करें: महादशा → अंतर्दशा → प्रत्यंतर → सूक्ष्म → प्राण' },
  pratyantar: { en: 'Pratyantardasha', hi: 'प्रत्यंतर दशा' }, sookshma: { en: 'Sookshma dasha', hi: 'सूक्ष्म दशा' }, prana: { en: 'Prana dasha', hi: 'प्राण दशा' },
  allMaha: { en: 'All mahadashas', hi: 'सभी महादशाएँ' }, duration: { en: 'Duration', hi: 'अवधि' }, days: { en: 'days', hi: 'दिन' },
  loadingPeriods: { en: 'Loading periods...', hi: 'अवधियाँ लोड हो रही हैं...' },
  // yoga summary
  yogaGroup: { en: 'Group', hi: 'वर्ग' }, allGroups: { en: 'All', hi: 'सभी' },
  auspiciousCount: { en: 'auspicious', hi: 'शुभ' }, inauspiciousCount: { en: 'inauspicious', hi: 'अशुभ' },
  // avasthas
  avasthas: { en: 'Planetary avasthas (BPHS)', hi: 'ग्रह अवस्थाएँ (बृ.पा.हो.शा.)' },
  baladi: { en: 'Baladi', hi: 'बालादि' }, jagradadi: { en: 'Jagradadi', hi: 'जाग्रतादि' }, deeptadi: { en: 'Deeptadi', hi: 'दीप्तादि' },
  lajjitadi: { en: 'Lajjitadi', hi: 'लज्जितादि' }, sayanadi: { en: 'Sayanadi', hi: 'शयनादि' }, strength: { en: 'Strength', hi: 'बल' },
  conjunct: { en: 'Conjunct', hi: 'युति' }, aspectedBy: { en: 'Aspected by', hi: 'दृष्टि' },
  // chara dasha
  charaDasha: { en: 'Chara dasha (Jaimini)', hi: 'चर दशा (जैमिनी)' }, system: { en: 'System', hi: 'पद्धति' }, variant: { en: 'Variant', hi: 'प्रकार' },
  basis: { en: 'Basis', hi: 'आधार' }, cycle: { en: 'Cycle', hi: 'चक्र' }, planetsInSign: { en: 'Planets in sign', hi: 'राशि में ग्रह' },
  firstCycle: { en: 'First cycle', hi: 'प्रथम चक्र' },
  // faladesh
  faladesh: { en: 'Faladesh — predictions', hi: 'फलादेश' },
  faladeshSub: { en: 'Step-by-step reading of the house, its lord, occupants, aspects, karaka and divisional chart', hi: 'भाव, भावेश, भावस्थ ग्रह, दृष्टियाँ, कारक और वर्ग कुंडली की क्रमबद्ध विवेचना' },
  marriage: { en: 'Marriage', hi: 'विवाह' }, career: { en: 'Career', hi: 'करियर' },
  score: { en: 'Score', hi: 'अंक' }, verdict: { en: 'Verdict', hi: 'निष्कर्ष' }, endResult: { en: 'End result', hi: 'अंतिम फल' },
  chain: { en: 'Step-by-step chain', hi: 'क्रमबद्ध विवेचना' }, strengths: { en: 'Strengths', hi: 'अनुकूल बिंदु' },
  cautions: { en: 'Cautions', hi: 'सावधानियाँ' }, remedies: { en: 'Remedies', hi: 'उपाय' },
  favourablePeriods: { en: 'Favourable periods', hi: 'अनुकूल दशाएँ' }, suggestedFields: { en: 'Suggested fields', hi: 'उपयुक्त क्षेत्र' },
  strongestInfluence: { en: 'Strongest influence', hi: 'सबसे प्रबल प्रभाव' }, age: { en: 'age', hi: 'आयु' },
  method: { en: 'Method', hi: 'विधि' }, bands: { en: 'Result bands', hi: 'फल श्रेणियाँ' }, howComputed: { en: 'How this was computed', hi: 'गणना कैसे हुई' },
  houseLord: { en: 'House lord', hi: 'भावेश' }, inHouse: { en: 'in house', hi: 'भाव में' }, planetsInHouse: { en: 'Planets in house', hi: 'भाव में ग्रह' },
  divisional: { en: 'Divisional chart', hi: 'वर्ग कुंडली' }, weight: { en: 'Weight', hi: 'भार' },
  positive: { en: 'Positive', hi: 'अनुकूल' }, negative: { en: 'Negative', hi: 'प्रतिकूल' }, neutral: { en: 'Neutral', hi: 'सम' },
  faladeshPreview: { en: 'Faladesh', hi: 'फलादेश' }, openFaladesh: { en: 'Read full faladesh', hi: 'पूरा फलादेश पढ़ें' },
  // lal kitab
  lalKitab: { en: 'Lal Kitab', hi: 'लाल किताब' }, lkChart: { en: 'Lal Kitab chart', hi: 'लाल किताब कुंडली' },
  lkPlanets: { en: 'Planets — Lal Kitab reading', hi: 'ग्रह — लाल किताब फल' }, lkLord: { en: 'LK lord', hi: 'ला.कि. स्वामी' },
  pakkaGhar: { en: 'Pakka ghar', hi: 'पक्का घर' }, inPakkaGhar: { en: 'In pakka ghar', hi: 'पक्के घर में' },
  houseRelation: { en: 'House relation', hi: 'घर से संबंध' }, exaltedHouse: { en: 'Exalted house', hi: 'उच्च घर' }, debilitatedHouse: { en: 'Debilitated house', hi: 'नीच घर' },
  reading: { en: 'Reading', hi: 'फल' }, needsRemedy: { en: 'Remedy advised', hi: 'उपाय आवश्यक' },
  rin: { en: 'Rin (karmic debts)', hi: 'ऋण (कार्मिक ऋण)' }, condition: { en: 'Condition', hi: 'शर्त' },
  showAllRin: { en: 'Show all rin', hi: 'सभी ऋण दिखाएँ' }, presentRinOnly: { en: 'Present rin only', hi: 'केवल उपस्थित ऋण' },
  keyRemedies: { en: 'Key remedies', hi: 'मुख्य उपाय' }, emptyHouses: { en: 'Empty houses', hi: 'रिक्त भाव' }, houseBasis: { en: 'House basis', hi: 'भाव आधार' },
  // kp kundali
  kpKundali: { en: 'KP Kundali (Krishnamurti Paddhati)', hi: 'KP कुंडली (कृष्णमूर्ति पद्धति)' },
  cusps: { en: 'Cusps (Placidus)', hi: 'भाव आरंभ (प्लेसिडस)' }, kpPlanets: { en: 'Planets & significators', hi: 'ग्रह और कारकत्व' },
  houseSystem: { en: 'House system', hi: 'भाव पद्धति' }, significators: { en: 'Significators', hi: 'कारकत्व' },
  houseSignificators: { en: 'House significators', hi: 'भाव कारक' }, rulingPlanets: { en: 'Ruling planets', hi: 'रूलिंग ग्रह' },
  fortuna: { en: 'Fortuna (Pars Fortunae)', hi: 'फॉर्च्यूना (भाग्य बिंदु)' }, promises: { en: 'Promises by cuspal sub lord', hi: 'भाव उप-स्वामी से योग' },
  cuspSubLord: { en: 'Cuspal sub lord', hi: 'भाव उप-स्वामी' }, signifiesHouses: { en: 'Signifies houses', hi: 'कारक भाव' },
  favourable: { en: 'Favourable', hi: 'अनुकूल' }, unfavourable: { en: 'Unfavourable', hi: 'प्रतिकूल' },
  owns: { en: 'Owns', hi: 'स्वामित्व' }, longitude: { en: 'Longitude', hi: 'भोगांश' }, retro: { en: 'Retro', hi: 'वक्री' },
  all: { en: 'All', hi: 'सभी' },
  footnote: {
    en: 'Sidereal zodiac, whole-sign houses, Lahiri ayanamsa by default. Positions from the Swiss Ephemeris (1700–2200 CE).',
    hi: 'निरयण राशिचक्र, पूर्ण-राशि भाव, लाहिरी अयनांश (डिफ़ॉल्ट)। ग्रह स्थिति स्विस एफेमेरिस से (1700–2200 ई.)।',
  },
}

export const t = (key, hi) => (UI[key] ? UI[key][hi ? 'hi' : 'en'] : key)

/* ── Astrological ids → display names (only for ids the API leaves untranslated) ── */
export const PLANET_HI = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
  Uranus: 'यूरेनस', Neptune: 'नेपच्यून', Pluto: 'प्लूटो',
}
export const SIGN_HI = {
  Aries: 'मेष', Taurus: 'वृषभ', Gemini: 'मिथुन', Cancer: 'कर्क', Leo: 'सिंह', Virgo: 'कन्या',
  Libra: 'तुला', Scorpio: 'वृश्चिक', Sagittarius: 'धनु', Capricorn: 'मकर', Aquarius: 'कुंभ', Pisces: 'मीन',
}
/** Planet id → localized name. Falls back to the id itself (already-localized strings pass through). */
export const planetName = (id, hi) => (id == null || id === '' ? '-' : hi ? (PLANET_HI[id] || id) : id)
export const signName = (id, hi) => (id == null || id === '' ? '-' : hi ? (SIGN_HI[id] || id) : id)
export const planetList = (ids, hi) => (Array.isArray(ids) && ids.length ? ids.map((p) => planetName(p, hi)).join(', ') : null)

/** Yoga `group` ids (the API sends group_label only for non-classical yogas). */
export const YOGA_GROUPS = {
  classical: { en: 'Classical', hi: 'शास्त्रीय' },
  nabhasa: { en: 'Nabhasa', hi: 'नाभस' },
  other: { en: 'Other', hi: 'अन्य' },
}
export const yogaGroupName = (y, hi) => y.group_label || (YOGA_GROUPS[y.group] ? YOGA_GROUPS[y.group][hi ? 'hi' : 'en'] : y.group || '')

/** Faladesh chain step ids → titles. */
export const FAL_STEPS = {
  house_lord_placement: { en: "Lord's placement", hi: 'भाव स्वामी की स्थिति' },
  house_lord_dignity: { en: "Lord's dignity", hi: 'भावेश की गरिमा' },
  house_lord_combust: { en: 'Lord combust', hi: 'भावेश अस्त' },
  house_lord_retrograde: { en: 'Lord retrograde', hi: 'भावेश वक्री' },
  house_lord_conjunction: { en: 'Conjunctions with the lord', hi: 'स्वामी के साथ युति' },
  house_lord_aspected_by: { en: 'Aspects on the lord', hi: 'स्वामी पर दृष्टि' },
  planet_in_house: { en: 'Planet in the house', hi: 'भाव में स्थित ग्रह' },
  planet_in_house_dignity: { en: "Occupant's dignity", hi: 'भावस्थ ग्रह की गरिमा' },
  house_occupants_conjunction: { en: 'Conjunctions among occupants', hi: 'भावस्थ ग्रहों की युति' },
  house_aspected_by: { en: 'Aspects on the house', hi: 'भाव पर दृष्टि' },
  karaka: { en: 'Karaka', hi: 'कारक' },
  divisional_chart: { en: 'Divisional chart (D9/D10)', hi: 'वर्ग कुंडली (D9/D10)' },
}
export const falStep = (id, hi) => (FAL_STEPS[id] ? FAL_STEPS[id][hi ? 'hi' : 'en'] : String(id || '').replace(/_/g, ' '))

/** KP promise verdict id → badge tone (kd-badge--*). */
export const kpVerdictTone = (v = '') => (/obstacle/i.test(v) ? 'warn' : /^promised/i.test(v) ? 'yes' : /denied|delayed/i.test(v) ? 'bad' : /weak|mild/i.test(v) ? 'mid' : 'no')
/** Faladesh band id → badge tone. */
export const falBandTone = (b = '') => (/excellent|very good/i.test(b) ? 'yes' : /^good/i.test(b) ? 'good' : /mixed/i.test(b) ? 'warn' : /challenging|difficult/i.test(b) ? 'bad' : 'no')
