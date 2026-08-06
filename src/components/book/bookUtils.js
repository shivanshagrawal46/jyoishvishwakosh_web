import { useCallback, useEffect, useRef, useState } from 'react'

const MEDIA_HOST = 'https://www.jyotishvishwakosh.in'

export const getBookImageUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${MEDIA_HOST}${path.startsWith('/') ? '' : '/'}${path}`
}

/* ── Copy ─────────────────────────────────────────────────────────── */
const STRINGS = {
  hindi: {
    library: 'ग्रंथालय',
    libraryTitle: 'ग्रंथ संग्रह',
    libraryLede: 'प्राचीन ज्योतिष, वास्तु एवं धर्मशास्त्र के मूल ग्रंथ — मूल श्लोक, हिन्दी व्याख्या और अंग्रेज़ी अनुवाद के साथ।',
    categories: 'श्रेणियाँ',
    allCategories: 'सभी श्रेणियाँ',
    books: 'ग्रंथ',
    book: 'ग्रंथ',
    chapters: 'अध्याय',
    chapter: 'अध्याय',
    topics: 'प्रसंग',
    topic: 'प्रसंग',
    pages: 'पृष्ठ',
    page: 'पृष्ठ',
    search: 'ग्रंथ खोजें…',
    searchTopics: 'इस अध्याय में खोजें…',
    searchIndex: 'अनुक्रमणिका में खोजें…',
    sort: 'क्रम',
    sortDefault: 'ग्रंथ क्रम',
    sortAZ: 'नाम (क – ज्ञ)',
    sortZA: 'नाम (ज्ञ – क)',
    sortPages: 'सर्वाधिक पृष्ठ',
    gridView: 'ग्रिड',
    listView: 'सूची',
    read: 'पढ़ें',
    readNow: 'पढ़ना आरम्भ करें',
    continueReading: 'पढ़ना जारी रखें',
    openBook: 'ग्रंथ खोलें',
    index: 'अनुक्रमणिका',
    contents: 'विषय-सूची',
    author: 'रचनाकार',
    publications: 'प्रकाशन',
    isbn: 'ISBN',
    acknowledgement: 'आभार',
    ackEmpty: 'इस ग्रंथ का आभार-लेख अभी जोड़ा नहीं गया है',
    readFull: 'पूरा पढ़ें',
    readLess: 'संक्षेप में',
    category: 'श्रेणी',
    colophon: 'ग्रंथ परिचय',
    verse: 'मूल श्लोक',
    meaning: 'हिन्दी व्याख्या',
    english: 'English Translation',
    noTranslation: 'अनुवाद उपलब्ध नहीं',
    loading: 'लोड हो रहा है…',
    loadingBook: 'ग्रंथ खुल रहा है…',
    empty: 'कुछ नहीं मिला',
    emptySearch: 'आपकी खोज से मेल खाता कोई परिणाम नहीं',
    emptySearchHint: 'कोई दूसरा शब्द आज़माएँ या खोज हटा दें',
    emptyBooks: 'इस श्रेणी में अभी कोई ग्रंथ उपलब्ध नहीं है',
    emptyBooksHint: 'हम शीघ्र ही नए ग्रंथ जोड़ रहे हैं। कृपया अन्य श्रेणी देखें।',
    emptyChapters: 'इस ग्रंथ की सामग्री तैयार हो रही है',
    emptyChaptersHint: 'अध्याय शीघ्र ही उपलब्ध होंगे।',
    emptyContent: 'इस अध्याय में कोई प्रसंग उपलब्ध नहीं',
    error: 'कुछ त्रुटि हुई',
    errorHint: 'कृपया अपना इंटरनेट संपर्क जाँचें और पुनः प्रयास करें।',
    retry: 'पुनः प्रयास करें',
    clearSearch: 'खोज हटाएँ',
    back: 'वापस',
    prevChapter: 'पूर्व अध्याय',
    nextChapter: 'अगला अध्याय',
    typography: 'पाठ शैली',
    fontSize: 'अक्षर आकार',
    lineHeight: 'पंक्ति अंतर',
    width: 'चौड़ाई',
    justify: 'समान हाशिया',
    theme: 'रंग रूप',
    themeParchment: 'भोजपत्र',
    themeLight: 'श्वेत',
    themeSepia: 'सेपिया',
    themeDark: 'रात्रि',
    expandAll: 'सब खोलें',
    collapseAll: 'सब बंद करें',
    focusMode: 'एकाग्र पाठ',
    bookmark: 'चिह्न लगाएँ',
    bookmarked: 'चिह्नित',
    share: 'साझा करें',
    linkCopied: 'लिंक प्रति बन गई',
    top: 'ऊपर',
    results: 'परिणाम',
    noResults: 'कोई परिणाम नहीं',
    of: 'में से',
    langBoth: 'हिन्दी + English',
    hindiSanskrit: 'हिन्दी / संस्कृत',
    unknownAuthor: 'उपलब्ध नहीं',
    keyboardHint: 'अध्याय बदलने के लिए तीर कुंजी दबाएँ',
    inThisBook: 'इस ग्रंथ में',
    startFrom: 'यहाँ से आरम्भ करें',
    lastRead: 'पिछला पठन',
  },
  english: {
    library: 'Granthalaya',
    libraryTitle: 'The Book Collection',
    libraryLede: 'Original treatises on Jyotisha, Vastu and Dharmashastra — with the source verse, Hindi commentary and English translation.',
    categories: 'Categories',
    allCategories: 'All categories',
    books: 'Books',
    book: 'Book',
    chapters: 'Chapters',
    chapter: 'Chapter',
    topics: 'Topics',
    topic: 'Topic',
    pages: 'Pages',
    page: 'Page',
    search: 'Search books…',
    searchTopics: 'Search in this chapter…',
    searchIndex: 'Search the index…',
    sort: 'Sort',
    sortDefault: 'Book order',
    sortAZ: 'Name (A – Z)',
    sortZA: 'Name (Z – A)',
    sortPages: 'Most pages',
    gridView: 'Grid',
    listView: 'List',
    read: 'Read',
    readNow: 'Start reading',
    continueReading: 'Continue reading',
    openBook: 'Open book',
    index: 'Index',
    contents: 'Contents',
    author: 'Author',
    publications: 'Publisher',
    isbn: 'ISBN',
    acknowledgement: 'Acknowledgement',
    ackEmpty: 'No acknowledgement has been recorded for this volume yet',
    readFull: 'Read in full',
    readLess: 'Show less',
    category: 'Category',
    colophon: 'About this edition',
    verse: 'Original verse',
    meaning: 'Hindi commentary',
    english: 'English translation',
    noTranslation: 'no English translation yet',
    loading: 'Loading…',
    loadingBook: 'Opening the book…',
    empty: 'Nothing here yet',
    emptySearch: 'No results match your search',
    emptySearchHint: 'Try a different word, or clear the search.',
    emptyBooks: 'No books in this category yet',
    emptyBooksHint: 'New titles are being added. Please explore another category.',
    emptyChapters: 'This book is being prepared',
    emptyChaptersHint: 'Chapters will appear here shortly.',
    emptyContent: 'No topics available in this chapter',
    error: 'Something went wrong',
    errorHint: 'Please check your connection and try again.',
    retry: 'Try again',
    clearSearch: 'Clear search',
    back: 'Back',
    prevChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    typography: 'Typography',
    fontSize: 'Text size',
    lineHeight: 'Line spacing',
    width: 'Column width',
    justify: 'Justify',
    theme: 'Theme',
    themeParchment: 'Parchment',
    themeLight: 'Light',
    themeSepia: 'Sepia',
    themeDark: 'Night',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    focusMode: 'Focus mode',
    bookmark: 'Bookmark',
    bookmarked: 'Bookmarked',
    share: 'Share',
    linkCopied: 'Link copied',
    top: 'Top',
    results: 'results',
    noResults: 'No matches',
    of: 'of',
    langBoth: 'Hindi + English',
    hindiSanskrit: 'Hindi / Sanskrit',
    unknownAuthor: 'Not recorded',
    keyboardHint: 'Use the arrow keys to change chapter',
    inThisBook: 'In this book',
    startFrom: 'Start here',
    lastRead: 'Last read',
  },
}

export const useT = (language) => {
  const dict = STRINGS[language === 'english' ? 'english' : 'hindi']
  return useCallback((key) => dict[key] ?? key, [dict])
}

export const isHindi = (language) => language !== 'english'

/** Devanagari numerals make page/chapter numbers feel typeset rather than generic. */
const DEVA_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export const localeNum = (value, language) => {
  if (value === null || value === undefined || value === '') return ''
  const str = String(value)
  if (language === 'english') return str
  return str.replace(/\d/g, (d) => DEVA_DIGITS[Number(d)])
}

/* ── localStorage-backed state ────────────────────────────────────── */
export const readStored = (key, fallback = null) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * State mirrored into localStorage. When `key` changes — the reader stays mounted
 * across book-to-book navigation, so its bookmark key can change underneath it —
 * the value is re-read from the new key rather than written over it.
 */
export const useStored = (key, initial) => {
  const [value, setValue] = useState(() => readStored(key, initial))
  const written = useRef(key)

  useEffect(() => {
    if (written.current === key) return
    written.current = key
    setValue(readStored(key, initial))
    // `initial` is a literal default at every call site, so it is not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (written.current !== key) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota or private mode — preferences simply won't persist */
    }
  }, [key, value])

  return [value, setValue]
}

export const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

/* ── Reader preference scales ─────────────────────────────────────── */
export const SIZE_STEPS = ['0.94rem', '1.02rem', '1.12rem', '1.24rem', '1.38rem']
export const LEADING_STEPS = [1.7, 1.95, 2.2]
export const MEASURE_STEPS = ['58ch', '70ch', '84ch']
export const THEMES = ['parchment', 'light', 'sepia', 'dark']

/* ── Content text handling ───────────────────────────────────────────
   Book content arrives as plain text (not HTML): CRLF line breaks, `☞` and
   `❖` list markers, and `#…#` citation markers such as `#बृoजाo1-1#`. The old
   reader pushed it through dangerouslySetInnerHTML, which collapsed every
   line break. These helpers turn it into real structure instead.
