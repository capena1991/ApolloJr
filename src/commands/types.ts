import Discord from "discord.js"

export interface Command {
  name: string
  aliases?: string[]
  description: string
  subcommands?: Command[]
  default?: boolean
  execute: (message: Discord.Message, args: string[]) => void
}

export const executeSubcommands = (subcommands: Command[]) => {
  return (message: Discord.Message, args: string[]) => {
    const cmd = args[0]
    let defaultExec
    for (let i = 0; i < subcommands.length; i++) {
      const { name, aliases, execute, default: isDefault } = subcommands[i]
      if ([name, ...(aliases || [])].includes(cmd)) {
        return execute(message, args.slice(1))
      }
      if (isDefault) {
        defaultExec = execute
      }
    }
    if (defaultExec) {
      defaultExec(message, args)
    }
  }
}
