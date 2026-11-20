import { defineConfig } from 'vite-plus';

export default defineConfig({
  // Copied as is into the extension: manifest.json, icons, and the font licences.
  publicDir: 'public',
  // A content stylesheet resolves a relative URL against the HN page, so each font URL must name the extension.
  // Chrome replaces the __MSG_@@extension_id__ part when it loads the stylesheet.
  experimental: {
    renderBuiltUrl: (filename) => `chrome-extension://__MSG_@@extension_id__/${filename}`,
  },
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
    target: 'chrome111',
    // The store reviews the code. Readable output makes that review quick, and the stylesheet is small.
    minify: false,
    cssMinify: false,
    // Chrome serves each font as a file. A data URL in the stylesheet would make the review harder.
    assetsInlineLimit: 0,
    rollupOptions: {
      // The extension is one stylesheet. It has no script.
      input: 'src/darker-news.css',
      output: {
        assetFileNames: ({ names }) => (names[0]?.endsWith('.woff2') ? 'fonts/[name][extname]' : '[name][extname]'),
      },
    },
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    singleQuote: true,
    printWidth: 120,
    // The fixtures are copies of HN pages, so their markup stays as HN wrote it.
    // Markdown keeps its hand-written line breaks.
    ignorePatterns: ['test/e2e/fixtures/**', '**/*.md'],
  },
});
