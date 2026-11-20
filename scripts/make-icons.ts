// Renders the icon SVGs in docs/assets/ to the PNG sizes that the manifest declares.
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
// The 16px size has its own drawing, because the full icon blurs at that size.
const icons = [
  { size: 16, from: 'docs/assets/icon-small.svg' },
  { size: 32, from: 'docs/assets/icon.svg' },
  { size: 48, from: 'docs/assets/icon.svg' },
  { size: 128, from: 'docs/assets/icon.svg' },
];

/** Renders each icon to public/icons/. */
async function makeIcons(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const { size, from } of icons) {
      const svg = await readFile(path.join(root, from), 'utf8');
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(
        `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
      );
      await page.screenshot({ path: path.join(root, `public/icons/icon-${size}.png`), omitBackground: true });
      console.log(`wrote public/icons/icon-${size}.png`);
    }
  } finally {
    await browser.close();
  }
}

makeIcons().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
