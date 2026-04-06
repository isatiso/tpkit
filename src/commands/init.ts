import fs from 'node:fs'
import chalk from 'chalk'
import { clone_store, ensure_tpkit_dir, save_config } from '../lib/store.js'
import { DEFAULT_STORE_PATH } from '../types.js'

export async function cmd_init(url: string): Promise<void> {
    ensure_tpkit_dir()

    const store_path = DEFAULT_STORE_PATH
    if (fs.existsSync(store_path)) {
        console.error(chalk.yellow(`Store already exists at ${store_path}`))
        console.error(chalk.yellow('Remove it first or run `tpkit update` to pull latest.'))
        return
    }

    await clone_store(url, store_path)
    save_config({ store_url: url, store_path })
    console.log(chalk.green(`\n✓ Initialized tpkit with store at ${store_path}`))
}
