/** One-off: totals the library so the landing figures are real. */
const API = 'https://www.jyotishvishwakosh.in/api'

const get = async (path) => {
  try {
    const r = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

// ── Books ──────────────────────────────────────────────────────────
const bookCats = (await get('/book/category'))?.data || []
let books = 0
for (const c of bookCats) {
  const page = await get(`/book/category/${c.id}?page=1`)
  books += page?.pagination?.totalItems ?? (page?.data?.length || 0)
}
console.log(`book categories: ${bookCats.length}, books: ${books}`)

// ── Kosh family (nine pages share this shape) ──────────────────────
let koshEntries = 0
let koshCats = 0
for (let id = 1; id <= 12; id++) {
  const cat = await get(`/kosh-category/${id}`)
  const subs = cat?.subcategories || cat?.data?.subcategories || []
  if (!subs.length) continue
  koshCats += subs.length
  for (const sub of subs) {
    const page = await get(`/kosh-category/${id}/${sub.id}?page=1`)
    const total = page?.totalContents
      ?? page?.data?.pagination?.totalItems
      ?? page?.pagination?.totalItems
    koshEntries += total || 0
  }
  console.log(`  kosh-category ${id}: ${subs.length} subcategories, running total ${koshEntries}`)
}
console.log(`kosh subcategories: ${koshCats}, entries: ${koshEntries}`)

// ── Magazines ──────────────────────────────────────────────────────
const mag = await get('/emagazine/all')
console.log(`magazines: ${mag?.pagination?.totalMagazines ?? mag?.magazines?.length}`)

// ── Quiz ───────────────────────────────────────────────────────────
const quiz = (await get('/mcq/practice/categories'))?.data || []
console.log(`quiz questions: ${quiz.reduce((n, c) => n + (c.question_count || 0), 0)}`)

console.log(`\nGRAND TOTAL of readable entries: ${books + koshEntries}`)
