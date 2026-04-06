import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import chalk from 'chalk'
import { clone_store, ensure_tpkit_dir, save_config } from '../lib/store.js'
import { DEFAULT_STORE_PATH } from '../types.js'
import { get_completion_script } from './completion.js'

const COMPLETION_MARKER = '# tpkit shell completion'

function is_global_installed(): boolean {
    try {
        const bin = execSync('which tpkit', { encoding: 'utf-8' }).trim()
        // node_modules/.bin/ means local, not global
        return !!bin && !bin.includes('node_modules')
    } catch {
        return false
    }
}

function install_completion(): void {
    const shell = path.basename(process.env.SHELL || 'zsh')
    const script = get_completion_script(shell)
    if (!script) return

    const rc_file = shell === 'bash'
        ? path.join(os.homedir(), '.bashrc')
        : path.join(os.homedir(), '.zshrc')

    const existing = fs.existsSync(rc_file) ? fs.readFileSync(rc_file, 'utf-8') : ''
    if (existing.includes(COMPLETION_MARKER)) return

    const block = `\n${COMPLETION_MARKER}\neval "$(tpkit completion ${shell})"\n`
    fs.appendFileSync(rc_file, block)
    console.log(chalk.green(`✓ Shell completion added to ${rc_file}`))
}

export async function cmd_init(url?: string): Promise<void> {
    const git_url = url || process.env.TPKIT_STORE_URL
    if (!git_url) {
        console.error(chalk.red('No git URL provided.'))
        console.error(chalk.red('Usage: tpkit init <git-url> or set TPKIT_STORE_URL environment variable.'))
        process.exitCode = 1
        return
    }

    ensure_tpkit_dir()

    const store_path = DEFAULT_STORE_PATH
    if (fs.existsSync(store_path)) {
        console.error(chalk.yellow(`Store already exists at ${store_path}`))
        console.error(chalk.yellow('Remove it first or run `tpkit update` to pull latest.'))
        return
    }

    await clone_store(git_url, store_path)
    save_config({ store_url: git_url, store_path })

    if (is_global_installed()) {
        install_completion()
        console.log(chalk.green(`\n✓ Initialized tpkit with store at ${store_path}`))
        console.log(chalk.cyan('  Run `source ~/.zshrc` or restart your terminal to enable tab completion.'))
    } else {
        console.log(chalk.green(`\n✓ Initialized tpkit with store at ${store_path}`))
        console.log(chalk.yellow('\n  tpkit is not installed globally. To enable the `tpkit` command and shell completion:'))
        console.log(chalk.cyan('  npm i -g @tarpit/tpkit'))
    }
}
