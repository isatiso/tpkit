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
