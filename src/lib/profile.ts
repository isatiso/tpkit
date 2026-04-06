import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { parse as parse_yaml } from 'yaml'
import type { Profile } from '../types.js'
import { get_store_path } from './store.js'

export function resolve_project_name(project?: string): string {
    if (project) return project
    return path.basename(process.cwd())
}

export function load_profile(project: string): Profile {
    const profile_path = path.join(get_store_path(), 'devcontainer', 'profiles', project, 'profile.yaml')
    if (!fs.existsSync(profile_path)) {
        console.error(chalk.red(`Profile not found: ${profile_path}`))
        process.exit(1)
    }
    const raw = fs.readFileSync(profile_path, 'utf-8')
    return parse_yaml(raw) as Profile
}

export function list_profiles(): string[] {
    const profiles_dir = path.join(get_store_path(), 'devcontainer', 'profiles')
    if (!fs.existsSync(profiles_dir)) return []
    return fs.readdirSync(profiles_dir).filter(name => {
        const profile_path = path.join(profiles_dir, name, 'profile.yaml')
        return fs.existsSync(profile_path)
    })
}
