import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { load_profile, resolve_project_name } from '../lib/profile.js'
import { get_store_path, pull_store } from '../lib/store.js'
import { copy_dir_recursive, copy_file, write_file } from '../lib/sync.js'
import { render_template } from '../lib/template.js'

export async function cmd_dc_init(options: { project?: string }): Promise<void> {
    await pull_store()

    const project = resolve_project_name(options.project)
    const profile = load_profile(project)
    const store_path = get_store_path()
    const project_dir = process.cwd()
    const dc_dir = path.join(project_dir, '.devcontainer')

    if (fs.existsSync(dc_dir) && fs.readdirSync(dc_dir).length > 0) {
        console.error(chalk.yellow('.devcontainer/ already exists and is not empty.'))
        console.error(chalk.yellow('Use `tpkit devcontainer sync` to update, or remove it first.'))
        return
    }

    console.log(chalk.blue(`Initializing devcontainer for ${chalk.bold(project)}...`))

    // 1. Render templates
    const templates_dir = path.join(store_path, 'devcontainer', 'templates')
    if (fs.existsSync(templates_dir)) {
        console.log(chalk.blue('\nRendering templates:'))
        render_templates_recursive(templates_dir, dc_dir, profile)
    }

    // 2. Copy shared files
    const shared_dir = path.join(store_path, 'devcontainer', 'shared')
    if (fs.existsSync(shared_dir)) {
        console.log(chalk.blue('\nCopying shared files:'))
        copy_dir_recursive(shared_dir, dc_dir)
    }

    // 3. Copy profile overrides (these take priority over templates and shared)
    const profile_dir = path.join(store_path, 'devcontainer', 'profiles', project)
    if (fs.existsSync(profile_dir)) {
        console.log(chalk.blue('\nApplying profile overrides:'))
        for (const entry of fs.readdirSync(profile_dir)) {
            if (entry === 'profile.yaml') continue
            const src = path.join(profile_dir, entry)
            if (fs.statSync(src).isDirectory()) {
                copy_dir_recursive(src, path.join(dc_dir, entry))
            } else {
                copy_file(src, path.join(dc_dir, entry))
            }
        }
    }

    // 4. Copy env files
    const env_dir = path.join(store_path, 'env')
    if (fs.existsSync(env_dir)) {
        console.log(chalk.blue('\nCopying env files:'))
        const env_src = path.join(env_dir, '.env')
        const env_template_src = path.join(env_dir, '.env.template')
        if (fs.existsSync(env_src)) {
            copy_file(env_src, path.join(dc_dir, '.env'))
        }
        if (fs.existsSync(env_template_src)) {
            copy_file(env_template_src, path.join(dc_dir, '.env.template'))
        }
    }

    console.log(chalk.green(`\n✓ DevContainer initialized for ${project}`))
    console.log(chalk.gray('  Build the image: .devcontainer/build/build.sh'))
}

function render_templates_recursive(templates_dir: string, dest_dir: string, profile: object): void {
    for (const entry of fs.readdirSync(templates_dir, { withFileTypes: true })) {
        const src_path = path.join(templates_dir, entry.name)
        if (entry.isDirectory()) {
            render_templates_recursive(src_path, path.join(dest_dir, entry.name), profile)
        } else if (entry.name.endsWith('.hbs')) {
            const dest_name = entry.name.replace(/\.hbs$/, '')
            const content = render_template(src_path, profile as any)
            write_file(path.join(dest_dir, dest_name), content)
        } else {
            copy_file(src_path, path.join(dest_dir, entry.name))
        }
    }
}
