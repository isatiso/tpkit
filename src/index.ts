import { Command } from 'commander'
import { cmd_agent_sync } from './commands/agent-sync.js'
import { cmd_cd } from './commands/cd.js'
import { cmd_init } from './commands/init.js'
import { cmd_list } from './commands/list.js'
import { cmd_update } from './commands/update.js'

const program = new Command()

program
    .name('tpkit')
    .description('CLI tool for syncing AI agent rules and skills across projects')
    .version('0.2.0')

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
    .description('List all available rule sets in the store')
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

program.parse()
