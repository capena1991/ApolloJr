import Discord from "discord.js"

import { prefix, countingChannel } from "../utilities/config"
import { Dict } from "../type-helpers"
import { Command } from "./types"

import ping from "./ping"
import hello from "./hello"
import server from "./server"
import user from "./user"
import oracle from "./oracle"
import say from "./say"
import says from "./says"
import reset from "./reset"
import birthday from "./birthday"
import count from "./count"
import transfer from "./transfer"
import shop from "./shop"
import inventory from "./inventory"
import poll from "./poll"

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
