import React, { useMemo } from 'react'
import { parseBlocks, normalizeText } from './bookUtils'
import { looksLikeHtml, sanitizeHtml } from './richText'

// `#बृoजाo1-1#` style source references embedded in the prose.
const CITE_RE = /#([^#\n]{1,80})#/g

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Splits a plain string into React nodes, turning `#…#` citations into pills and
 * wrapping search hits in <mark>. Returns a flat array so callers can drop it
 * straight into JSX.
 */
const inlineNodes = (text, query, keyBase) => {
  const nodes = []
  let cursor = 0
  let key = 0

  const pushPlain = (chunk) => {
    if (!chunk) return
    if (!query) {
      nodes.push(chunk)
      return
    }
    const parts = chunk.split(new RegExp(`(${escapeRe(query)})`, 'gi'))
    parts.forEach((part) => {
      if (!part) return
      if (part.toLowerCase() === query.toLowerCase()) {
        nodes.push(<mark className="bk-hit" key={`${keyBase}-h${key++}`}>{part}</mark>)
      } else {
        nodes.push(part)
      }
    })
  }

  CITE_RE.lastIndex = 0
  let match
  while ((match = CITE_RE.exec(text)) !== null) {
    pushPlain(text.slice(cursor, match.index))
    nodes.push(
      <span className="bk-cite" key={`${keyBase}-c${key++}`} title={match[1]}>
        {match[1]}
      </span>
    )
    cursor = match.index + match[0].length
  }
  pushPlain(text.slice(cursor))

  return nodes
}

/**
 * Renders one of the book's content fields as typeset prose.
 *
 * `variant` picks the type treatment:
 *   - 'verse'  Sanskrit śloka: centred, preserves the source's line breaks
 *   - 'deva'   Hindi commentary
 *   - 'latin'  English translation
 */
const BookText = ({ text, variant = 'deva', query = '', id }) => {
  // A handful of fields hold editor HTML — tables, mostly — rather than the
  // plain text the rest of the corpus uses. Those bypass the block parser,
  // including in a verse slot: a table cannot be typeset as a śloka.
  const isHtml = looksLikeHtml(text)

  const html = useMemo(() => (isHtml ? sanitizeHtml(text, query) : ''), [isHtml, text, query])

  const content = useMemo(() => {
    if (isHtml) return null
    if (variant === 'verse') return normalizeText(text)
    return parseBlocks(text)
  }, [isHtml, text, variant])

  const className = `bk-prose ${variant === 'latin' ? 'bk-prose--latin' : 'bk-prose--deva'}`

  if (isHtml) {
    if (!html) return null
    return (
      <div
        className={`${className} bk-prose--html`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  if (!content || (Array.isArray(content) && content.length === 0)) return null

  // A verse is typographic data: every line break in the source is deliberate,
  // so it is rendered verbatim inside a pre-wrap plate.
  if (variant === 'verse') {
    return <div className="bk-verse">{inlineNodes(content, query, `${id}-v`)}</div>
  }

  // Line breaks inside a run are meaningful in this corpus, so they are kept.
  const lineNodes = (lines, keyBase) =>
    lines.map((line, i) => (
      <React.Fragment key={`${keyBase}-l${i}`}>
        {i > 0 && <br />}
        {inlineNodes(line, query, `${keyBase}-l${i}`)}
      </React.Fragment>
    ))

  return (
    <div className={className}>
      {content.map((block, i) => {
        const keyBase = `${id}-b${i}`
        if (block.kind === 'mark') {
          return (
            <div className={`bk-mark${block.head ? ' bk-mark--head' : ''}`} key={keyBase}>
              <span className="bk-mark-glyph" aria-hidden="true">{block.glyph}</span>
              <span>{inlineNodes(block.text, query, keyBase)}</span>
            </div>
          )
        }
        if (block.kind === 'stanza') {
          return (
            <div className="bk-stanza" key={keyBase}>
              {lineNodes(block.lines, keyBase)}
            </div>
          )
        }
        return <p key={keyBase}>{lineNodes(block.lines, keyBase)}</p>
      })}
    </div>
  )
}

export default BookText
