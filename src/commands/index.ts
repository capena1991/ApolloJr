import Discord from "discord.js"

import { prefix, countingChannel } from "../utilities/config"
import { logInfo } from "../utilities/log"
import { Dict } from "../type-helpers"
import { Command, InteractionCommand, MessageCommand } from "./types"

import ping from "./commands/ping"
import hello from "./commands/hello"
import server from "./commands/server"
import user from "./commands/user"
import oracle from "./commands/oracle"
import say from "./commands/say"
import says from "./commands/says"
import reset from "./commands/reset"
import birthday from "./commands/birthday"
import count from "./commands/count"
// import transfer from "./transfer"
// import shop from "./shop"
// import inventory from "./inventory"
import poll from "./commands/poll"
import gif from "./commands/gif"

export { Command, MessageCommand, InteractionCommand }

const runHelp = (client: Discord.Client) => {
  let embed = new Discord.MessageEmbed()
    .setTitle("Apollo Jr. commands")
    .setDescription("Here's a list of what you can ask me to do.")
    .addFields(
      commands.map((c) => ({
        name: [c.name, ...(c.aliases || [])].map((name) => `\`${prefix}${name}\``).join(" "),
        value: c.description,
      })),
    )
  if (client.user) {
    embed = embed.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
  }
  return { embeds: [embed] }
}

const help: Command = {
  name: "help",
  description: "Shows you what you can ask me to do.",
  runOnMessage: ({ channel, client }) => channel.send(runHelp(client)),
  runOnInteraction: (interaction) => interaction.reply(runHelp(interaction.client)),
}

const commands = [ping, hello, server, user, say, oracle, birthday, poll, help]

const hiddenCommands = [says, reset]

const allCommands = [...commands, ...hiddenCommands]

const getCommandMap = (wantedCommands: Command[]) =>
  Object.fromEntries(wantedCommands.map((cmd) => [cmd.name, cmd.aliases ?? []].map((name) => [name, cmd])).flat())

const messageCommandMap: Dict<MessageCommand> = getCommandMap(allCommands.filter(({ runOnMessage }) => runOnMessage))
export const getMessageCommand = (name: string) => {
  return messageCommandMap[name]
}

const interactionCommandMap: Dict<InteractionCommand> = getCommandMap(
  allCommands.filter(({ runOnInteraction }) => runOnInteraction),
)
export const getInteractionCommand = (name: string) => {
  return interactionCommandMap[name]
}

const channelCommands: Dict<MessageCommand> = { [countingChannel]: count }
export const getChannelCommand = (channelId: string) => channelCommands[channelId]

const conditionalCommands = [gif]
export const findConditionalCommand = (message: Discord.Message) =>
  conditionalCommands.find(({ condition }) => condition(message))

export const registerCommands = async (
  commandManager: Discord.ApplicationCommandManager | Discord.GuildApplicationCommandManager,
) => {
  const slashCommands = allCommands
    .filter(({ runOnInteraction }) => runOnInteraction)
    .map(({ name, description }) => ({ name, description }))

  for (const cmd of slashCommands) {
    await commandManager.create(cmd)
    logInfo(`CREATED COMMAND ${cmd.name}`)
  }
}
