import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'

export function copy_file(src: string, dest: string): void {
    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    fs.copyFileSync(src, dest)
    console.log(chalk.gray(`  ${path.relative(process.cwd(), dest)}`))
}

export function write_file(dest: string, content: string): void {
    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dest, content, 'utf-8')
    console.log(chalk.gray(`  ${path.relative(process.cwd(), dest)}`))
}

export function copy_dir_recursive(src: string, dest: string): void {
    if (!fs.existsSync(src)) return
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
    }
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const src_path = path.join(src, entry.name)
        const dest_path = path.join(dest, entry.name)
        if (entry.isDirectory()) {
            copy_dir_recursive(src_path, dest_path)
        } else {
            copy_file(src_path, dest_path)
        }
    }
}
