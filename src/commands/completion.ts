import { Command } from 'commander'

const ZSH_COMPLETION = `
#compdef tpkit

_tpkit() {
    local -a commands
    local -a agent_commands

    commands=(
        'init:Initialize tpkit by cloning a private store repository'
        'update:Pull latest changes from the store repository'
        'cd:Open a shell in the store directory'
        'list:List all available rule sets in the store'
        'agent:Manage AI agent configurations'
        'completion:Generate shell completion script'
        'help:Display help for command'
    )

    agent_commands=(
        'sync:Sync rules, skills, and factory settings to the current project'
    )

    _arguments -C \\
        '(-h --help)'{-h,--help}'[display help]' \\
        '(-V --version)'{-V,--version}'[output version number]' \\
        '1:command:->command' \\
        '*::arg:->args'

    case $state in
        command)
            _describe -t commands 'tpkit command' commands
            ;;
        args)
            case $words[1] in
                agent)
                    _arguments -C \\
                        '1:subcommand:->subcmd' \\
                        '*::arg:->subargs'
                    case $state in
                        subcmd)
                            _describe -t agent_commands 'agent subcommand' agent_commands
                            ;;
                        subargs)
                            case $words[1] in
                                sync)
                                    _arguments \\
                                        '(-p --project)'{-p,--project}'[Project name]:project name' \\
                                        '--gitignore[Add synced paths to .gitignore]'
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
                completion)
                    _arguments '1:shell:(zsh bash)'
                    ;;
            esac
            ;;
    esac
}

compdef _tpkit tpkit
`.trim()

const BASH_COMPLETION = `
_tpkit() {
    local cur prev commands agent_commands
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    commands="init update cd list agent completion help"
    agent_commands="sync"

    case "\${COMP_WORDS[1]}" in
        agent)
            case "\${COMP_WORDS[2]}" in
                sync)
                    COMPREPLY=( $(compgen -W "-p --project --gitignore" -- "$cur") )
                    return 0
                    ;;
                *)
                    COMPREPLY=( $(compgen -W "$agent_commands" -- "$cur") )
                    return 0
                    ;;
            esac
            ;;
        completion)
            COMPREPLY=( $(compgen -W "zsh bash" -- "$cur") )
            return 0
            ;;
        *)
            COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
            return 0
            ;;
    esac
}

complete -F _tpkit tpkit
`.trim()

export function get_completion_script(shell: string): string | null {
    switch (shell) {
        case 'zsh': return ZSH_COMPLETION
        case 'bash': return BASH_COMPLETION
        default: return null
    }
}

export function register_completion(program: Command): void {
    program
        .command('completion')
        .description('Generate shell completion script')
        .argument('<shell>', 'Shell type (zsh or bash)')
        .action((shell: string) => {
            const script = get_completion_script(shell)
            if (script) {
                console.log(script)
            } else {
                console.error(`Unsupported shell: ${shell}. Use "zsh" or "bash".`)
                process.exit(1)
            }
        })
}
