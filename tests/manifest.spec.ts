import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const extensionDir = path.resolve(import.meta.dirname, '../extension');

type Manifest = {
  manifest_version: number;
  permissions?: string[];
  host_permissions?: string[];
  icons?: Record<string, string>;
  content_scripts: { matches: string[]; css: string[]; js?: string[]; run_at: string }[];
};

async function readManifest(): Promise<Manifest> {
  return JSON.parse(await readFile(path.join(extensionDir, 'manifest.json'), 'utf8')) as Manifest;
}

test('the manifest asks for no permissions and runs no scripts', async () => {
  const manifest = await readManifest();
  expect(manifest.manifest_version).toBe(3);
  expect(manifest.permissions).toBeUndefined();
  expect(manifest.host_permissions).toBeUndefined();
  expect(manifest.content_scripts).toEqual([
    {
      matches: ['https://news.ycombinator.com/*'],
      css: ['styles/darker-news.css'],
      run_at: 'document_start',
    },
  ]);
});
