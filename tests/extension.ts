import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const extensionDir = path.join(root, 'extension');
const fixtureDir = path.join(root, 'tests', 'fixtures');

/** Maps an HN path to the saved page the tests serve for it. */
const fixturePages: Record<string, string> = {
  '/news': 'news.html',
  '/item': 'item.html',
  '/user': 'user.html',
  '/login': 'login.html',
};

/** Serves the saved HN pages, so the tests run offline on fixed markup. */
async function serveFixtures(context: BrowserContext): Promise<void> {
  await context.route('https://news.ycombinator.com/**', async (route) => {
    const { pathname } = new URL(route.request().url());
    const fixture = fixturePages[pathname];
    if (fixture) {
      await route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: await readFile(path.join(fixtureDir, fixture)),
      });
      return;
    }
    if (pathname === '/news.css') {
      await route.fulfill({
        contentType: 'text/css',
        body: await readFile(path.join(fixtureDir, 'news.css')),
      });
      return;
    }
    // The style checks do not need HN's images or hn.js.
    await route.fulfill({ status: 404, body: '' });
  });
}

type Viewport = { width: number; height: number };

type Fixtures = {
  context: BrowserContext;
  openHN: (pathAndQuery: string, viewport?: Viewport) => Promise<Page>;
};

export const test = base.extend<Fixtures>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
    });
    try {
      // DN_LIVE=1 runs against the real site.
      if (process.env.DN_LIVE !== '1') await serveFixtures(context);
      await use(context);
    } finally {
      await context.close();
    }
  },
  openHN: async ({ context }, use) => {
    await use(async (pathAndQuery, viewport = { width: 1280, height: 900 }) => {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      await page.goto(`https://news.ycombinator.com${pathAndQuery}`);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      return page;
    });
  },
});

export const expect = test.expect;

/** Returns the computed value of a CSS property on the first element that matches the selector. */
export function css(page: Page, selector: string, property: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

/** Returns the computed rgb() string for a CSS color value, such as var() or color-mix(). */
export function resolveColor(page: Page, value: string): Promise<string> {
  return page.evaluate((v) => {
    const probe = document.createElement('span');
    probe.style.color = v;
    if (probe.style.color === '') throw new Error(`Not a CSS color: ${v}`);
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);
}

/** Returns the computed rgb() string for a Darker News color token. */
export async function tokenColor(page: Page, token: `--dn-${string}`): Promise<string> {
  const raw = await page.evaluate(
    (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim(),
    token,
  );
  // An undefined var() falls back to the inherited color, which would hide a missing token.
  if (raw === '') throw new Error(`Token ${token} is not defined`);
  return resolveColor(page, `var(${token})`);
}

/** Tells whether the page loaded a font face with this family name. */
export function fontLoaded(page: Page, family: string): Promise<boolean> {
  return page.evaluate(
    (name) =>
      [...document.fonts].some((f) => f.family.replace(/"/g, '') === name && f.status === 'loaded'),
    family,
  );
}

/** Tells whether the page is wider than the window. */
export function scrollsSideways(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}
