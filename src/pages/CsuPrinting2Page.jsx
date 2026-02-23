import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  uploadCsu2Excel,
  fetchCsu2Pages,
  fetchCsu2PageData,
  deleteCsu2PageAll,
  updateCsu2Row
} from '../services/api'

const MN = {
  '01':'जनवरी','02':'फ़रवरी','03':'मार्च','04':'अप्रैल',
  '05':'मई','06':'जून','07':'जुलाई','08':'अगस्त',
  '09':'सितम्बर','10':'अक्टूबर','11':'नवम्बर','12':'दिसम्बर'
}

const lagAbbr = (s) => {
  if (!s) return ''
  const clean = s.replace(/\s*\(.*\)/, '').trim()
  const m = clean.match(/^.[\u093E-\u094F]?/)
  const abbr = m ? m[0] : clean[0] || ''
  const bracket = s.includes('(') ? s.match(/\(([^)]+)\)/)?.[1] || '' : ''
  return bracket ? `${abbr}(${bracket})` : abbr
}

const parseDate = (raw) => {
  if (!raw || typeof raw !== 'string') return null
  let day, month, year

  if (raw.includes('-')) {
    const p = raw.split('-')
    if (p.length < 3) return null
    day = parseInt(p[0])
    month = p[1].padStart(2, '0')
    year = p[2]
    if (month.length > 2 || parseInt(month) > 12 || parseInt(month) < 1) return null
  } else if (raw.includes('/')) {
    const p = raw.split('/')
    if (p.length < 3) return null
    month = p[0].padStart(2, '0')
    day = parseInt(p[1])
    year = p[2]
  } else return null

  if (isNaN(day) || !year) return null
  if (year.length === 2) year = (parseInt(year) < 50 ? '20' : '19') + year
  if (year.length === 4 && parseInt(month) >= 1 && parseInt(month) <= 12) {
    return { day, month, year }
  }
  return null
}

const processBlock = (block) => {
  const items = (block.items || [])
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  const parsed = items.map(it => {
    const d = parseDate(it.date)
    if (!d) return null
    return { ...d, lag: lagAbbr(it.lagna) }
  }).filter(Boolean)

  const groups = {}
  parsed.forEach(d => {
    const key = `${d.year}-${d.month}`
    if (!groups[key]) groups[key] = { year: d.year, month: d.month, dates: [] }
    groups[key].dates.push({ day: d.day, lag: d.lag })
  })

  const sorted = Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return a.year.localeCompare(b.year)
    return parseInt(a.month) - parseInt(b.month)
  })
  sorted.forEach(g => g.dates.sort((a, b) => a.day - b.day))

  return { id: block._id, heading: block.heading || '', groups: sorted }
}

