import { createRequire } from 'node:module'
import chalk from 'chalk'

async function main(): Promise<void> {
    const cwd_require = createRequire(process.cwd() + '/')
    try {
        const local_cli_path = cwd_require.resolve('@tarpit/tpkit/cli')
        const local_cli = await import(local_cli_path)
        if (local_cli.VERSION !== __VERSION__) {
            console.warn(chalk.yellow(`Global tpkit ${__VERSION__}, local ${local_cli.VERSION}. Using local version.`))
        }
        local_cli.run()
    } catch {
        const { run } = await import('./cli.js')
        run()
    }
}

main()
