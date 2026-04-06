# tpkit

CLI tool for managing AI agent configs and devcontainer environments across multiple projects.

Keeps your rules, skills, env secrets, and devcontainer templates in a private Git repository (the "store"), and syncs them into any project with a single command.

## Install

```bash
npm install -g tpkit
```

## Quick Start

```bash
# 1. Initialize — clone your private store
tpkit init git@github.com:yourname/tpkit-store.git

# 2. List available project profiles
tpkit list

# 3. In a project directory, sync AI agent configs
cd ~/code/my-project
tpkit agent sync

# 4. Initialize devcontainer for the project
tpkit dc init

# 5. Later, sync updated env/secrets
tpkit dc sync
```

## Commands

### `tpkit init <git-url>`

Clone a private store repository to `~/.tpkit/store` and write config to `~/.tpkit/config.yaml`.

### `tpkit update`

Pull latest changes from the store repository.

### `tpkit list`

List all available profiles in the store.

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

### `tpkit dc init`

Initialize a `.devcontainer/` directory for the current project:

- Renders Handlebars templates with profile variables
- Copies profile override files (Dockerfile, aliases.sh, etc.)
- Copies `.env` and `.env.template`

```bash
tpkit dc init                   # auto-detect project from cwd
tpkit dc init -p node-tarpit    # explicit project name
```

### `tpkit dc sync`

Sync devcontainer files that change frequently (`.env`, `.env.template`). Does not overwrite templates by default.

```bash
tpkit dc sync                   # sync env only
tpkit dc sync --force           # re-render all templates
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
├── devcontainer/
│   ├── templates/              # Handlebars templates (.hbs)
│   └── profiles/               # Per-project config + overrides
│       └── <project>/
│           ├── profile.yaml    # Template variables
│           ├── build/Dockerfile
│           └── container/aliases.sh
├── env/
│   ├── .env.template
│   └── .env
└── factory/
    └── settings.json
```

### profile.yaml

```yaml
name: NodeTarpit
project: node-tarpit
image: node-tarpit-dev
hostname: node-tarpit
port: 2223
workspace: /workspace/node-tarpit
base_image: "node:22-slim"
history_dir: ~/.node-tarpit/zsh_history
rules: node-tarpit
```

## Development

```bash
pnpm install
pnpm build          # build once
pnpm dev            # watch mode
```

## Release

Uses [changesets](https://github.com/changesets/changesets) for version management.

```bash
# 1. After making changes, add a changeset
pnpm changeset

# 2. Commit the changeset file along with your code changes
git add -A && git commit -m "feat: ..."

# 3. Push to main
git push

# 4. Go to GitHub Actions → Publish → Run workflow
#    This will: apply changesets → bump version → build → npm publish → push tags
```

## License

MIT