─────────────────────────────────────────────────────────────────────── */

export const normalizeText = (raw) => {
  if (!raw || typeof raw !== 'string') return ''
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const MARKER_GLYPHS = ['☞', '❖', '➤', '►', '•', '‣', '※', '⁕']

const MARKER_RE = new RegExp(`^\\s*([${MARKER_GLYPHS.join('')}])\\s*`)

/**
 * A run of short lines that each close with a danda is metrical text — the
 * padyātmaka verses quoted inside the commentary. Detecting them lets the reader
 * typeset them as a stanza instead of mashing them into a paragraph. Prose in
 * this corpus arrives as one long unbroken line, hence the length ceiling.
 */
const looksMetrical = (lines) => {
  if (lines.length < 2) return false
  const avg = lines.reduce((sum, l) => sum + l.length, 0) / lines.length
  if (avg > 120) return false
  const closed = lines.filter((l) => /[।॥][।॥]?\s*$/.test(l)).length
  return closed / lines.length >= 0.7
}

/**
 * Groups normalized text into renderable blocks:
 *   { kind: 'para',   lines }               – a run of ordinary lines
 *   { kind: 'stanza', lines }               – metrical lines, typeset as verse
 *   { kind: 'mark', glyph, text, head }     – a ☞/❖ marker line
 * `head` is true for ❖, which the source uses for sub-headings.
 */
export const parseBlocks = (raw) => {
  const text = normalizeText(raw)
  if (!text) return []

  const blocks = []
  let buffer = []

  const flush = () => {
    if (!buffer.length) return
    blocks.push({ kind: looksMetrical(buffer) ? 'stanza' : 'para', lines: buffer })
    buffer = []
  }

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) {
      flush()
      continue
    }
    const match = trimmed.match(MARKER_RE)
    if (match) {
      flush()
      const glyph = match[1]
      blocks.push({
        kind: 'mark',
        glyph,
        text: trimmed.slice(match[0].length),
        head: glyph === '❖',
      })
    } else {
      buffer.push(trimmed)
    }
  }
  flush()
  return blocks
}

// Searches only the text the reader can actually see, so a hit always has
// something to highlight. The reader mirrors this choice of commentary.
export const topicSearchBlob = (item, language = 'hindi') => {
  const commentary =
    language === 'english' && item.extra?.trim() ? item.extra : item.details
  return [item.title_hn, item.title_en, item.title_hinglish, item.meaning, commentary]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the textarea path */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

/* ── Transient toast ─────────────────────────────────────────────── */
export const useToast = () => {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const show = useCallback((text) => {
    setMessage(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 1900)
  }, [])

  useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  return [message, show]
}

/* ── Progress / bookmarks ─────────────────────────────────────────── */
export const progressKey = (bookId) => `bk:progress:${bookId}`
export const bookmarksKey = (bookId) => `bk:marks:${bookId}`
export const PREFS_KEY = 'bk:prefs'

export const saveProgress = (bookId, entry) => writeStored(progressKey(bookId), { ...entry, at: Date.now() })
export const loadProgress = (bookId) => readStored(progressKey(bookId), null)

export const buildReaderPath = (categoryId, bookId, chapterId, topicId) =>
  `/books/${categoryId}/${bookId}/${chapterId}${topicId ? `#t-${topicId}` : ''}`
