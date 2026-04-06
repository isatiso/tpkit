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

export async function cmd_agent_sync(options: { project?: string }): Promise<void> {
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

    // Skills
    console.log(chalk.blue('\nSkills:'))
    sync_skills(store_path, project_dir)

    // Factory settings
    console.log(chalk.blue('\nFactory settings:'))
    sync_factory_settings(store_path, project_dir)

    console.log(chalk.green('\n✓ Agent sync complete'))
}
