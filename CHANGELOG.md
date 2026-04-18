# tpkit

## 0.8.0

### Minor Changes

- Add per-agent sync targeting with multi-select and clean support.

  - Add optional `[targets...]` argument to `agent sync` to sync specific agents: `claude`, `codex`, `factory`, `env`
  - Support multiple targets in a single invocation (e.g. `agent sync claude factory`)
  - Add `--clean` flag to remove config files of agents not being synced
  - Always sync `.env` regardless of target
  - Add `AGENTS.md` sync support for `factory` agent (shared with `codex`)
  - Handle shared file cleanup correctly: `AGENTS.md` is only removed when both `codex` and `factory` are excluded

## 0.7.0

### Minor Changes

- Support `TPKIT_STORE_URL` environment variable for `tpkit init` and auto-tag releases in CI.

  - Add `TPKIT_STORE_URL` env var as fallback for `tpkit init <git-url>`, making the git URL argument optional
  - Auto-create and push a versioned git tag after npm publish in the publish workflow

## 0.6.1

### Patch Changes

- 25ae740: Pin dependency versions to patch range (~) for more predictable builds.

## 0.6.0

### Minor Changes

- 40995b9: Add global-to-local CLI delegation like Angular CLI.

  - Global `tpkit` detects project-local `@tarpit/tpkit` and delegates execution to it
  - Warn when global and local versions differ
  - Split entry into bootstrap (`index.ts`) and CLI logic (`cli.ts`)
  - Export `./cli` subpath for local delegation
  - Prompt `npm i -g @tarpit/tpkit` when global install is missing during init

## 0.5.1

### Patch Changes

- ae60b1f: Fix zsh completion error on shell startup.

  - Replace direct `_tpkit` call with `compdef _tpkit tpkit` to register completion correctly

## 0.5.0

### Minor Changes

- Add shell completion and simplify publish workflow.

  - Add `tpkit completion <shell>` command for zsh/bash tab completion
  - Auto-install shell completion during `tpkit init`
  - Simplify CI: remove changesets/action, run version locally before publish
  - Replace `changeset publish` with direct `npm publish` in CI

## 0.4.0

### Minor Changes

- ad34fd5: Add environment variable management and .gitignore guidance.

  - Sync `.env` files: merge `env/base.env` + `env/<project>.env` into project root
  - Add `--gitignore` flag to automatically add synced paths (`.env`, `CLAUDE.md`, `.claude/`, etc.) to `.gitignore`
  - Warn about missing `.gitignore` entries after each sync
  - Fix `--version` to read from package.json at build time

## 0.3.0

### Minor Changes

- 37f5317: Simplify to focus on AI agent rules and skills syncing.

  - Remove devcontainer management (`dc init`, `dc sync`) and template rendering
  - Remove `handlebars` dependency
  - Unify skill format: single `skill.md` per skill, synced to all AI tools
  - Replace profile system with direct project name resolution from directory name
  - `tpkit list` now shows available rule sets instead of profiles

## 0.2.0

### Minor Changes

- 43b8742: Initial release — CLI tool for managing AI agent configs and devcontainer environments across multiple projects.

  - `tpkit init` — clone a private store repository
  - `tpkit agent sync` — sync rules and skills to the current project
  - `tpkit dc init` / `tpkit dc sync` — initialize and sync devcontainer configurations
  - `tpkit update` / `tpkit list` / `tpkit cd` — store management utilities
