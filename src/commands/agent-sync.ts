import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { pull_store, resolve_store_file } from '../lib/store.js'
import { copy_file, write_file } from '../lib/sync.js'

function resolve_project_name(project?: string): string {
    return project || path.basename(process.cwd())
}

function concat_rules(store_path: string, project: string): string {
    const base_path = path.join(store_path, 'rules', 'base.md')
    const project_path = path.join(store_path, 'rules', `${project}.md`)

    let content = ''
    if (fs.existsSync(base_path)) {
        content += fs.readFileSync(base_path, 'utf-8')
    }
    if (fs.existsSync(project_path)) {
        if (content) content += '\n\n'
        content += fs.readFileSync(project_path, 'utf-8')
    }
    return content
}

function merge_env(store_path: string, project: string): string {
    const base_path = path.join(store_path, 'env', 'base.env')
    const project_path = path.join(store_path, 'env', `${project}.env`)

    const entries = new Map<string, string>()
    const order: string[] = []

    for (const file_path of [base_path, project_path]) {
        if (!fs.existsSync(file_path)) continue
        for (const line of fs.readFileSync(file_path, 'utf-8').split('\n')) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) continue
            const eq = line.indexOf('=')
            if (eq === -1) continue
            const key = line.slice(0, eq).trim()
            const value = line.slice(eq + 1).trim()
            if (!entries.has(key)) order.push(key)
            entries.set(key, value)
        }
    }

    if (entries.size === 0) return ''
    return order.map(key => `${key}=${entries.get(key)}`).join('\n') + '\n'
}

function sync_skills(store_path: string, project_dir: string, agent: AgentTarget): void {
    const skills_dir = path.join(store_path, 'skills')
    if (!fs.existsSync(skills_dir)) return

    for (const skill_name of fs.readdirSync(skills_dir)) {
        const skill_dir = path.join(skills_dir, skill_name)
        if (!fs.statSync(skill_dir).isDirectory()) continue

        const src = path.join(skill_dir, 'skill.md')
        if (!fs.existsSync(src)) continue

        if (agent === 'claude') {
            copy_file(src, path.join(project_dir, '.claude', 'commands', `${skill_name}.md`))
        } else if (agent === 'codex') {
            copy_file(src, path.join(project_dir, '.codex', 'skills', skill_name, 'SKILL.md'))
        } else if (agent === 'factory') {
            copy_file(src, path.join(project_dir, '.factory', 'skills', skill_name, 'SKILL.md'))
        }
    }
}

function sync_factory_settings(store_path: string, project_dir: string): void {
    const src = path.join(store_path, 'factory', 'settings.json')
    if (fs.existsSync(src)) {
        copy_file(src, path.join(project_dir, '.factory', 'settings.json'))
    }
}

type AgentTarget = 'claude' | 'codex' | 'factory'

const AGENT_TARGETS: AgentTarget[] = ['claude', 'codex', 'factory']

// Files/dirs exclusively owned by each agent
const AGENT_EXCLUSIVE: Record<AgentTarget, string[]> = {
    claude: ['CLAUDE.md', '.claude'],
    codex: ['.codex'],
    factory: ['.factory'],
}

// Files shared between multiple agents - only removed when ALL owning agents are being cleaned
const SHARED_FILES: { path: string, agents: AgentTarget[] }[] = [
    { path: 'AGENTS.md', agents: ['codex', 'factory'] },
]

function remove_path(full_path: string, label: string): void {
    if (!fs.existsSync(full_path)) return
    const stat = fs.statSync(full_path)
    if (stat.isDirectory()) {
        fs.rmSync(full_path, { recursive: true, force: true })
    } else {
        fs.unlinkSync(full_path)
    }
    console.log(chalk.gray(`  removed ${label}`))
}

function clean_agents(project_dir: string, keep: AgentTarget[]): void {
    const to_clean = AGENT_TARGETS.filter(a => !keep.includes(a))
    if (to_clean.length === 0) return

    console.log(chalk.blue('\nCleaning:'))

    for (const agent of to_clean) {
        for (const entry of AGENT_EXCLUSIVE[agent]) {
            remove_path(path.join(project_dir, entry), entry)
        }
    }

    for (const shared of SHARED_FILES) {
        const all_owners_cleaned = shared.agents.every(a => !keep.includes(a))
        if (all_owners_cleaned) {
            remove_path(path.join(project_dir, shared.path), shared.path)
        }
    }
}

type SyncTarget = AgentTarget | 'env'

