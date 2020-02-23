import Discord from "discord.js"

import { Command } from "./types"

const getUserInfo = (user: Discord.User) =>
  [`${user.username}'s ID: ${user.id}`, `${user.username}'s avatar: ${user.displayAvatarURL}`].join("\n")

const ping: Command = {
  name: "user",
  description: "Display info about yourself or another user.",
  execute({ channel, mentions, author }) {
    const users = mentions.users.size ? mentions.users.array() : [author]
    const message = users.map((u) => getUserInfo(u)).join("\n\n")
    channel.send(message)
  },
}

export default ping
