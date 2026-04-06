import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { load_profile, resolve_project_name } from '../lib/profile.js'
import { get_store_path, pull_store } from '../lib/store.js'
import { copy_dir_recursive, copy_file, write_file } from '../lib/sync.js'
import { render_template } from '../lib/template.js'

export async function cmd_dc_sync(options: { project?: string, force?: boolean }): Promise<void> {
    await pull_store()

    const project = resolve_project_name(options.project)
    const profile = load_profile(project)
    const store_path = get_store_path()
    const project_dir = process.cwd()
    const dc_dir = path.join(project_dir, '.devcontainer')

    if (!fs.existsSync(dc_dir)) {
        console.error(chalk.red('.devcontainer/ not found. Run `tpkit devcontainer init` first.'))
        return
    }

    console.log(chalk.blue(`Syncing devcontainer for ${chalk.bold(project)}...`))

    // Always sync: .env
    const env_src = path.join(store_path, 'env', '.env')
    if (fs.existsSync(env_src)) {
        console.log(chalk.blue('\nSyncing .env:'))
        copy_file(env_src, path.join(dc_dir, '.env'))
    }

    // Always sync: .env.template
    const env_template_src = path.join(store_path, 'env', '.env.template')
    if (fs.existsSync(env_template_src)) {
        copy_file(env_template_src, path.join(dc_dir, '.env.template'))
    }

    if (options.force) {
        console.log(chalk.yellow('\n--force: Re-rendering all templates...'))

        // Re-render templates
        const templates_dir = path.join(store_path, 'devcontainer', 'templates')
        if (fs.existsSync(templates_dir)) {
            render_templates_recursive(templates_dir, dc_dir, profile)
        }

        // Re-copy shared
        const shared_dir = path.join(store_path, 'devcontainer', 'shared')
        if (fs.existsSync(shared_dir)) {
            copy_dir_recursive(shared_dir, dc_dir)
        }

        // Re-apply overrides
        const profile_dir = path.join(store_path, 'devcontainer', 'profiles', project)
        if (fs.existsSync(profile_dir)) {
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
    }

    console.log(chalk.green(`\n✓ DevContainer sync complete for ${project}`))
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
