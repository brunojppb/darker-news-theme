import { test, expect, css, tokenColor, fontLoaded, scrollsSideways } from './extension';

test('the page column is 820px wide on a desktop screen', async ({ openHN }) => {
  const page = await openHN('/news');
  const box = await page.locator('#hnmain').boundingBox();
  expect(box?.width).toBe(820);
});

test('the header is a dark surface bar', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, '#hnmain td[bgcolor="#ff6600"]', 'background-color')).toBe(
    await tokenColor(page, '--dn-surface'),
  );
});

test('the current page link uses the accent color', async ({ openHN }) => {
  const page = await openHN('/news');
  // The saved front page has no current-page link, so the test marks one the way HN does.
  await page.locator('.pagetop a[href="newest"]').evaluate((a) => {
    const span = document.createElement('span');
    span.className = 'topsel';
    a.replaceWith(span);
    span.append(a);
  });
  expect(await css(page, '.topsel a', 'color')).toBe(await tokenColor(page, '--dn-accent'));
});

test('story titles use Figtree at 17px in the text color', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, '.titleline > a', 'font-family')).toContain('DN Figtree');
  expect(await css(page, '.titleline > a', 'font-size')).toBe('17px');
  expect(await css(page, '.titleline > a', 'color')).toBe(await tokenColor(page, '--dn-text'));
  expect(await fontLoaded(page, 'DN Figtree')).toBe(true);
});

test('story metadata is 13px in the muted color', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, 'td.subtext', 'font-size')).toBe('13px');
  expect(await css(page, '.subtext a.hnuser', 'color')).toBe(await tokenColor(page, '--dn-muted'));
});

test('vote arrows are CSS triangles in the muted color', async ({ openHN }) => {
  const page = await openHN('/news');
  expect(await css(page, '.votearrow', 'background-image')).toBe('none');
  expect(await css(page, '.votearrow', 'border-bottom-color')).toBe(
    await tokenColor(page, '--dn-muted'),
  );
});

test('a vote arrow stays hidden after a vote', async ({ openHN }) => {
  const page = await openHN('/news');
  // hn.js adds `nosee` after a vote.
  await page.locator('.votelinks').first().evaluate((el) => el.classList.add('nosee'));
  expect(await css(page, '.votelinks.nosee .votearrow', 'visibility')).toBe('hidden');
});

test('the front page does not scroll sideways on a phone', async ({ openHN }) => {
  const page = await openHN('/news', { width: 390, height: 844 });
  expect(await scrollsSideways(page)).toBe(false);
});

test('a custom HN header color still gives a dark header', async ({ openHN }) => {
  const page = await openHN('/news');
  // HN writes a user's `topcolor` profile setting into the bgcolor attribute.
  await page
    .locator('#hnmain td[bgcolor="#ff6600"]')
    .evaluateAll((cells) => cells.forEach((td) => td.setAttribute('bgcolor', '#ffffaa')));
  expect(await css(page, '#hnmain > tbody > tr:first-child > td', 'background-color')).toBe(
    await tokenColor(page, '--dn-surface'),
  );
  expect(await css(page, '#hnmain td[bgcolor]:empty', 'background-color')).toBe(
    await tokenColor(page, '--dn-border'),
  );
});
