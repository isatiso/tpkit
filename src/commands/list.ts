import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { get_store_path } from '../lib/store.js'

export function cmd_list(): void {
    const store_path = get_store_path()
    const rules_dir = path.join(store_path, 'rules')

    if (!fs.existsSync(rules_dir)) {
        console.log(chalk.yellow('No rules found.'))
        return
    }

    const rules = fs.readdirSync(rules_dir)
        .filter(f => f.endsWith('.md') && f !== 'base.md')
        .map(f => f.replace(/\.md$/, ''))

    if (rules.length === 0) {
        console.log(chalk.yellow('No project rules found.'))
        return
    }

    console.log(chalk.blue('Available projects:'))
    for (const name of rules) {
        console.log(`  ${name}`)
    }
}
