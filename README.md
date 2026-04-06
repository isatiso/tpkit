# tpkit

CLI tool for syncing AI agent rules and skills across projects from a private Git store.

## Install

```bash
npm install -g @tarpit/tpkit
```

## Quick Start

```bash
# 1. Initialize — clone your private store
tpkit init git@github.com:yourname/tpkit-store.git

# 2. List available projects
tpkit list

# 3. In a project directory, sync AI agent configs
cd ~/code/my-project
tpkit agent sync
```

## Commands

### `tpkit init <git-url>`

Clone a private store repository to `~/.tpkit/store` and write config to `~/.tpkit/config.yaml`.

### `tpkit update`

Pull latest changes from the store repository.

### `tpkit list`

List all available projects in the store.

### `tpkit cd`

Open a shell in the store directory for editing.

### `tpkit agent sync`

Sync AI agent configurations to the current project:

- **Rules** — concatenates `rules/base.md` + `rules/<project>.md` → generates `CLAUDE.md` and `AGENTS.md`
- **Skills** — distributes per-tool skill files to `.claude/commands/`, `.codex/skills/`, `.factory/skills/`
- **Factory settings** — copies `factory/settings.json` to `.factory/settings.json`

```bash
tpkit agent sync                # auto-detect project from cwd
tpkit agent sync -p megaquant   # explicit project name
```

## Store Structure

The private store repository follows this layout:

```
store/
├── rules/                      # Always-loaded project instructions
│   ├── base.md                 # Shared across all projects
│   └── <project>.md            # Project-specific rules
├── skills/                     # On-demand commands, per-tool versions
│   └── <skill>/
│       ├── claude.md
│       ├── codex.md
│       └── factory.md
└── factory/
    └── settings.json           # Factory Droid configuration
```

## Development

```bash
pnpm install
pnpm build          # build once
pnpm dev            # watch mode
```

## Release

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

MIT
