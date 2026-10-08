import { test, expect, css, resolveColor, tokenColor, scrollsSideways } from './extension';

const ITEM = '/item?id=50002008';

test('comment text is 16px Inter with a 1.6 line height', async ({ openHN }) => {
  const page = await openHN(ITEM);
  expect(await css(page, '.commtext', 'font-family')).toContain('DN Inter');
  expect(await css(page, '.commtext', 'font-size')).toBe('16px');
  expect(await css(page, '.commtext', 'line-height')).toBe('25.6px');
});

test('normal comments use the text color', async ({ openHN }) => {
  const page = await openHN(ITEM);
  expect(await css(page, '.commtext.c00', 'color')).toBe(await tokenColor(page, '--dn-text'));
});

test('faded comments mix the page background into the text color', async ({ openHN }) => {
  const page = await openHN(ITEM);
  // HN fades downvoted comments with the classes c5a to cdd. The saved page may have none.
  await page.locator('.commtext').first().evaluate((el) => el.setAttribute('class', 'commtext c88'));
  expect(await css(page, '.commtext.c88', 'color')).toBe(
    await resolveColor(page, 'color-mix(in srgb, var(--dn-text) 45%, var(--dn-bg))'),
  );
});

test('each comment has a depth line on the left', async ({ openHN }) => {
  const page = await openHN(ITEM);
  const cell = 'table.comment-tree td.default';
  expect(await css(page, cell, 'border-left-width')).toBe('2px');
  expect(await css(page, cell, 'border-left-color')).toBe(await tokenColor(page, '--dn-border'));
});

test('nested comments keep the HN indent', async ({ openHN }) => {
  const page = await openHN(ITEM);
  const box = await page.locator('td.ind img[width="200"]').first().boundingBox();
  expect(box?.width).toBe(200);
});

test('the collapse toggle is at least 20px tall', async ({ openHN }) => {
  const page = await openHN(ITEM);
  const box = await page.locator('a.togg').first().boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(20);
});

test('a collapsed comment stays hidden', async ({ openHN }) => {
  const page = await openHN(ITEM);
  // hn.js adds `noshow` to the comment body when a person clicks [–].
  await page.locator('.comment').first().evaluate((el) => el.classList.add('noshow'));
  expect(await css(page, '.comment.noshow', 'display')).toBe('none');
});

test('comment metadata is 13px', async ({ openHN }) => {
  const page = await openHN(ITEM);
  expect(await css(page, '.comment-tree .comhead', 'font-size')).toBe('13px');
});

test('code blocks use the sunken color and a mono font', async ({ openHN }) => {
  const page = await openHN(ITEM);
  expect(await css(page, 'pre', 'background-color')).toBe(await tokenColor(page, '--dn-sunken'));
  expect(await css(page, 'pre', 'font-family')).toContain('ui-monospace');
});

test('the item page does not scroll sideways on a phone', async ({ openHN }) => {
  const page = await openHN(ITEM, { width: 390, height: 844 });
  expect(await scrollsSideways(page)).toBe(false);
});
