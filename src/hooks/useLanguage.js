import { useEffect, useState } from 'react'

const KEY = 'jv-lang'

/** Language choice, persisted across reloads and mirrored onto <html lang>. */
export default function useLanguage() {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved === 'hindi' || saved === 'english') return saved
    } catch {}
    return 'english'
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, language) } catch {}
    document.documentElement.lang = language === 'english' ? 'en' : 'hi'
  }, [language])

  return [language, setLanguage]
}
