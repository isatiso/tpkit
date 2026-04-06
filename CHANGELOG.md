# tpkit

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
