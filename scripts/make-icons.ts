import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const iconDir = path.resolve(import.meta.dirname, '../extension/icons');
const sizes = [16, 48, 128];

/** Renders icon.svg to a PNG for each size the manifest declares. */
async function makeIcons(): Promise<void> {
  const svg = await readFile(path.join(iconDir, 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const size of sizes) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(
        `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
      );
      await page.screenshot({ path: path.join(iconDir, `icon${size}.png`), omitBackground: true });
    }
  } finally {
    await browser.close();
  }
}

makeIcons().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
