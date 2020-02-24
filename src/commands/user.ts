import Discord from "discord.js"
import moment from "moment"

import { Command } from "./types"

const getLastMessageTime = (isAuthor: boolean, lastMessage: Discord.Message) => {
  if (isAuthor) {
    return "right now... duh"
  } else if (!lastMessage) {
    return "¯\\_(ツ)_/¯"
  } else {
    return moment(lastMessage.createdAt).fromNow()
  }
}

const getUserInfo = (
  { id, username, displayAvatarURL, bot, createdAt, discriminator, lastMessage }: Discord.User,
  isAuthor = false,
) =>
  new Discord.RichEmbed()
    .setTitle("User Info")
    .setDescription(`**<@${id}>** (${username}#${discriminator})${bot ? " :robot:" : ""}`)
    .setThumbnail(displayAvatarURL)
    .addField("ID", id, true)
    .addField("Created", `${moment(createdAt).format("ll")}\n(${moment(createdAt).fromNow()})`, true)
    .addField("Last message", getLastMessageTime(isAuthor, lastMessage), true)

const ping: Command = {
  name: "user",
  description: "Display info about yourself or another user.",
  execute({ channel, mentions, author }) {
    const users = mentions.users.size ? mentions.users.array() : [author]
    users.forEach((u) => {
      channel.send(getUserInfo(u, u.id === author.id))
    })
  },
}

export default ping
