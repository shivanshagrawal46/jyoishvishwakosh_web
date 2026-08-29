/**
 * One-off: the review photos are full-size camera images being drawn into 44px
 * circles. This crops each to a square around the face and writes a 132px JPEG
 * (3x, for dense screens) into src/assets/reviews.
 *
 * Re-run after replacing any source photo in src/assets/icons.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const SIZE = 132
// Candid photos put faces above centre; 0.24 matches the CSS crop it replaces.
const FOCUS_Y = 0.24
const SRC = 'src/assets/icons'
const OUT = 'src/assets/reviews'

mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ channel: 'chrome', headless: 'shell' })
const page = await browser.newPage()
await page.goto('about:blank')

for (let i = 1; i <= 5; i++) {
  const dataUrl = `data:image/jpeg;base64,${readFileSync(`${SRC}/user${i}.jfif`).toString('base64')}`

  const out = await page.evaluate(async (url, size, focusY) => {
    const img = new Image()
    img.src = url
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'

    // object-fit: cover, biased upward.
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - side) / 2
    const sy = Math.min(
      Math.max(0, img.naturalHeight * focusY - side / 2),
      img.naturalHeight - side
    )

    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
    return canvas.toDataURL('image/jpeg', 0.84).split(',')[1]
  }, dataUrl, SIZE, FOCUS_Y)

  const buf = Buffer.from(out, 'base64')
  writeFileSync(`${OUT}/user${i}.jpg`, buf)
  console.log(`user${i}.jpg  ${(buf.length / 1024).toFixed(1)} kB`)
}

await browser.close()
