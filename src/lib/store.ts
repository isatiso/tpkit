import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { simpleGit } from 'simple-git'
import { parse as parse_yaml, stringify as stringify_yaml } from 'yaml'
import { CONFIG_PATH, DEFAULT_STORE_PATH, TPKIT_DIR, type TpkitConfig } from '../types.js'

export function ensure_tpkit_dir(): void {
    if (!fs.existsSync(TPKIT_DIR)) {
        fs.mkdirSync(TPKIT_DIR, { recursive: true })
    }
}

export function load_config(): TpkitConfig {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error(chalk.red('tpkit not initialized. Run `tpkit init <git-url>` first.'))
        process.exit(1)
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    return parse_yaml(raw) as TpkitConfig
}

export function save_config(config: TpkitConfig): void {
    ensure_tpkit_dir()
    fs.writeFileSync(CONFIG_PATH, stringify_yaml(config), 'utf-8')
}

export function get_store_path(): string {
    const config = load_config()
    return config.store_path || DEFAULT_STORE_PATH
}

export async function clone_store(url: string, target: string): Promise<void> {
    const git = simpleGit()
    console.log(chalk.blue(`Cloning ${url} → ${target}`))
    await git.clone(url, target)
    console.log(chalk.green('✓ Store cloned'))
}

export async function pull_store(): Promise<void> {
    const store_path = get_store_path()
    if (!fs.existsSync(store_path)) {
        console.error(chalk.red(`Store not found at ${store_path}. Run \`tpkit init\` first.`))
        process.exit(1)
    }
    const git = simpleGit(store_path)
    try {
        const remotes = await git.getRemotes()
        if (remotes.length === 0) {
            console.log(chalk.gray('Store has no remotes, skipping pull.'))
            return
        }
        const branch = await git.branchLocal()
        const tracking = branch.branches[branch.current]?.label
        if (!tracking) {
            console.log(chalk.gray('No tracking branch, skipping pull.'))
            return
        }
        console.log(chalk.blue('Pulling latest store...'))
        await git.pull()
        console.log(chalk.green('✓ Store updated'))
    } catch {
        console.log(chalk.yellow('Could not pull store, using local copy.'))
    }
}

export function resolve_store_file(...segments: string[]): string {
    return path.join(get_store_path(), ...segments)
}
