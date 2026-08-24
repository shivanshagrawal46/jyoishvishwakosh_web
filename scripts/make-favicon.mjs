/**
 * Generate the tab icon from the real wordmark (src/assets/icons/logo_new.png).
 *
 * The wordmark is 356x156, far too wide to read at 16px, so the small sizes use
 * a tight crop of its leading glyph — the saffron "ज्यो" swirl — while the
 * apple-touch icon keeps the whole logo on a parchment square.
 *
 * Run: node scripts/make-favicon.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const SRC = 'src/assets/icons/logo_new.png'
const dataUrl = `data:image/png;base64,${readFileSync(SRC).toString('base64')}`

const browser = await puppeteer.launch({ channel: 'chrome', headless: 'shell' })
const page = await browser.newPage()
await page.setContent('<body></body>')

const files = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()

  const probe = document.createElement('canvas')
  probe.width = img.width
  probe.height = img.height
  const pctx = probe.getContext('2d')
  pctx.drawImage(img, 0, 0)
  const { data } = pctx.getImageData(0, 0, img.width, img.height)

  /** Tight bounding box of visible ink inside a column range. */
  const inkBox = (x0, x1) => {
    let minX = x1, minY = img.height, maxX = x0, maxY = 0
    for (let y = 0; y < img.height; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * img.width + x) * 4
        const opaque = data[i + 3] > 24
        // The source has a white matte in places; treat near-white as empty.
        const bright = data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244
        if (!opaque || bright) continue
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
  }

  const draw = (box, size, pad, background) => {
    const c = document.createElement('canvas')
    c.width = size
    c.height = size
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'

    if (background) {
      const r = size * 0.17
      ctx.fillStyle = background
      ctx.beginPath()
      ctx.roundRect(0, 0, size, size, r)
      ctx.fill()
    }

    const inner = size * (1 - pad * 2)
    const scale = Math.min(inner / box.w, inner / box.h)
    const w = box.w * scale
    const h = box.h * scale
    ctx.drawImage(img, box.x, box.y, box.w, box.h, (size - w) / 2, (size - h) / 2, w, h)
    return c.toDataURL('image/png').split(',')[1]
  }

  // The shirorekha and the underline run edge to edge, so there is no clean
  // sub-crop: the whole wordmark goes on a parchment tile at every size.
  const full = inkBox(0, img.width)

  return {
    'public/favicon-32.png': draw(full, 32, 0.05, '#FFF7E8'),
    'public/favicon-48.png': draw(full, 48, 0.06, '#FFF7E8'),
    'public/favicon-192.png': draw(full, 192, 0.08, '#FFF7E8'),
    'public/apple-touch-icon.png': draw(full, 180, 0.12, '#FFF7E8'),
    'public/icon-512.png': draw(full, 512, 0.12, '#FFF7E8'),
  }
}, dataUrl)

for (const [path, b64] of Object.entries(files)) {
  writeFileSync(path, Buffer.from(b64, 'base64'))
  console.log(`wrote ${path}`)
}

await browser.close()
