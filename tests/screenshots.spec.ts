import { test } from './extension';

test.skip(process.env.DN_SCREENSHOTS !== '1', 'Run with: npm run screenshots');

const pages = [
  ['news', '/news'],
  ['item', '/item?id=50002008'],
  ['user', '/user?id=dang'],
  ['login', '/login'],
] as const;

const viewports = [
  ['desktop', { width: 1280, height: 900 }],
  ['phone', { width: 390, height: 844 }],
] as const;

for (const [name, url] of pages) {
  for (const [label, viewport] of viewports) {
    test(`screenshot ${name} on ${label}`, async ({ openHN }) => {
      const page = await openHN(url, viewport);
      // The item page is very long, so its image shows the first screen only.
      await page.screenshot({ path: `screenshots/${name}-${label}.png`, fullPage: name !== 'item' });
    });
  }
}
