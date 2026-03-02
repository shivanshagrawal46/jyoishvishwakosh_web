import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createCsu3Row,
  deleteCsu3PageAll,
  fetchCsu3PageData,
  fetchCsu3Pages,
  updateCsu3Row
} from '../services/api'

export default function CsuPrinting3Page() {
  const [pageNo, setPageNo] = useState(1)
  const [pagesList, setPagesList] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [newPageInput, setNewPageInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [newRow, setNewRow] = useState({
    sequence: '',
    heading: '',
    content: ''
  })
  const [pagedRows, setPagedRows] = useState([])
  const [editingContentId, setEditingContentId] = useState(null)
  const [editingSegmentKey, setEditingSegmentKey] = useState(null)
  const [editingContentValue, setEditingContentValue] = useState('')
  const [saving, setSaving] = useState(null)
  const measureRef = useRef(null)

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
    [rows]
  )

  const loadPages = useCallback(async () => {
    try {
      const res = await fetchCsu3Pages()
      setPagesList(res?.data || (Array.isArray(res) ? res : []))
    } catch (e) {
      console.error(e)
    }
  }, [])

  const loadPageData = useCallback(async (pn) => {
    if (!pn) return
    setLoading(true)
    try {
      const res = await fetchCsu3PageData(pn)
      const items = res?.data || (Array.isArray(res) ? res : [])
      setRows(items)
    } catch (e) {
      console.error(e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  useEffect(() => {
    loadPageData(pageNo)
  }, [pageNo, loadPageData])

  useEffect(() => {
    const measureEl = measureRef.current
    if (!measureEl) return
    if (sortedRows.length === 0) {
      setPagedRows([])
      return
    }

    const pages = []
    let currentPage = []
    measureEl.innerHTML = ''

    const buildDomBlock = (segment) => {
      const block = document.createElement('div')
      block.className = 'csu3-block'

      if (segment.heading) {
        const heading = document.createElement('div')
        heading.className = 'csu3-heading'
        heading.textContent = segment.heading
        block.appendChild(heading)
      }

      if (segment.content) {
        const content = document.createElement('div')
        content.className = 'csu3-content'
        content.textContent = segment.content
        block.appendChild(content)
      }
      return block
    }

    const fitsSegment = (segment) => {
      const node = buildDomBlock(segment)
      measureEl.appendChild(node)
      const fits = measureEl.scrollHeight <= measureEl.clientHeight
      measureEl.removeChild(node)
      return fits
    }

    const commitSegment = (segment) => {
      const node = buildDomBlock(segment)
      measureEl.appendChild(node)
      currentPage.push(segment)
    }

    const flushPage = () => {
      if (currentPage.length > 0) pages.push(currentPage)
      currentPage = []
      measureEl.innerHTML = ''
    }

    const breakIndex = (text, maxIdx) => {
      const safeMax = Math.min(maxIdx, text.length)
      for (let i = safeMax; i > 0; i--) {
        const ch = text[i]
        if (ch === ' ' || ch === ',' || ch === '|' || ch === '।' || ch === '\n' || ch === '-') {
          return i
        }
      }
      return safeMax
    }

    const bestCutThatFits = (rowId, heading, text, continued) => {
      let lo = 1
      let hi = text.length
      let best = 0

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        let cut = breakIndex(text, mid)
        if (cut <= 0) cut = mid
        const chunk = text.slice(0, cut).trimEnd()
        if (!chunk) {
          lo = mid + 1
          continue
        }

        const candidate = { rowId, heading, content: chunk, continued }
        if (fitsSegment(candidate)) {
          best = cut
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      return best
    }

    sortedRows.forEach((row) => {
      const rowId = row._id
      const baseHeading = row.heading || ''
      let remaining = (row.content || '').trim()
      let continued = false

      if (!remaining) {
        const segment = { rowId, heading: baseHeading, content: '', continued: false }
        if (!fitsSegment(segment) && currentPage.length > 0) flushPage()
        commitSegment(segment)
        return
      }

      while (remaining.length > 0) {
        const headingForSegment = baseHeading
        const fullSegment = {
          rowId,
          heading: headingForSegment,
          content: remaining,
          continued
        }

        if (fitsSegment(fullSegment)) {
          commitSegment(fullSegment)
          remaining = ''
          break
        }

        if (currentPage.length > 0) {
          flushPage()
          continue
        }

        const cut = bestCutThatFits(rowId, headingForSegment, remaining, continued)
        if (cut <= 0) {
          const forced = remaining.slice(0, 1)
          commitSegment({ rowId, heading: headingForSegment, content: forced, continued })
          remaining = remaining.slice(1).trimStart()
        } else {
          const chunk = remaining.slice(0, cut).trimEnd()
          commitSegment({ rowId, heading: headingForSegment, content: chunk, continued })
          remaining = remaining.slice(cut).trimStart()
        }

        continued = true
        flushPage()
      }
    })

    if (currentPage.length > 0) pages.push(currentPage)
    setPagedRows(pages)
  }, [sortedRows])

  const handleCreateRow = async () => {
    if (!newRow.heading && !newRow.content) return
    setCreating(true)
    setStatus(null)
    try {
      const payload = {
        pageNo,
        heading: newRow.heading || undefined,
        content: newRow.content || undefined,
        sequence: newRow.sequence ? Number(newRow.sequence) : undefined
      }
      const res = await createCsu3Row(payload)
      if (res.success !== false) {
        setStatus({ type: 'success', text: 'CSU3 row created' })
        setNewRow({ sequence: '', heading: '', content: '' })
        loadPages()
        loadPageData(pageNo)
      } else {
        setStatus({ type: 'error', text: res.message || 'Create failed' })
      }
    } catch (e) {
      setStatus({ type: 'error', text: e.message })
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePage = async () => {
    if (!pageNo || !window.confirm(`Delete all CSU3 data for page ${pageNo}?`)) return
    try {
      await deleteCsu3PageAll(pageNo)
      setRows([])
      setStatus({ type: 'success', text: `Page ${pageNo} deleted` })
      loadPages()
    } catch (e) {
      setStatus({ type: 'error', text: e.message })
    }
  }

  const handleGoToPage = () => {
    const pn = parseInt(newPageInput, 10)
    if (pn > 0) {
      setPageNo(pn)
      setNewPageInput('')
    }
  }

  const handlePrint = () => window.print()

  const startContentEdit = (row) => {
    if (!row?._id) return
    setEditingContentId(row._id)
    setEditingSegmentKey(row._id)
    setEditingContentValue(row.content || '')
  }

  const saveContentEdit = async () => {
    if (!editingContentId) return
    const row = rows.find((r) => r._id === editingContentId)
    if (!row) {
      setEditingContentId(null)
      setEditingSegmentKey(null)
      return
    }
    const newContent = editingContentValue.trim()
    const oldContent = (row.content || '').trim()
    setEditingContentId(null)
    setEditingSegmentKey(null)
    if (newContent === oldContent) return
    setSaving(editingContentId)
    try {
      await updateCsu3Row(editingContentId, { content: newContent })
      await loadPageData(pageNo)
    } catch (e) {
      console.error(e)
      setStatus({ type: 'error', text: 'Content save failed' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="csu-page">
      <div className="csu-admin no-print">
        <div className="csu-admin-top">
          <div className="csu-admin-brand">
            <div className="csu-brand-icon">ॐ</div>
            <div>
              <h1>CSU3 Printing Console</h1>
              <p>Heading + Content A6 pagination</p>
            </div>
          </div>
        </div>

        <div className="csu-admin-grid">
          <div className="csu-card">
            <div className="csu-card-label">Page Selection</div>
            <div className="csu-chips">
              {pagesList.map((p) => {
                const pn = p.pageNo ?? p._id
                return (
                  <button
                    key={pn}
                    className={`csu-chip ${pn === pageNo ? 'active' : ''}`}
                    onClick={() => setPageNo(pn)}
                  >
                    {pn}
                    <span className="csu-chip-n">{p.count ?? p.rowCount ?? ''}</span>
                  </button>
                )
              })}
              {pagesList.length === 0 && <span className="csu-muted">No pages yet</span>}
            </div>
            <div className="csu-goto-row">
              <input
                type="number"
                min="1"
                placeholder="Go to page..."
                value={newPageInput}
                onChange={(e) => setNewPageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
              />
              <button onClick={handleGoToPage} disabled={!newPageInput}>
                Go
              </button>
            </div>
            <div className="csu-active-page">
              Active <strong className="csu-page-num">Page {pageNo}</strong>
              {rows.length > 0 && <span className="csu-row-count">{rows.length} blocks</span>}
            </div>
          </div>

          <div className="csu-card">
            <div className="csu-card-label">Create CSU3 Row</div>
            <div className="csu3-form">
              <input
                type="number"
                placeholder="sequence (optional)"
                value={newRow.sequence}
                onChange={(e) => setNewRow((s) => ({ ...s, sequence: e.target.value }))}
              />
              <input
                type="text"
                placeholder="heading"
                value={newRow.heading}
                onChange={(e) => setNewRow((s) => ({ ...s, heading: e.target.value }))}
              />
              <textarea
                placeholder="content"
                value={newRow.content}
                onChange={(e) => setNewRow((s) => ({ ...s, content: e.target.value }))}
                rows={4}
              />
              <div className="csu-act-row">
                <button className="csu-btn-up" onClick={handleCreateRow} disabled={creating}>
                  {creating ? 'Saving…' : `Create in Page ${pageNo}`}
                </button>
                <button
                  className="csu-btn-del"
                  onClick={handleDeletePage}
                  disabled={rows.length === 0}
                >
                  Delete Page
                </button>
              </div>
            </div>
            {status && (
              <div className={`csu-toast ${status.type}`}>
                {status.type === 'success' ? '✓' : '✗'} {status.text}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="csu-bar no-print">
        <button className="csu-btn-pr" onClick={handlePrint} disabled={pagedRows.length === 0}>
          ⎙ Print A6
        </button>
        {saving && <span className="csu-bar-saving">Saving…</span>}
        <span className="csu-bar-meta">
          {loading
            ? 'Loading...'
            : pagedRows.length > 0
              ? `${rows.length} blocks · ${pagedRows.length} A6 pages`
              : 'No data'}
        </span>
      </div>

      <div className="csu3-pz">
        {/* hidden measure page for pagination calculation */}
        <div className="csu3-a6 csu3-measure" ref={measureRef} aria-hidden />

        {pagedRows.length > 0 ? (
          pagedRows.map((pageRows, idx) => (
            <div key={idx} className="csu3-a6">
              {pageRows.map((row, i) => (
                <div key={row._id || i} className="csu3-block">
                  {row.heading && <div className="csu3-heading">{row.heading}</div>}
                  {editingSegmentKey === `${idx}-${i}` ? (
                    <textarea
                      className="csu3-edit-content"
                      autoFocus
                      value={editingContentValue}
                      onChange={(e) => setEditingContentValue(e.target.value)}
                      onBlur={saveContentEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingContentId(null)
                          setEditingSegmentKey(null)
                        }
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault()
                          e.currentTarget.blur()
                        }
                      }}
                      rows={5}
                    />
                  ) : (
                    row.content && (
                      <div
                        className="csu3-content"
                        onClick={() => {
                          const source = rows.find((r) => r._id === row.rowId) || row
                          startContentEdit(source)
                          setEditingSegmentKey(`${idx}-${i}`)
                        }}
                        title="Click to edit content"
                      >
                        {row.content}
                      </div>
                    )
                  )}
                </div>
              ))}
              <div className="csu-a6-f">— {pageNo}-{idx + 1} —</div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="csu3-a6">
              <div className="csu-a6-empty">
                <div className="csu-a6-empty-icon">☸</div>
                <div>No CSU3 data for page {pageNo}</div>
                <small>Create rows from admin panel above</small>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

