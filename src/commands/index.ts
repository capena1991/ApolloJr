import Discord from "discord.js"

import { prefix } from "../config.json"
import { Dict } from "../type-helpers"
import { Command } from "./types"

import ping from "./ping"
import hello from "./hello"
import server from "./server"
import user from "./user"
import _8ball from "./8ball"
import say from "./say"
import says from "./says"
import reset from "./reset"

const commands = [ping, hello, server, user, say, _8ball]

const help: Command = {
  name: "help",
  description: "Shows you what you can ask me to do.",
  execute: ({ channel, client }) => {
    let embed = new Discord.RichEmbed()
      .setTitle("Apollo Jr. commands")
      .setThumbnail(client.user.displayAvatarURL)
      .setDescription("Here's a list of what you can ask me to do.")
    embed = commands.reduce(
      (e, c) =>
        e.addField([c.name, ...(c.aliases || [])].map((name) => `\`${prefix}${name}\``).join(" "), c.description),
      embed,
    )
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