export default function CsuPrinting2Page() {
  const [pageNo, setPageNo] = useState(1)
  const [pagesList, setPagesList] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [fontSize, setFontSize] = useState(2.0)
  const [dragActive, setDragActive] = useState(false)
  const [newPageInput, setNewPageInput] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const [editCell, setEditCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(null)
  const a6Ref = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => { setPageTitle(localStorage.getItem(`csu2_title_${pageNo}`) || '') }, [pageNo])
  const handleTitleChange = (v) => { setPageTitle(v); localStorage.setItem(`csu2_title_${pageNo}`, v) }

  const loadPages = useCallback(async () => {
    try { const r = await fetchCsu2Pages(); setPagesList(r?.data || (Array.isArray(r) ? r : [])) }
    catch (e) { console.error(e) }
  }, [])

  const loadPageData = useCallback(async (pn) => {
    if (!pn) return; setLoading(true)
    try {
      const r = await fetchCsu2PageData(pn)
      console.log('=== CSU2 RAW ===', r)
      const items = r?.data || (Array.isArray(r) ? r : [])
      items.forEach((b, i) => console.log(`BLOCK ${i}: "${b.heading}" items:`, b.items?.length, b.items))
      setBlocks(items)
    } catch (e) { console.error(e); setBlocks([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadPages() }, [loadPages])
  useEffect(() => { loadPageData(pageNo) }, [pageNo, loadPageData])

  const processed = blocks
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    .map(processBlock)

  useEffect(() => {
    const paper = a6Ref.current
    if (!paper || processed.length === 0) return
    const wrap = paper.querySelector('.csu2-wrap')
    if (!wrap) return
    let lo = 0.6, hi = 3.0
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2
      wrap.style.fontSize = `${mid}mm`
      if (paper.scrollHeight > paper.clientHeight) hi = mid
      else lo = mid
    }
    wrap.style.fontSize = `${lo}mm`
    setFontSize(parseFloat(lo.toFixed(2)))
  }, [processed, pageTitle])

  const handleUpload = async () => {
    if (!file || !pageNo) return; setUploading(true); setUploadStatus(null)
    try {
      const d = await uploadCsu2Excel(file, pageNo)
      if (d.success !== false) {
        setUploadStatus({ type: 'success', text: `Uploaded` })
        setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''
        loadPages(); loadPageData(pageNo)
      } else setUploadStatus({ type: 'error', text: d.message || 'Failed' })
    } catch (e) { setUploadStatus({ type: 'error', text: e.message }) }
    finally { setUploading(false) }
  }

  const handleDeletePage = async () => {
    if (!pageNo || !window.confirm(`Delete page ${pageNo}?`)) return
    try { await deleteCsu2PageAll(pageNo); setBlocks([]); loadPages()
      setUploadStatus({ type: 'success', text: 'Deleted' })
    } catch (e) { setUploadStatus({ type: 'error', text: e.message }) }
  }

  const handleExportTemplate = () => {
    const csv = '\uFEFF' + 'heading,date,lagna\n' +
      [['विवाह','25-03-2026','मिथुन'],['','30-03-2026','अभिजित'],
       ['उपनयन','3/27/26','कर्क'],['','4/6/26','वृष']]
      .map(r => r.map(v => `"${v}"`).join(',')).join('\n') + '\n'
    const u = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = u; a.download = `csu2_template.csv`; a.click()
    URL.revokeObjectURL(u)
  }

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover') }
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation()
    setDragActive(false); if (e.dataTransfer?.files?.[0]) setFile(e.dataTransfer.files[0]) }

  const itemsToText = (items) => {
    if (!items || items.length === 0) return ''
    return items.map(it => {
      const d = it.date || ''
      const l = it.lagna || ''
      return l ? `${d} ${l}` : d
    }).join(', ')
  }

  const textToItems = (text) => {
    return text.split(',').map((chunk, i) => {
      const parts = chunk.trim().split(/\s+/)
      const date = parts[0] || ''
      const lagna = parts.slice(1).join(' ') || ''
      return { date, lagna, sequence: i + 1 }
    }).filter(it => it.date)
  }

  const startEdit = (blockId, field, value) => {
    setEditCell({ blockId, field })
    setEditValue(value)
  }

  const saveEdit = async () => {
    if (!editCell) return
    const { blockId, field } = editCell
    const trimmed = editValue.trim()
    setEditCell(null)

    const block = blocks.find(b => b._id === blockId)
    if (!block) return

    setSaving(blockId)
    try {
      if (field === 'heading') {
        if (trimmed !== block.heading) {
          await updateCsu2Row(blockId, { heading: trimmed })
        }
      } else if (field === 'items') {
        const newItems = textToItems(trimmed)
        await updateCsu2Row(blockId, { items: newItems })
      }
      loadPageData(pageNo)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(null)
    }
  }

  const renderBlock = (block, bi) => {
    let lastYear = null
    const isEditH = editCell?.blockId === block.id && editCell?.field === 'heading'
    const isEditD = editCell?.blockId === block.id && editCell?.field === 'items'
    const origBlock = blocks.find(b => b._id === block.id)

    const datesDisplay = block.groups.map((g, gi) => {
      const showYear = g.year !== lastYear
      lastYear = g.year
      return (
        <span key={gi}>
          {showYear && <span className="csu2-yr">{g.year} में </span>}
          <span className="csu2-mn">{MN[g.month] || g.month}-</span>
          {g.dates.map((d, di) => (
            <span key={di}>
              {d.day}{d.lag ? <span className="csu2-lg">({d.lag})</span> : ''}
              {di < g.dates.length - 1 && ', '}
            </span>
          ))}
          {gi < block.groups.length - 1 && ' | '}
        </span>
      )
    })

    return (
      <tr key={block.id || bi} className="csu2-blk">
        <td className="csu2-hd" onClick={() => !isEditH && startEdit(block.id, 'heading', block.heading)}>
          {isEditH ? (
            <input className="csu-edit-input" autoFocus value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditCell(null) }} />
          ) : block.heading}
        </td>
        <td className="csu2-sep">:</td>
        <td className="csu2-dt" onClick={() => !isEditD && startEdit(block.id, 'items', itemsToText(origBlock?.items))}>
          {isEditD ? (
            <input className="csu-edit-input" autoFocus value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditCell(null) }} />
          ) : (
            <>
              {datesDisplay}
              {block.groups.length === 0 && <span className="csu2-nd">—</span>}
            </>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div className="csu-page">
      <div className="csu-admin no-print">
        <div className="csu-admin-top">
          <div className="csu-admin-brand">
            <div className="csu-brand-icon">ॐ</div>
            <div><h1>CSU2 — पॉकेट पंचांग</h1><p>संस्कार / मुहूर्त A6</p></div>
          </div>
        </div>
        <div className="csu-admin-grid">
          <div className="csu-card">
            <div className="csu-card-label">Page Selection</div>
            <div className="csu-chips">
              {pagesList.map((p) => { const pn = p.pageNo ?? p._id; return (
                <button key={pn} className={`csu-chip ${pn === pageNo ? 'active' : ''}`}
                  onClick={() => setPageNo(pn)}>{pn}
                  <span className="csu-chip-n">{p.count ?? p.rowCount ?? ''}</span></button>) })}
              {pagesList.length === 0 && <span className="csu-muted">No pages yet</span>}
            </div>
            <div className="csu-goto-row">
              <input type="number" min="1" placeholder="Page..." value={newPageInput}
                onChange={(e) => setNewPageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { const pn = parseInt(newPageInput); if (pn > 0) { setPageNo(pn); setNewPageInput('') } } }} />
              <button onClick={() => { const pn = parseInt(newPageInput); if (pn > 0) { setPageNo(pn); setNewPageInput('') } }}
                disabled={!newPageInput}>Go</button>
            </div>
            <div className="csu-active-page">
              Active <strong className="csu-page-num">Page {pageNo}</strong>
              {processed.length > 0 && <span className="csu-row-count">{processed.length} headings</span>}
            </div>
            <div className="csu2-title-row">
              <label>Title:</label>
              <input type="text" placeholder="शीर्षक..." value={pageTitle}
                onChange={(e) => handleTitleChange(e.target.value)} />
            </div>
          </div>
          <div className="csu-card">
            <div className="csu-card-label">Excel Upload</div>
            <div className={`csu-dz ${dragActive ? 'drag' : ''} ${file ? 'has' : ''}`}
              onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag}
              onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)} hidden />
              {file ? (
                <div className="csu-file-row"><span className="csu-fi">📄</span>
                  <div><div className="csu-fn">{file.name}</div>
                    <div className="csu-fs">{(file.size / 1024).toFixed(1)} KB</div></div>
                  <button className="csu-file-clear" onClick={(e) => {
                    e.stopPropagation(); setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = '' }}>✕</button></div>
              ) : (
                <div className="csu-dz-prompt"><div className="csu-dz-arrow">⇧</div>
                  <div>Drop Excel or click</div><small>.xlsx .xls .csv</small></div>
              )}
            </div>
            <div className="csu-act-row">
              <button className="csu-btn-up" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Uploading…' : `Upload → Page ${pageNo}`}</button>
              <button className="csu-btn-del" onClick={handleDeletePage}
                disabled={blocks.length === 0}>Delete</button>
            </div>
            <button className="csu-btn-tpl" onClick={handleExportTemplate}>⤓ Template</button>
            {uploadStatus && <div className={`csu-toast ${uploadStatus.type}`}>
              {uploadStatus.type === 'success' ? '✓' : '✗'} {uploadStatus.text}</div>}
          </div>
        </div>
      </div>

      <div className="csu-bar no-print">
        <button className="csu-btn-pr" onClick={() => window.print()} disabled={blocks.length === 0}>
          ⎙ Print A6</button>
        {saving && <span className="csu-bar-saving">Saving…</span>}
        <span className="csu-bar-meta">
          {blocks.length > 0 ? `${processed.length} headings · ${fontSize.toFixed(1)}mm` : 'Upload data'}</span>
      </div>

      <div className="csu-pz">
        <div className="csu-a6" ref={a6Ref}>
          {loading && <div className="csu-a6-loading"><div className="csu-spinner" /></div>}
          {pageTitle && <div className="csu-a6-h">{pageTitle}</div>}

          {processed.length > 0 ? (
            <table className="csu2-wrap">
              <tbody>
                {processed.map((b, i) => renderBlock(b, i))}
              </tbody>
            </table>
          ) : !loading && (
            <div className="csu-a6-empty">
              <div className="csu-a6-empty-icon">☸</div>
              <div>No data for page {pageNo}</div></div>
          )}

          {processed.length > 0 && <div className="csu-a6-f">— {pageNo} —</div>}
        </div>
      </div>
    </div>
  )
}
