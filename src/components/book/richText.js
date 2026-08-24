/* ── Rich text from the editor ────────────────────────────────────────
   Most book fields are plain text, but some — tables above all — are stored
   as HTML written in the admin's Quill editor. That markup carries the
   editor's own inline styling (`color: black`, hard-coded borders) which
   fights the reader's themes, so instead of trusting it we parse it into an
   inert document, keep only structural tags, and let book.css do the
   typesetting.
────────────────────────────────────────────────────────────────────── */

const HTML_RE =
  /<(p|div|br|hr|table|thead|tbody|tfoot|tr|td|th|caption|ul|ol|li|strong|b|em|i|u|s|span|h[1-6]|blockquote|pre|code|sup|sub|a|img|figure)\b[^>]*>/i

export const looksLikeHtml = (raw) => typeof raw === 'string' && HTML_RE.test(raw)

// Kept for their structure. Anything else is unwrapped so its text survives.
const KEEP = new Set([
  'p', 'br', 'hr', 'span', 'div', 'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
  'a', 'img', 'figure', 'figcaption',
])

// Dropped along with their contents — none of it is book text.
const DROP = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'noscript',
  'svg', 'math', 'form', 'input', 'button', 'select', 'textarea', 'video', 'audio', 'base',
])

const ATTRS = {
  a: ['href', 'title'],
  img: ['src', 'alt'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
}

const safeUrl = (value) => {
  const url = String(value || '').replace(/[\u0000-\u001F\u007F]/g, '').trim()
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : null
}

/** Quill records alignment as a class; keep it as data so CSS can honour it. */
const alignOf = (el) => {
  const cls = el.getAttribute('class') || ''
  const hit = cls.match(/ql-align-(left|center|right|justify)/)
  if (hit) return hit[1]
  const style = el.getAttribute('style') || ''
  const inline = style.match(/text-align\s*:\s*(left|center|right|justify)/i)
  return inline ? inline[1].toLowerCase() : null
}

/**
 * The editor peppers its output with non-breaking spaces, which stop table
 * cells and long lines from wrapping and so force text off the page. They are
 * an artefact of the editor rather than the author's intent, so they go back
 * to ordinary spaces.
 */
const unpin = (root, doc) => {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node.nodeValue.includes('\u00A0')) node.nodeValue = node.nodeValue.replace(/\u00A0/g, ' ')
  }
}

const scrub = (root) => {
  for (const el of [...root.querySelectorAll('*')]) {
    if (!el.isConnected) continue
    const tag = el.tagName.toLowerCase()

    if (DROP.has(tag)) {
      el.remove()
      continue
    }

    if (!KEEP.has(tag)) {
      el.replaceWith(...el.childNodes)
      continue
    }

    const align = alignOf(el)
    const list = tag === 'li' ? el.getAttribute('data-list') : null
    const allowed = ATTRS[tag] || []
    const carry = allowed
      .map((name) => [name, el.getAttribute(name)])
      .filter(([, value]) => value != null)

    for (const attr of [...el.attributes]) el.removeAttribute(attr.name)

    for (const [name, value] of carry) {
      if (name === 'href' || name === 'src') {
        const url = safeUrl(value)
        if (url) el.setAttribute(name, url)
      } else {
        el.setAttribute(name, value)
      }
    }

    if (align) el.setAttribute('data-align', align)
    if (list === 'bullet') el.setAttribute('data-list', 'bullet')
    if (tag === 'a') {
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')
    }
  }
}

const isBold = (cell) => {
  const text = cell.textContent.trim()
  if (!text) return true
  const strong = cell.querySelector('strong, b')
  return !!strong && strong.textContent.trim() === text
}

/**
 * The editor writes header rows as ordinary bold cells, so tables arrive with
 * no <th> to style. Flag an all-bold first row as the head, and give every
 * table a wrapper it can scroll inside on narrow screens.
 */
const dressTables = (root, doc) => {
  for (const table of [...root.querySelectorAll('table')]) {
    const rows = table.querySelectorAll('tr')
    const first = rows[0]
    if (first && !table.querySelector('th') && [...first.children].every(isBold)) {
      first.setAttribute('data-head', '')
    }

    const wrap = doc.createElement('div')
    wrap.className = 'bk-tablewrap'
    table.replaceWith(wrap)
    wrap.appendChild(table)
  }
}

// `#बृoजाo1-1#` source references, the same convention the plain-text fields use.
const CITE_RE = /#([^#\n]{1,80})#/g

const appendText = (parent, text, needle, doc) => {
  if (!needle) {
    parent.appendChild(doc.createTextNode(text))
    return
  }
  const hay = text.toLowerCase()
  let cursor = 0
  let at = hay.indexOf(needle)
  while (at !== -1) {
    if (at > cursor) parent.appendChild(doc.createTextNode(text.slice(cursor, at)))
    const hit = doc.createElement('mark')
    hit.className = 'bk-hit'
    hit.textContent = text.slice(at, at + needle.length)
    parent.appendChild(hit)
    cursor = at + needle.length
    at = hay.indexOf(needle, cursor)
  }
  if (cursor < text.length) parent.appendChild(doc.createTextNode(text.slice(cursor)))
}

/**
 * Gives the words the same inline treatment as the plain-text path: citations
 * become pills, search hits become <mark>.
 */
const decorate = (root, doc, query) => {
  const needle = query.trim().toLowerCase()
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)

  for (const node of nodes) {
    const value = node.nodeValue
    if (!value.trim()) continue

    const pieces = []
    let cursor = 0
    let match
    CITE_RE.lastIndex = 0
    while ((match = CITE_RE.exec(value)) !== null) {
      if (match.index > cursor) pieces.push({ text: value.slice(cursor, match.index) })
      pieces.push({ text: match[1], cite: true })
      cursor = match.index + match[0].length
    }
    if (cursor < value.length) pieces.push({ text: value.slice(cursor) })
    if (!needle && pieces.every((p) => !p.cite)) continue

    const fragment = doc.createDocumentFragment()
    for (const piece of pieces) {
      if (!piece.cite) {
        appendText(fragment, piece.text, needle, doc)
        continue
      }
      const pill = doc.createElement('span')
      pill.className = 'bk-cite'
      pill.setAttribute('title', piece.text)
      appendText(pill, piece.text, needle, doc)
      fragment.appendChild(pill)
    }
    node.replaceWith(fragment)
  }
}

/**
 * Reduces editor HTML to the tags the reader is willing to render. Parsing
 * happens in an inert document, so nothing in the markup can run or load
 * while it is being cleaned.
 */
export const sanitizeHtml = (raw, query = '') => {
  if (!raw || typeof raw !== 'string') return ''
  if (typeof DOMParser === 'undefined') return ''

  const doc = new DOMParser().parseFromString(raw, 'text/html')
  scrub(doc.body)
  unpin(doc.body, doc)
  dressTables(doc.body, doc)
  decorate(doc.body, doc, query)
  return doc.body.innerHTML
}

/** Editor markup reduced to its words, for searching and for excerpts. */
export const htmlToText = (raw) =>
  String(raw || '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/tr|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<\/td>\s*<td[^>]*>/gi, ' \u2022 ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
