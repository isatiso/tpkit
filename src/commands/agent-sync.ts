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

function sync_skills(store_path: string, project_dir: string): void {
    const skills_dir = path.join(store_path, 'skills')
    if (!fs.existsSync(skills_dir)) return

    for (const skill_name of fs.readdirSync(skills_dir)) {
        const skill_dir = path.join(skills_dir, skill_name)
        if (!fs.statSync(skill_dir).isDirectory()) continue

        const src = path.join(skill_dir, 'skill.md')
        if (!fs.existsSync(src)) continue

        // Claude Code
        copy_file(src, path.join(project_dir, '.claude', 'commands', `${skill_name}.md`))
        // Codex
        copy_file(src, path.join(project_dir, '.codex', 'skills', skill_name, 'SKILL.md'))
        // Factory
        copy_file(src, path.join(project_dir, '.factory', 'skills', skill_name, 'SKILL.md'))
    }
}

function sync_factory_settings(store_path: string, project_dir: string): void {
    const src = path.join(store_path, 'factory', 'settings.json')
    if (fs.existsSync(src)) {
        copy_file(src, path.join(project_dir, '.factory', 'settings.json'))
    }
}

export async function cmd_agent_sync(options: { project?: string, gitignore?: boolean }): Promise<void> {
    await pull_store()

    const project = resolve_project_name(options.project)
    const store_path = resolve_store_file()
    const project_dir = process.cwd()

    console.log(chalk.blue(`\nSyncing agent config for ${chalk.bold(project)}...`))

    // Rules
    console.log(chalk.blue('\nRules:'))
    const rules_content = concat_rules(store_path, project)
    if (rules_content) {
        write_file(path.join(project_dir, 'CLAUDE.md'), rules_content)
        write_file(path.join(project_dir, 'AGENTS.md'), rules_content)
    }

    // Env
    console.log(chalk.blue('\nEnv:'))
    const env_content = merge_env(store_path, project)
    if (env_content) {
        write_file(path.join(project_dir, '.env'), env_content)
    } else {
        console.log(chalk.gray('  No env files found'))
    }

    // Skills
    console.log(chalk.blue('\nSkills:'))
    sync_skills(store_path, project_dir)

    // Factory settings
    console.log(chalk.blue('\nFactory settings:'))
    sync_factory_settings(store_path, project_dir)

    // Check .gitignore
    check_gitignore(project_dir, options.gitignore)

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
