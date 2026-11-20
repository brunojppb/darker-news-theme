# Changesets

A changeset is a Markdown file in this folder. It names the version bump and describes one change for the changelog.

Add one to each pull request that changes the extension:

```
pnpm changeset
```

After a merge to `main`, the release workflow opens a "chore: version packages" pull request. A merge of that pull request makes the release: it bumps the version in `package.json` and `public/manifest.json`, writes `CHANGELOG.md`, pushes the git tag, and creates the GitHub release.
