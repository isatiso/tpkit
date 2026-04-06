import chalk from 'chalk'
import { list_profiles } from '../lib/profile.js'

export function cmd_list(): void {
    const profiles = list_profiles()
    if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found.'))
        return
    }
    console.log(chalk.blue('Available profiles:'))
    for (const name of profiles) {
        console.log(`  ${name}`)
    }
}