const VALID_TARGETS: SyncTarget[] = ['claude', 'codex', 'factory', 'env']

export async function cmd_agent_sync(targets: string[], options: { project?: string, gitignore?: boolean, clean?: boolean }): Promise<void> {
    const invalid = targets.filter(t => !(VALID_TARGETS as string[]).includes(t))
    if (invalid.length > 0) {
        console.error(chalk.red(`Unknown sync target(s): ${invalid.map(t => chalk.bold(t)).join(', ')}`))
        console.error(chalk.gray(`  Valid targets: ${VALID_TARGETS.join(', ')}`))
        process.exit(1)
    }

    await pull_store()

    const project = resolve_project_name(options.project)
    const store_path = resolve_store_file()
    const project_dir = process.cwd()

    const sync_targets = new Set(targets as SyncTarget[])
    const sync_all = sync_targets.size === 0
    const has = (t: SyncTarget) => sync_all || sync_targets.has(t)
    const label = sync_all ? 'all' : [...sync_targets].join(', ')

    console.log(chalk.blue(`\nSyncing agent config (${chalk.bold(label)}) for ${chalk.bold(project)}...`))

    // Claude: CLAUDE.md + .claude/commands/
    if (has('claude')) {
        console.log(chalk.blue('\nClaude:'))
        const rules_content = concat_rules(store_path, project)
        if (rules_content) {
            write_file(path.join(project_dir, 'CLAUDE.md'), rules_content)
        }
        sync_skills(store_path, project_dir, 'claude')
    }

    // Codex: AGENTS.md (shared) + .codex/skills/
    if (has('codex')) {
        console.log(chalk.blue('\nCodex:'))
        const rules_content = concat_rules(store_path, project)
        if (rules_content) {
            write_file(path.join(project_dir, 'AGENTS.md'), rules_content)
        }
        sync_skills(store_path, project_dir, 'codex')
    }

    // Factory: AGENTS.md (shared) + .factory/skills/ + .factory/settings.json
    if (has('factory')) {
        console.log(chalk.blue('\nFactory:'))
        // Only write AGENTS.md if codex wasn't already synced (avoid duplicate write)
        if (!has('codex')) {
            const rules_content = concat_rules(store_path, project)
            if (rules_content) {
                write_file(path.join(project_dir, 'AGENTS.md'), rules_content)
            }
        }
        sync_skills(store_path, project_dir, 'factory')
        sync_factory_settings(store_path, project_dir)
    }

    // Env: always sync
    console.log(chalk.blue('\nEnv:'))
    const env_content = merge_env(store_path, project)
    if (env_content) {
        write_file(path.join(project_dir, '.env'), env_content)
    } else {
        console.log(chalk.gray('  No env files found'))
    }

    // --clean: remove configs of agents not being synced
    const agent_targets_syncing = AGENT_TARGETS.filter(a => has(a))
    if (options.clean && !sync_all && agent_targets_syncing.length > 0) {
        clean_agents(project_dir, agent_targets_syncing)
    }

    // Check .gitignore
    if (sync_all) {
        check_gitignore(project_dir, options.gitignore)
    }

    console.log(chalk.green('\n✓ Agent sync complete'))
}

const GITIGNORE_ENTRIES = [
    '.env',
    'CLAUDE.md',
    'AGENTS.md',
    '.claude/',
    '.codex/',
    '.factory/',
]

function check_gitignore(project_dir: string, auto_add?: boolean): void {
    const gitignore_path = path.join(project_dir, '.gitignore')
    const existing = fs.existsSync(gitignore_path)
        ? fs.readFileSync(gitignore_path, 'utf-8')
        : ''

    const missing = GITIGNORE_ENTRIES.filter(entry => {
        return !existing.split('\n').some(line => {
            const trimmed = line.trim()
            return trimmed === entry || trimmed === entry.replace(/\/$/, '')
        })
    })

    if (missing.length === 0) return

    if (auto_add) {
        const block = '\n# AI agent configs (managed by tpkit)\n' + missing.join('\n') + '\n'
        fs.appendFileSync(gitignore_path, block, 'utf-8')
        console.log(chalk.blue('\nAdded to .gitignore:'))
        for (const entry of missing) {
            console.log(chalk.gray(`  ${entry}`))
        }
    } else {
        console.log(chalk.yellow('\nThe following paths are not in .gitignore:'))
        for (const entry of missing) {
            console.log(chalk.yellow(`  ${entry}`))
        }
        console.log(chalk.gray('  Run with --gitignore to add them automatically'))
    }
}
