export interface TpkitConfig {
    store_url: string
    store_path: string
}

export const TPKIT_DIR = `${process.env.HOME}/.tpkit`
export const CONFIG_PATH = `${TPKIT_DIR}/config.yaml`
export const DEFAULT_STORE_PATH = `${TPKIT_DIR}/store`
