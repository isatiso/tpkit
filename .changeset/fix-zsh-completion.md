---
"@tarpit/tpkit": patch
---

Fix zsh completion error on shell startup.

- Replace direct `_tpkit` call with `compdef _tpkit tpkit` to register completion correctly
