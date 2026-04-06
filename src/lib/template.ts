import fs from 'node:fs'
import Handlebars from 'handlebars'
import type { Profile } from '../types.js'

export function render_template(template_path: string, profile: Profile): string {
    const raw = fs.readFileSync(template_path, 'utf-8')
    const template = Handlebars.compile(raw, { noEscape: true })
    return template(profile)
}
