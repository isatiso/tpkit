---
"@tarpit/tpkit": minor
---

Simplify to focus on AI agent rules and skills syncing.

- Remove devcontainer management (`dc init`, `dc sync`) and template rendering
- Remove `handlebars` dependency
- Unify skill format: single `skill.md` per skill, synced to all AI tools
- Replace profile system with direct project name resolution from directory name
- `tpkit list` now shows available rule sets instead of profiles
