import Discord from "discord.js"

import { prefix, countingChannel } from "../config.json"
import { Dict } from "../type-helpers"
import { Command } from "./types"

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
import transfer from "./commands/transfer"
import shop from "./commands/shop"
import inventory from "./commands/inventory"
import poll from "./commands/poll"

const commands = [ping, hello, server, user, say, oracle, birthday, transfer, shop, inventory, poll]

const help: Command = {
  name: "help",
  description: "Shows you what you can ask me to do.",
  execute: ({ channel, client }) => {
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
    channel.send(embed)
  },
}

const hiddenCommands = [help, says, reset]

const allCommands = [...commands, ...hiddenCommands]

const commandMap: Dict<Command> = {}
allCommands.forEach((cmd) => {
  commandMap[cmd.name] = cmd
  ;(cmd.aliases || []).forEach((alias) => {
    commandMap[alias] = cmd
  })
})

export const getCommand = (name: string) => {
  return commandMap[name]
}

const channelCommands: Dict<Command> = { [countingChannel]: count }
export const getChannelCommand = (channelId: string) => channelCommands[channelId]
