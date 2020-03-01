import Discord from "discord.js"
import moment from "moment"

import { Command } from "./types"
import { users } from "../data/userData"

const getLastMessageTime = (isAuthor: boolean, lastMessage: Discord.Message) => {
  if (isAuthor) {
    return "right now... duh"
  } else if (!lastMessage) {
    return "¯\\_(ツ)_/¯"
  } else {
    return moment(lastMessage.createdAt).fromNow()
  }
}

const getUserInfo = async (
  { id, username, displayAvatarURL, bot, createdAt, discriminator, lastMessage }: Discord.User,
  isAuthor = false,
) => {
  let embed = new Discord.RichEmbed()
    .setTitle("User Info")
    .setDescription(`**<@${id}>** (${username}#${discriminator})${bot ? " :robot:" : ""}`)
    .setThumbnail(displayAvatarURL)
    .addField("ID", id, true)
    .addField("Created", `${moment(createdAt).format("ll")}\n(${moment(createdAt).fromNow()})`, true)
    .addField("Last message", getLastMessageTime(isAuthor, lastMessage), true)
  const user = await users.get(id)
  if (user.birthday) {
    embed = embed.addField("Birthday :birthday:", moment(user.birthday).format("ll"))
  }
  return embed
}

const ping: Command = {
  name: "user",
  description: "I'll show you info about yourself or another user. ~~I know you like snooping.~~ :wink:",
  execute: ({ channel, mentions, author }) => {
    const users = mentions.users.size ? mentions.users.array() : [author]
    users.forEach(async (u) => {
      channel.send(await getUserInfo(u, u.id === author.id))
    })
  },
}

export default ping
