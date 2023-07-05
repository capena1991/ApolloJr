import Discord from "discord.js"

import { RepliableMessage } from "../utilities/discord"

interface CommandBase {
  name: string
  aliases?: string[]
  description: string
  options?: Discord.ApplicationCommandOptionData[]
}

export interface MessageCommand extends CommandBase {
  runOnMessage: (message: RepliableMessage, args: string[]) => Promise<void>
}

export interface InteractionCommand extends CommandBase {
  runOnInteraction: (interaction: Discord.ChatInputCommandInteraction) => Promise<void>
}

export interface ConditionalCommand extends MessageCommand {
  condition: (message: Discord.Message) => boolean
}

export type Command = MessageCommand | InteractionCommand | ConditionalCommand

export const isMessageCommand = (command: Command): command is MessageCommand => "runOnMessage" in command
export const isInteractionCommand = (command: Command): command is InteractionCommand => "runOnInteraction" in command
export const isConditionalCommand = (command: Command): command is ConditionalCommand =>
  isMessageCommand(command) && "condition" in command
