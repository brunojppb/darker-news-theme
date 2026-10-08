import type { Page } from '@playwright/test';
import { test, expect, css, tokenColor } from './extension';

/** Lists the elements with a light background. The accent color is allowed. */
async function lightAreas(page: Page): Promise<string[]> {
  const accent = await tokenColor(page, '--dn-accent');
  return page.evaluate((accentColor) => {
    const found: string[] = [];
    for (const el of document.querySelectorAll('*')) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg === accentColor) continue;
      const [r, g, b, a = 1] = (bg.match(/[\d.]+/g) ?? []).map(Number);
      if (a > 0 && (r + g + b) / 3 > 160) found.push(`${el.tagName.toLowerCase()} ${bg}`);
    }
    return found;
  }, accent);
}

test('the login page is dark without the HN stylesheet', async ({ openHN }) => {
  const page = await openHN('/login');
  expect(await css(page, 'body', 'background-color')).toBe(await tokenColor(page, '--dn-bg'));
  expect(await css(page, 'body', 'font-family')).toContain('DN Inter');
});

test('text inputs use the surface color and round corners', async ({ openHN }) => {
  const page = await openHN('/login');
  const input = 'input[name="acct"]';
  expect(await css(page, input, 'background-color')).toBe(await tokenColor(page, '--dn-surface'));
  expect(await css(page, input, 'color')).toBe(await tokenColor(page, '--dn-text'));
  expect(await css(page, input, 'border-top-left-radius')).toBe('8px');
});

test('a focused input shows an accent outline', async ({ openHN }) => {
  const page = await openHN('/login');
  const input = 'input[name="pw"]';
  await page.locator(input).first().focus();
  expect(await css(page, input, 'outline-style')).toBe('solid');
  expect(await css(page, input, 'outline-width')).toBe('2px');
  expect(await css(page, input, 'outline-color')).toBe(await tokenColor(page, '--dn-accent'));
});

test('submit buttons use the accent color', async ({ openHN }) => {
  const page = await openHN('/login');
  expect(await css(page, 'input[type="submit"]', 'background-color')).toBe(
    await tokenColor(page, '--dn-accent'),
  );
});

test('the reply box uses the surface color', async ({ openHN }) => {
  const page = await openHN('/item?id=50002008');
  expect(await css(page, 'textarea', 'background-color')).toBe(
    await tokenColor(page, '--dn-surface'),
  );
});

test('the help link next to the reply box uses the faint color', async ({ openHN }) => {
  const page = await openHN('/item?id=50002008');
  expect(await css(page, 'font[color="#AFAFAF"]', 'color')).toBe(
    await tokenColor(page, '--dn-faint'),
  );
});

test('footer links are 13px in the muted color', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, '.yclinks', 'font-size')).toBe('13px');
  expect(await css(page, '.yclinks a', 'color')).toBe(await tokenColor(page, '--dn-muted'));
});

for (const url of ['/news', '/item?id=50002008', '/user?id=dang', '/login']) {
  test(`${url} has no light background areas`, async ({ openHN }) => {
    const page = await openHN(url);
    expect(await lightAreas(page)).toEqual([]);
  });
}
