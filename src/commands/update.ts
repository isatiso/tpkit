import { pull_store } from '../lib/store.js'

export async function cmd_update(): Promise<void> {
    await pull_store()
}
