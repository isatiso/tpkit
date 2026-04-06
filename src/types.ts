export interface TpkitConfig {
    store_url: string
    store_path: string
}

export interface Profile {
    name: string
    project: string
    image: string
    hostname: string
    port: number
    workspace: string
    base_image: string
    history_dir: string
    rules: string
    extensions_add?: string[]
    extensions_remove?: string[]
    container_env?: Record<string, string>
}

export interface AgentPaths {
    claude_commands: string
    codex_skills: string
    factory_skills: string
    claude_rules: string
    agents_rules: string
    factory_settings: string
}

export const TPKIT_DIR = `${process.env.HOME}/.tpkit`
export const CONFIG_PATH = `${TPKIT_DIR}/config.yaml`
export const DEFAULT_STORE_PATH = `${TPKIT_DIR}/store`
