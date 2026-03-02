import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  uploadCsuExcel,
  uploadCsuColumnExcel,
  fetchCsuPages,
  fetchCsuPageData,
  deleteCsuPageAll,
  updateCsuRow
} from '../services/api'

const FIELD_MAP = {
  0: 'di_hn',
  1: 'var_hn',
  2: 'tithi_hn',
  3: 'tithi_time_hn',
  4: 'nakshatra_hn',
  5: 'nakshatra_time_hn',
  6: 'chara_rashi_pravesh_hn',
  7: 'vrat_parvadi_vivaran_hn'
}

const CSU_COLUMN_OPTIONS = [
  { value: 'heading_hn', label: 'शीर्षक (heading_hn)' },
  { value: 'di_hn', label: 'दि. (di_hn)' },
  { value: 'var_hn', label: 'वार (var_hn)' },
  { value: 'tithi_hn', label: 'तिथि (tithi_hn)' },
  { value: 'tithi_time_hn', label: 'तिथि समय (tithi_time_hn)' },
  { value: 'nakshatra_hn', label: 'नक्षत्र (nakshatra_hn)' },
  { value: 'nakshatra_time_hn', label: 'नक्षत्र समय (nakshatra_time_hn)' },
  { value: 'chara_rashi_pravesh_hn', label: 'च.रा.प्र. (chara_rashi_pravesh_hn)' },
  { value: 'chara_rashi_time_hn', label: 'च.रा. समय (chara_rashi_time_hn)' },
  {
    value: 'vrat_parvadi_vivaran_hn',
    label: 'व्रत-पर्वादि विवरण (vrat_parvadi_vivaran_hn)'
  }
]

