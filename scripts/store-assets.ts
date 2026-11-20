// Builds the Chrome Web Store images: the promo tile and README banner from SVG,
// and screenshots of the unpacked extension on the saved HN pages.
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';
import { extensionDir, serveFixtures } from '../test/e2e/extension.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHOTS = `${ROOT}store/screenshots`;
// The store takes 1280x800 screenshots and a 440x280 small promo tile.
const SCREEN = { width: 1280, height: 800 };
const SVGS = [
  { from: 'store/promo-tile.svg', to: 'store/promo-tile.png', size: { width: 440, height: 280 } },
  { from: 'docs/assets/banner.svg', to: 'docs/assets/banner.png', size: { width: 1280, height: 640 } },
];
const FONTS = [
  { family: 'DN Inter', file: 'inter-latin.woff2', weight: '100 900' },
  { family: 'DN Figtree', file: 'figtree-latin.woff2', weight: '300 900' },
];
const HN = 'https://news.ycombinator.com';
// The saved pages link two HN images. Without them, each screenshot shows a broken image.
const LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><rect width="18" height="18" fill="#ff6600"/><path d="M5 4.500 L9 10 L13 4.500 M9 10 V14" fill="none" stroke="#fff" stroke-width="1.6"/></svg>';
const SPACER = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

/**
 * Renders an SVG to a PNG of its exact size, with the bundled fonts.
 */
async function renderSvg(
  context: BrowserContext,
  { from, to, size }: { from: string; to: string; size: { width: number; height: number } },
): Promise<void> {
  const faces = FONTS.map(({ family, file, weight }) => {
    const data = readFileSync(`${ROOT}src/fonts/${file}`).toString('base64');
    return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/woff2;base64,${data}) format("woff2")}`;
  }).join('');
  const page = await context.newPage();
  await page.setViewportSize(size);
  await page.setContent(
    `<style>${faces}html,body{margin:0}svg{display:block}</style>${readFileSync(`${ROOT}${from}`, 'utf8')}`,
  );
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${ROOT}${to}` });
  await page.close();
  console.log(`wrote ${to}`);
}

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
  console.log(`wrote store/screenshots/${name}.png`);
}

/**
 * Captures the store screenshots with the extension loaded.
 */
async function captureScreens(context: BrowserContext): Promise<void> {
  await serveFixtures(context);
  await context.route(`${HN}/y18.svg`, (route) => route.fulfill({ contentType: 'image/svg+xml', body: LOGO }));
  await context.route(`${HN}/s.gif`, (route) => route.fulfill({ contentType: 'image/gif', body: SPACER }));
  const page = await context.newPage();
  const open = async (pathAndQuery: string): Promise<void> => {
    await page.goto(`${HN}${pathAndQuery}`);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
  };

  await open('/news');
  await shot(page, '1-front-page');

  await open('/item?id=50002008');
  await shot(page, '2-comments');

  // A code block inside a nested thread shows the nesting lines and the code style.
  await page
    .locator('table.comment-tree pre')
    .nth(1)
    .evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await shot(page, '3-thread');
  await page.close();
}

mkdirSync(SHOTS, { recursive: true });
const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  viewport: SCREEN,
  deviceScaleFactor: 1,
  args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
});
try {
  for (const svg of SVGS) await renderSvg(context, svg);
  await captureScreens(context);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await context.close();
}
