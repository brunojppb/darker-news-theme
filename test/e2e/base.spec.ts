import { test, expect, css, tokenColor, fontLoaded } from './extension';

test('the page background uses the Buffer dark green', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, 'body', 'background-color')).toBe(await tokenColor(page, '--dn-bg'));
});

test('the main table drops the HN light background', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, '#hnmain', 'background-color')).toBe('rgba(0, 0, 0, 0)');
});

test('body text uses the bundled Inter font', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, 'body', 'font-family')).toContain('DN Inter');
  expect(await fontLoaded(page, 'DN Inter')).toBe(true);
});

test('links use the text color', async ({ openHN }) => {
  const page = await openHN('/user?id=dang');
  expect(await css(page, 'a.hnuser', 'color')).toBe(await tokenColor(page, '--dn-text'));
});
