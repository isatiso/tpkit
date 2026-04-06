---
"@tarpit/tpkit": minor
---

Add environment variable management and .gitignore guidance.

- Sync `.env` files: merge `env/base.env` + `env/<project>.env` into project root
- Add `--gitignore` flag to automatically add synced paths (`.env`, `CLAUDE.md`, `.claude/`, etc.) to `.gitignore`
- Warn about missing `.gitignore` entries after each sync
- Fix `--version` to read from package.json at build time
