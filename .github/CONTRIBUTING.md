# Contributing

## Development

```bash
pnpm install
pnpm dev            # watch mode
pnpm build          # build once
```

## Release Flow

Uses [changesets](https://github.com/changesets/changesets) for version management.

### 1. Add a changeset

After making changes, describe what changed and the semver bump type:

```bash
pnpm changeset
```

This creates a file in `.changeset/` — commit it along with your code changes.

### 2. Push to main

```bash
git add -A && git commit -m "feat: ..."
git push
```

### 3. Trigger publish

Go to **GitHub Actions → Publish → Run workflow** (manual trigger).

The workflow will automatically:

1. Run `changeset version` — consume changesets, bump `package.json` version, generate `CHANGELOG.md`
2. Commit and push the version bump
3. Run `pnpm build && changeset publish` — build and publish to npm
4. Create a GitHub Release with git tag
