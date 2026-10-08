# Darker News

A Chrome extension that restyles Hacker News. It uses a dark theme in the Buffer colors, the
Inter and Figtree fonts, and bigger text. It is CSS only. It runs no scripts and asks for no
permissions.

## Install

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**, then select the `extension/` folder.
4. Open https://news.ycombinator.com.

After you change the CSS, click the reload button on the extension card, then reload the HN tab.

## Develop

```bash
npm install
npx playwright install chromium
npm test                       # style checks against saved HN pages
npm run typecheck
npm run screenshots            # images of the saved pages in screenshots/
DN_LIVE=1 npm run screenshots  # images of the live site
npm run icons                  # renders extension/icons/icon.svg to PNG
```

The tests serve the saved pages in `tests/fixtures/`. To update them, run the `curl` commands in
`docs/superpowers/plans/2026-10-08-darker-news.md`, Task 1, Step 3.

## Limits

HN uses tables with few class names, so some rules target the table structure. If HN changes its
HTML, those rules can stop working. The page then looks plain, but it still works.

## Fonts

Inter and Figtree use the SIL Open Font License. The licence files are in `extension/fonts/`.
