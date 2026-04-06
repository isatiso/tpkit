import { Command } from 'commander'
import { cmd_agent_sync } from './commands/agent-sync.js'
import { cmd_cd } from './commands/cd.js'
import { cmd_dc_init } from './commands/dc-init.js'
import { cmd_dc_sync } from './commands/dc-sync.js'
import { cmd_init } from './commands/init.js'
import { cmd_list } from './commands/list.js'
import { cmd_update } from './commands/update.js'

const program = new Command()

program
    .name('tpkit')
    .description('CLI tool for managing AI agent configs and devcontainer environments')
    .version('0.1.0')

program
    .command('init')
    .description('Initialize tpkit by cloning a private store repository')
    .argument('<git-url>', 'Git URL of the private store repository')
    .action(cmd_init)

program
    .command('update')
    .description('Pull latest changes from the store repository')
    .action(cmd_update)

program
    .command('cd')
    .description('Open a shell in the store directory')
    .action(cmd_cd)

program
    .command('list')
    .description('List all available profiles')
    .action(cmd_list)

// agent subcommand
const agent = program
    .command('agent')
    .description('Manage AI agent configurations')

agent
    .command('sync')
    .description('Sync rules, skills, and factory settings to the current project')
    .option('-p, --project <name>', 'Project name (defaults to current directory name)')
    .action(cmd_agent_sync)

// devcontainer subcommand
const dc = program
    .command('devcontainer')
    .alias('dc')
    .description('Manage devcontainer configurations')

dc
    .command('init')
    .description('Initialize devcontainer for the current project')
    .option('-p, --project <name>', 'Project name (defaults to current directory name)')
    .action(cmd_dc_init)

dc
    .command('sync')
    .description('Sync devcontainer files (env, secrets) for the current project')
    .option('-p, --project <name>', 'Project name (defaults to current directory name)')
    .option('-f, --force', 'Force re-render all templates')
    .action(cmd_dc_sync)

program.parse()
