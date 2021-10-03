import Discord from "discord.js"

export interface Command {
  name: string
  aliases?: string[]
  description: string
  subcommands?: Command[]
  default?: boolean
  runOnMessage?: (message: Discord.Message, args: string[]) => void
  runOnInteraction?: (interaction: Discord.CommandInteraction) => void
}

export type MessageCommand = Command & { runOnMessage: (message: Discord.Message, args: string[]) => void }
export type InteractionCommand = Command & { runOnInteraction: (interaction: Discord.Interaction) => void }

export interface ConditionalCommand extends MessageCommand {
  condition: (message: Discord.Message) => boolean
}
