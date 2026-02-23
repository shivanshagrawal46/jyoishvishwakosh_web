import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  uploadCsuExcel,
  fetchCsuPages,
  fetchCsuPageData,
  deleteCsuPageAll
} from '../services/api'

export default function CsuPrintingPage() {
  const [pageNo, setPageNo] = useState(1)
  const [pagesList, setPagesList] = useState([])
  const [rows, setRows] = useState([])
  const [heading, setHeading] = useState('')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [fontSize, setFontSize] = useState(2.5)
  const [dragActive, setDragActive] = useState(false)
  const [newPageInput, setNewPageInput] = useState('')

  const a6Ref = useRef(null)
  const fileInputRef = useRef(null)

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
        console.log('=== CSU ALL ROWS ===', items)
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

  // Binary-search auto-scale: find the largest font that fits in the A6 box
  useEffect(() => {
    const paper = a6Ref.current
    if (!paper || rows.length === 0) return
    const tableEl = paper.querySelector('.csu-a6-table')
    if (!tableEl) return

    let lo = 1.0
    let hi = 3.6
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2
      tableEl.style.fontSize = `${mid}mm`
      if (paper.scrollHeight > paper.clientHeight) {
        hi = mid
      } else {
        lo = mid
      }
    }
    tableEl.style.fontSize = `${lo}mm`
    setFontSize(parseFloat(lo.toFixed(2)))
  }, [rows, heading])

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

  const handlePrint = () => window.print()

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
          {/* Page Selection */}
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

          {/* Upload */}
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
        <span className="csu-bar-meta">
          {rows.length > 0
            ? `${rows.length} rows · ${fontSize.toFixed(1)}mm · Page ${pageNo}`
            : 'Upload data to preview'}
        </span>
      </div>

      {/* ── A6 Paper ── */}
      <div className="csu-pz">
        <div className="csu-a6" ref={a6Ref}>
          {loading && (
            <div className="csu-a6-loading">
              <div className="csu-spinner" />
            </div>
          )}

          {heading && <div className="csu-a6-h">{heading}</div>}

          {rows.length > 0 ? (
            <table className="csu-a6-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>दि.</th>
                  <th style={{ width: '7%' }}>वार</th>
                  <th style={{ width: '13%' }}>तिथि</th>
                  <th style={{ width: '11%' }}>घ.मि.</th>
                  <th style={{ width: '12%' }}>नक्षत्र</th>
                  <th style={{ width: '11%' }}>घ.मि.</th>
                  <th style={{ width: '10%' }}>च.रा.प्र.</th>
                  <th style={{ width: '11%' }}>घ.मि.</th>
                  <th style={{ width: '20%' }}>व्रत-पर्वादि विवरण</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r._id || i}>
                    <td>{r.di_hn || ''}</td>
                    <td>{r.var_hn || ''}</td>
                    <td>{renderMulti(r.tithi_hn)}</td>
                    <td>{renderMulti(r.tithi_time_hn)}</td>
                    <td>{r.nakshatra_hn || ''}</td>
                    <td>{r.nakshatra_time_hn || ''}</td>
                    <td>{r.chara_rashi_pravesh_hn || ''}</td>
                    <td>{r.chara_rashi_time_hn || ''}</td>
                    <td className="csu-vrat">{r.vrat_parvadi_vivaran_hn || ''}</td>
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

          {rows.length > 0 && (
            <div className="csu-a6-f">— {pageNo} —</div>
          )}
        </div>
      </div>
    </div>
  )
}
