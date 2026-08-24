import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const OUT = fileURLToPath(new URL('./shots/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// Pass a port as the first arg when the default dev port is taken.
const PORT = process.argv[2] || process.env.PORT || '3000';
const URL_BASE = `http://localhost:${PORT}/`;

const viewports = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

for (const vp of viewports) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: 1,
  });
  await page.goto(URL_BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  // let entrance animations and lazy content settle
  await new Promise(r => setTimeout(r, 3000));

  // scroll through the page to trigger whileInView animations
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 2000));

  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`${vp.name}: page height = ${pageHeight}px`);

  // viewport-sized slices top / mid sections
  const slices = Math.min(Math.ceil(pageHeight / vp.height), 12);
  for (let i = 0; i < slices; i++) {
    await page.evaluate(y => window.scrollTo(0, y), i * vp.height);
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: `${OUT}${vp.name}-slice-${String(i).padStart(2, '0')}.png` });
  }

  await page.close();
}

await browser.close();
console.log('done');
