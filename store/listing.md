# Chrome Web Store listing

This file holds the text for the Chrome Web Store dashboard. Copy each part into its field. Change the listing here first, so a pull request reviews it.

## Store listing tab

**Name** comes from `public/manifest.json`: Dark theme for Hackernews.

**Summary** comes from the manifest `description` (132 characters maximum).

**Category:** Tools.

**Language:** English.

**Description:**

```text
Read Hacker News in dark colors, with better fonts and bigger text.

The theme changes how the site looks. Every Hacker News feature, such as voting, replies, and login, works as before.

- Colors: a near-black background, light gray text, and a green accent for links, buttons, and focus outlines.
- Fonts: Figtree for the header and story titles, and Inter for all other text.
- Sizes: story titles are 17px. Comments are 16px with more space between lines.
- Layout: the page is a centered column, at most 820px wide.
- Comments: a line on the left of each comment shows its nesting level. The collapse toggle is bigger.
- Small windows: the pages fit a 390px window with no sideways scroll.

The extension is CSS only. It runs no scripts, collects no data, sends nothing to any server, and asks for no permissions. It runs only on news.ycombinator.com.

This extension is not affiliated with Hacker News or Y Combinator.

Open source: https://github.com/brunojppb/darker-news-theme
```

**Icon:** `public/icons/icon-128.png`.

**Screenshots** (1280x800): `store/screenshots/*.png`, in file name order.

**Small promo tile** (440x280): `store/promo-tile.png`.

**Homepage URL:** https://github.com/brunojppb/darker-news-theme

**Support URL:** https://github.com/brunojppb/darker-news-theme/issues

`pnpm store:assets` builds the screenshots, the promo tile, and the README banner again. It needs no network, because it captures the saved HN pages in `test/e2e/fixtures/`. The screenshots show real stories and comments from those pages.

## Privacy tab

**Single purpose:**

```text
Shows Hacker News with a dark theme, better fonts, and bigger text.
```

**Permission justification.** The manifest asks for no permissions. The content stylesheet and the web accessible font files match `https://news.ycombinator.com/*` only. If the dashboard asks about host access, use this text:

```text
The extension adds one stylesheet to news.ycombinator.com to change its colors, fonts, and text sizes. The stylesheet loads four font files from the extension package. The extension runs on no other site and runs no scripts.
```

**Remote code:** No. The package holds no script.

**Data usage:** tick no data type. Tick all three statements: no sale of data, no use for other purposes, and no use for credit checks.

**Privacy policy URL:** https://github.com/brunojppb/darker-news-theme/blob/main/PRIVACY.md

## Distribution tab

**Visibility:** Public. **Regions:** All regions.

## Package

`pnpm package` builds `dist/darker-news-v<version>.zip`. Each GitHub release has the same zip. Upload that file. The store needs a higher version for each upload, and Changesets raises the version.