export default function CsuPrintingPage() {
  const [pageNo, setPageNo] = useState(1)
  const [pagesList, setPagesList] = useState([])
  const [rows, setRows] = useState([])
  const [heading, setHeading] = useState('')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [columnFile, setColumnFile] = useState(null)
  const [columnField, setColumnField] = useState('tithi_hn')
  const [columnUploading, setColumnUploading] = useState(false)
  const [fontSize, setFontSize] = useState(2.5)
  const [dragActive, setDragActive] = useState(false)
  const [newPageInput, setNewPageInput] = useState('')
  const [saving, setSaving] = useState(null)
  const [editCell, setEditCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editHeading, setEditHeading] = useState(false)
  const [editHeadingValue, setEditHeadingValue] = useState('')
  const [lineStartPage, setLineStartPage] = useState('')
  const [linePageCount, setLinePageCount] = useState('')
  const [linePageNos, setLinePageNos] = useState([])
  const [fullDocPages, setFullDocPages] = useState([])
  const [buildingFullPdf, setBuildingFullPdf] = useState(false)

  const a6Ref = useRef(null)
  const fileInputRef = useRef(null)
  const columnFileInputRef = useRef(null)

  const loadPages = useCallback(async () => {
    try {
      const res = await fetchCsuPages()
      const list = res?.data || (Array.isArray(res) ? res : [])
      setPagesList(list)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const loadPageData = useCallback(async (pn) => {
    if (!pn) return
    setLoading(true)
    try {
      const res = await fetchCsuPageData(pn)
      console.log('=== CSU RAW API RESPONSE ===', res)
      const items = res?.data || (Array.isArray(res) ? res : [])
      if (items.length > 0) {
        items.forEach((row, i) => {
          console.log(`--- Row ${i} ---`, {
            di_hn: row.di_hn,
            var_hn: row.var_hn,
            tithi_hn: row.tithi_hn,
            tithi_time_hn: row.tithi_time_hn,
            nakshatra_hn: row.nakshatra_hn,
            nakshatra_time_hn: row.nakshatra_time_hn,
            chara_rashi_pravesh_hn: row.chara_rashi_pravesh_hn,
            chara_rashi_time_hn: row.chara_rashi_time_hn,
            vrat_parvadi_vivaran_hn: row.vrat_parvadi_vivaran_hn,
            heading_hn: row.heading_hn
          })
        })
        const sorted = [...items].sort(
          (a, b) => (a.sequence || 0) - (b.sequence || 0)
        )
        setRows(sorted)
        const h = sorted.find((r) => r.heading_hn)
        setHeading(h?.heading_hn || '')
      } else {
        setRows([])
        setHeading('')
      }
    } catch (e) {
      console.error(e)
      setRows([])
      setHeading('')
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
    const paper = a6Ref.current
    if (!paper || rows.length === 0) return

    let lo = 0.8
    let hi = 3.6
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2
      paper.style.fontSize = `${mid}mm`
      if (paper.scrollHeight > paper.clientHeight) {
        hi = mid
      } else {
        lo = mid
      }
    }
    paper.style.fontSize = `${lo}mm`
    setFontSize(parseFloat(lo.toFixed(2)))
  }, [rows, heading])

  // Auto-scale full doc pages when they render
  useEffect(() => {
    if (fullDocPages.length === 0) return
    const timer = setTimeout(() => {
      const pageEls = document.querySelectorAll('.csu-print-doc .csu-doc-page')
      pageEls.forEach((pageEl) => {
        if (pageEl.querySelector('.csu-line-page')) return
        let lo = 0.8, hi = 3.6
        for (let i = 0; i < 16; i++) {
          const mid = (lo + hi) / 2
          pageEl.style.fontSize = `${mid}mm`
          if (pageEl.scrollHeight > pageEl.clientHeight) hi = mid
          else lo = mid
        }
        const safeFontSize = Math.max(0.6, lo * 0.95)
        pageEl.style.fontSize = `${safeFontSize}mm`
      })

      if (buildingFullPdf) {
        setTimeout(() => {
          const cleanup = () => {
            document.body.classList.remove('csu-print-full')
            window.removeEventListener('afterprint', cleanup)
          }
          document.body.classList.add('csu-print-full')
          window.addEventListener('afterprint', cleanup)
          window.print()
        }, 100)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [fullDocPages, buildingFullPdf])

  const handleUpload = async () => {
    if (!file || !pageNo) return
    setUploading(true)
    setUploadStatus(null)
    try {
      const data = await uploadCsuExcel(file, pageNo)
      if (data.success !== false) {
        const count = data.data?.length || data.count || 0
        setUploadStatus({
          type: 'success',
          text: `${count} rows uploaded for page ${pageNo}`
        })
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        loadPages()
        loadPageData(pageNo)
      } else {
        setUploadStatus({
          type: 'error',
          text: data.message || 'Upload failed'
        })
      }
    } catch (e) {
      setUploadStatus({ type: 'error', text: e.message })
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePage = async () => {
    if (!pageNo || !window.confirm(`Delete all data for page ${pageNo}?`))
      return
    try {
      await deleteCsuPageAll(pageNo)
      setRows([])
      setHeading('')
      loadPages()
      setUploadStatus({ type: 'success', text: `Page ${pageNo} deleted` })
    } catch (e) {
      setUploadStatus({ type: 'error', text: e.message })
    }
  }

  const handleColumnUpload = async () => {
    if (!columnFile || !pageNo || !columnField) return
    setColumnUploading(true)
    setUploadStatus(null)
    try {
      const data = await uploadCsuColumnExcel({
        file: columnFile,
        pageNo,
        columnField
      })
      if (data.success !== false) {
        setUploadStatus({
          type: 'success',
          text: `Updated ${data.updatedRows || data.count || ''} rows for ${columnField}`
        })
        setColumnFile(null)
        if (columnFileInputRef.current) columnFileInputRef.current.value = ''
        loadPageData(pageNo)
      } else {
        setUploadStatus({
          type: 'error',
          text: data.message || 'Column upload failed'
        })
      }
    } catch (e) {
      setUploadStatus({ type: 'error', text: e.message })
    } finally {
      setColumnUploading(false)
    }
  }

  const handlePrint = () => {
    const paper = a6Ref.current
    if (!paper) { window.print(); return }
    const original = paper.style.fontSize
    const current = parseFloat(original) || fontSize
    paper.style.fontSize = `${current * 0.95}mm`
    setTimeout(() => {
      window.print()
      const restore = () => {
        paper.style.fontSize = original
        window.removeEventListener('afterprint', restore)
      }
      window.addEventListener('afterprint', restore)
    }, 50)
  }

  const handleAddLinePages = () => {
    const start = parseInt(lineStartPage, 10)
    const count = parseInt(linePageCount, 10)
    if (!start || !count || start < 1 || count < 1) return
    const newPages = Array.from({ length: count }, (_, i) => start + i)
    setLinePageNos((prev) => [...new Set([...prev, ...newPages])].sort((a, b) => a - b))
    setLineStartPage('')
    setLinePageCount('')
  }

  const handleClearLinePages = () => setLinePageNos([])

  const renderReadonlyTable = (tableRows) => (
    <table className="csu-a6-table">
      <thead>
        <tr>
          <th>दि.</th>
          <th>वार</th>
          <th>तिथि</th>
          <th>घ.मि.</th>
          <th>नक्षत्र</th>
          <th>घ.मि.</th>
          <th>च.रा.प्र.</th>
          <th>व्रत-पर्वादि विवरण</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map((r, ri) => (
          <tr key={r._id || ri}>
            <td>{r.di_hn || ''}</td>
            <td>{r.var_hn || ''}</td>
            <td>{renderMulti(r.tithi_hn)}</td>
            <td>{renderMultiTime(r.tithi_time_hn)}</td>
            <td>{renderMulti(r.nakshatra_hn)}</td>
            <td>{renderMultiTime(r.nakshatra_time_hn)}</td>
            <td>{renderRashi(r)}</td>
            <td className="csu-vrat">{r.vrat_parvadi_vivaran_hn || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const handleCreateFullPdf = async () => {
    setBuildingFullPdf(true)
    setUploadStatus(null)
    try {
      const pagesRes = await fetchCsuPages()
      const pages = (pagesRes?.data || [])
        .map((p) => p.pageNo)
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b)

      const pageDataList = await Promise.all(pages.map((pn) => fetchCsuPageData(pn)))
      const dataPages = pageDataList.map((res, idx) => {
        const pageRows = (res?.data || []).sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        const pageHeading = pageRows.find((r) => r.heading_hn)?.heading_hn || ''
        return {
          type: 'data',
          pageNo: pages[idx],
          heading: pageHeading,
          rows: pageRows
        }
      })

      const linedPages = linePageNos.map((n) => ({
        type: 'line',
        pageNo: n
      }))

      const merged = [...dataPages, ...linedPages].sort((a, b) => {
        if (a.pageNo !== b.pageNo) return a.pageNo - b.pageNo
        if (a.type === b.type) return 0
        return a.type === 'data' ? -1 : 1
      })

      setFullDocPages(merged)
    } catch (e) {
      setUploadStatus({ type: 'error', text: e.message })
    } finally {
      setBuildingFullPdf(false)
    }
  }

  const handleExportTemplate = () => {
    const BOM = '\uFEFF'
    const headers = [
      'heading_hn',
      'di_hn',
      'var_hn',
      'tithi_hn',
      'tithi_time_hn',
      'nakshatra_hn',
      'nakshatra_time_hn',
      'chara_rashi_pravesh_hn',
      'chara_rashi_time_hn',
      'vrat_parvadi_vivaran_hn'
    ]
    const sampleRow = [
      'चैत्र कृष्ण पक्ष, विक्रम संवत् २०८३',
      '१',
      'सोम',
      'प्रतिपदा',
      '२८:५३:००',
      'अश्विनी',
      '१२:३०:००',
      'मेष',
      '१५:२०:००',
      'नववर्ष आरम्भ'
    ]
    const csv =
      BOM +
      headers.join(',') +
      '\n' +
      sampleRow.map((v) => `"${v}"`).join(',') +
      '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `csu_template_page${pageNo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) setFile(f)
  }

  const handleGoToPage = () => {
    const pn = parseInt(newPageInput)
    if (pn > 0) {
      setPageNo(pn)
      setNewPageInput('')
    }
  }

  const trimTime = (t) => {
    if (!t || typeof t !== 'string') return t || ''
    const parts = t.split(':')
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
    return t
  }

  const renderMulti = (val) => {
    if (!val) return ''
    if (Array.isArray(val)) {
      if (val.length === 0) return ''
      if (val.length === 1) return val[0] || ''
      return val.map((v, i) => (
        <div key={i} className="csu-ml">
          {v}
        </div>
      ))
    }
    return val
  }

  const renderMultiTime = (val) => {
    if (!val) return ''
    if (Array.isArray(val)) {
      const trimmed = val.map(trimTime)
      if (trimmed.length === 0) return ''
      if (trimmed.length === 1) return trimmed[0] || ''
      return trimmed.map((v, i) => (
        <div key={i} className="csu-ml">
          {v}
        </div>
      ))
    }
    return trimTime(val)
  }

  const getCellText = (val) => {
    if (!val) return ''
    if (Array.isArray(val)) return val.join(', ')
    return String(val)
  }

  const renderRashi = (r) => {
    const rashi = r.chara_rashi_pravesh_hn || ''
    const time = trimTime(r.chara_rashi_time_hn || '')
    if (rashi && time) return `${rashi} ${time}`
    return rashi || time || ''
  }

  // --- Click-to-edit ---

  const startCellEdit = (ri, ci, rawValue) => {
    setEditCell({ ri, ci })
    setEditValue(getCellText(rawValue))
  }

  const saveCellEdit = async () => {
    if (!editCell) return
    const { ri, ci } = editCell
    const row = rows[ri]
    if (!row?._id) { setEditCell(null); return }
    const field = FIELD_MAP[ci]
    if (!field) { setEditCell(null); return }

    const trimmed = editValue.trim()
    const oldText = getCellText(row[field])
    setEditCell(null)

    if (trimmed === oldText) return

    const isArrayField = field === 'tithi_hn' || field === 'tithi_time_hn' || field === 'nakshatra_hn' || field === 'nakshatra_time_hn'
    const newValue = isArrayField
      ? trimmed.split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
      : trimmed

    const updated = [...rows]
    updated[ri] = { ...updated[ri], [field]: newValue }
    setRows(updated)

    setSaving(row._id)
    try {
      await updateCsuRow(row._id, { [field]: newValue })
    } catch (err) {
      updated[ri] = row
      setRows([...updated])
      console.error('Save failed:', err)
    } finally {
      setSaving(null)
    }
  }

  const startHeadingEdit = () => {
    setEditHeading(true)
    setEditHeadingValue(heading)
  }

  const saveHeadingEdit = async () => {
    setEditHeading(false)
    const trimmed = editHeadingValue.trim()
    if (trimmed === heading) return
    const row = rows.find((r) => r.heading_hn)
    if (!row?._id) return
    const oldHeading = heading
    setHeading(trimmed)
    setSaving(row._id)
    try {
      await updateCsuRow(row._id, { heading_hn: trimmed })
    } catch (err) {
      setHeading(oldHeading)
      console.error('Heading save failed:', err)
    } finally {
      setSaving(null)
    }
  }

  const isEditing = (ri, ci) => editCell?.ri === ri && editCell?.ci === ci

  const cellDisplay = (ri, ci, displayContent, rawValue) => {
    if (isEditing(ri, ci)) {
      return (
        <input
          className="csu-edit-input"
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveCellEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur()
            if (e.key === 'Escape') setEditCell(null)
          }}
        />
      )
    }
    return (
      <span
        className="csu-cell-text"
        onClick={() => startCellEdit(ri, ci, rawValue)}
      >
        {displayContent || '\u00A0'}
      </span>
    )
  }

  return (
    <div className="csu-page">
      {/* ── Admin Panel ── */}
      <div className="csu-admin no-print">
        <div className="csu-admin-top">
          <div className="csu-admin-brand">
            <div className="csu-brand-icon">ॐ</div>
            <div>
              <h1>CSU Printing Console</h1>
              <p>पंचांग A6 प्रिंटिंग प्रबंधन</p>
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
                    <span className="csu-chip-n">
                      {p.count ?? p.rowCount ?? ''}
                    </span>
                  </button>
                )
              })}
              {pagesList.length === 0 && (
                <span className="csu-muted">No pages yet</span>
              )}
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
              Active&nbsp;&nbsp;
              <strong className="csu-page-num">Page {pageNo}</strong>
              {rows.length > 0 && (
                <span className="csu-row-count">{rows.length} rows</span>
              )}
            </div>
          </div>

          <div className="csu-card">
            <div className="csu-card-label">Excel Upload</div>
            <div
              className={`csu-dz ${dragActive ? 'drag' : ''} ${file ? 'has' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                hidden
              />
              {file ? (
                <div className="csu-file-row">
                  <span className="csu-fi">📄</span>
                  <div>
                    <div className="csu-fn">{file.name}</div>
                    <div className="csu-fs">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    className="csu-file-clear"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="csu-dz-prompt">
                  <div className="csu-dz-arrow">⇧</div>
                  <div>Drop Excel here or click to browse</div>
                  <small>.xlsx &nbsp; .xls &nbsp; .csv</small>
                </div>
              )}
            </div>

            <div className="csu-act-row">
              <button
                className="csu-btn-up"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? 'Uploading…' : `Upload → Page ${pageNo}`}
              </button>
              <button
                className="csu-btn-del"
                onClick={handleDeletePage}
                disabled={rows.length === 0}
              >
                Delete
              </button>
            </div>
            <button className="csu-btn-tpl" onClick={handleExportTemplate}>
              ⤓ &nbsp;Download Excel Template
            </button>
            <div className="csu-partial-box">
              <div className="csu-partial-title">Lining Pages (for full PDF)</div>
              <div className="csu-partial-row">
                <input
                  type="number"
                  min="1"
                  placeholder="Start page no"
                  value={lineStartPage}
                  onChange={(e) => setLineStartPage(e.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Count"
                  value={linePageCount}
                  onChange={(e) => setLinePageCount(e.target.value)}
                />
              </div>
              <div className="csu-act-row" style={{ marginTop: 8 }}>
                <button className="csu-btn-up csu-btn-partial" onClick={handleAddLinePages}>
                  Add Lining Range
                </button>
                <button className="csu-btn-del" onClick={handleClearLinePages}>
                  Clear
                </button>
              </div>
              {linePageNos.length > 0 && (
                <div className="csu-partial-file-name">
                  Lining pages: {linePageNos.join(', ')}
                </div>
              )}
            </div>
            <div className="csu-partial-box">
              <div className="csu-partial-title">Edit via Excel (Single Column)</div>
              <div className="csu-partial-row">
                <select
                  value={columnField}
                  onChange={(e) => setColumnField(e.target.value)}
                >
                  {CSU_COLUMN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  className="csu-btn-partial-file"
                  onClick={() => columnFileInputRef.current?.click()}
                >
                  {columnFile ? 'Change File' : 'Choose Excel'}
                </button>
                <input
                  ref={columnFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setColumnFile(e.target.files?.[0] || null)}
                  hidden
                />
              </div>
              {columnFile && (
                <div className="csu-partial-file-name">{columnFile.name}</div>
              )}
              <button
                className="csu-btn-up csu-btn-partial"
                onClick={handleColumnUpload}
                disabled={!columnFile || !columnField || columnUploading}
              >
                {columnUploading
                  ? 'Updating…'
                  : `Update Only ${columnField} → Page ${pageNo}`}
              </button>
            </div>

            {uploadStatus && (
              <div className={`csu-toast ${uploadStatus.type}`}>
                {uploadStatus.type === 'success' ? '✓' : '✗'}{' '}
                {uploadStatus.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Print Bar ── */}
      <div className="csu-bar no-print">
        <button
          className="csu-btn-pr"
          onClick={handlePrint}
          disabled={rows.length === 0}
        >
          ⎙ &nbsp;Print A6
        </button>
        <button
          className="csu-btn-pr"
          onClick={handleCreateFullPdf}
          disabled={buildingFullPdf}
        >
          {buildingFullPdf ? 'Building PDF…' : 'Create Full PDF'}
        </button>
        {saving && <span className="csu-bar-saving">Saving…</span>}
        <span className="csu-bar-meta">
          {rows.length > 0
            ? `${rows.length} rows · ${fontSize.toFixed(1)}mm · Page ${pageNo}`
            : 'Upload data to preview'}
        </span>
      </div>

      {/* ── A6 Paper ── */}
      <div className="csu-pz csu-single-preview">
        <div className="csu-a6" ref={a6Ref}>
          {loading && (
            <div className="csu-a6-loading">
              <div className="csu-spinner" />
            </div>
          )}

          {heading && (
            <div className="csu-a6-h" onClick={startHeadingEdit}>
              {editHeading ? (
                <input
                  className="csu-edit-input csu-edit-heading"
                  autoFocus
                  value={editHeadingValue}
                  onChange={(e) => setEditHeadingValue(e.target.value)}
                  onBlur={saveHeadingEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur()
                    if (e.key === 'Escape') setEditHeading(false)
                  }}
                />
              ) : (
                heading
              )}
            </div>
          )}

          {rows.length > 0 ? (
            <table className="csu-a6-table">
              <thead>
                <tr>
                  <th>दि.</th>
                  <th>वार</th>
                  <th>तिथि</th>
                  <th>घ.मि.</th>
                  <th>नक्षत्र</th>
                  <th>घ.मि.</th>
                  <th>च.रा.प्र.</th>
                  <th>व्रत-पर्वादि विवरण</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={r._id || ri}>
                    <td>{cellDisplay(ri, 0, r.di_hn, r.di_hn)}</td>
                    <td>{cellDisplay(ri, 1, r.var_hn, r.var_hn)}</td>
                    <td>{cellDisplay(ri, 2, renderMulti(r.tithi_hn), r.tithi_hn)}</td>
                    <td>{cellDisplay(ri, 3, renderMultiTime(r.tithi_time_hn), r.tithi_time_hn)}</td>
                    <td>{cellDisplay(ri, 4, renderMulti(r.nakshatra_hn), r.nakshatra_hn)}</td>
                    <td>{cellDisplay(ri, 5, renderMultiTime(r.nakshatra_time_hn), r.nakshatra_time_hn)}</td>
                    <td>{cellDisplay(ri, 6, renderRashi(r), r.chara_rashi_pravesh_hn)}</td>
                    <td className="csu-vrat">{cellDisplay(ri, 7, r.vrat_parvadi_vivaran_hn, r.vrat_parvadi_vivaran_hn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && (
              <div className="csu-a6-empty">
                <div className="csu-a6-empty-icon">☸</div>
                <div>No data for page {pageNo}</div>
                <small>Upload an Excel file above</small>
              </div>
            )
          )}

          {false && rows.length > 0 && (
            <div className="csu-a6-f">— {pageNo} —</div>
          )}
        </div>
      </div>

      <div className="csu-print-doc">
        {fullDocPages.map((p, idx) => (
          <div className="csu-a6 csu-doc-page" key={`${p.type}-${p.pageNo}-${idx}`}>
            {p.type === 'data' ? (
              <>
                {p.heading && <div className="csu-a6-h">{p.heading}</div>}
                {p.rows?.length > 0 ? renderReadonlyTable(p.rows) : <div className="csu-a6-empty"><div>No rows for page {p.pageNo}</div></div>}
              </>
            ) : (
              <div className="csu-line-page">
                <div className="csu-line-grid">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div className="csu-line-row" key={i} />
                  ))}
                </div>
              </div>
            )}
            {p.type === 'line' && <div className="csu-a6-f">— {p.pageNo} —</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
