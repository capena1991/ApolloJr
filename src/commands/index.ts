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

const commands: Dict<Command> = { ping, hello, server, user, say, "8ball": _8ball }

const help: Command = {
  name: "help",
  description: "Shows you what you can ask me to do.",
  execute({ channel, client }) {
    let embed = new Discord.RichEmbed()
      .setTitle("Apollo Jr. commands")
      .setThumbnail(client.user.displayAvatarURL)
      .setDescription("Here's a list of what you can ask me to do.")
    embed = Object.values(commands).reduce((e, c) => e.addField(`\`${prefix}${c?.name}\``, c?.description), embed)
    channel.send(embed)
  },
}

const allCommands: Dict<Command> = { ...commands, help, says }

export const getCommand = (name: string) => {
  return allCommands[name]
}
