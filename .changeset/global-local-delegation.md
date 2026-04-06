---
"@tarpit/tpkit": minor
---

Add global-to-local CLI delegation like Angular CLI.

- Global `tpkit` detects project-local `@tarpit/tpkit` and delegates execution to it
- Warn when global and local versions differ
- Split entry into bootstrap (`index.ts`) and CLI logic (`cli.ts`)
- Export `./cli` subpath for local delegation
- Prompt `npm i -g @tarpit/tpkit` when global install is missing during init
