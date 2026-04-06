import { execSync } from 'node:child_process'
import chalk from 'chalk'
import { get_store_path } from '../lib/store.js'

export function cmd_cd(): void {
    const store_path = get_store_path()
    console.log(chalk.blue(`Opening shell in ${store_path}`))
    execSync(`cd "${store_path}" && ${process.env.SHELL || '/bin/zsh'}`, { stdio: 'inherit' })
}
