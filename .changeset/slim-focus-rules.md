---
"@tarpit/tpkit": minor
---

Simplify to focus on rules and skills syncing only.

- Remove devcontainer management commands (`dc init`, `dc sync`)
- Remove `handlebars` dependency (no longer needed for template rendering)
- Remove profile system — project name is derived from directory name or `--project` flag
- `tpkit list` now shows available rule sets instead of profiles
- Add devcontainer skill to guide AI agents in creating devcontainer setups
