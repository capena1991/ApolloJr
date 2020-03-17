import Discord from "discord.js"
import moment from "moment"

import { positiveRole, negativeRole } from "../config.json"
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

const showDateWithFromNow = (date: Date) => {
  const momentDate = moment(date)
  return `${momentDate.format("ll")}\n(${momentDate.fromNow()})`
}

const getUserInfo = async (
  { id, username, displayAvatarURL, bot, createdAt, discriminator, lastMessage }: Discord.User,
  { displayHexColor, joinedAt, roles }: Discord.GuildMember,
  isAuthor = false,
) => {
  const { birthday, money } = await users.get(id)
  let embed = new Discord.RichEmbed()
    .setTitle("User Info")
    .setDescription(`**<@${id}>** (${username}#${discriminator})${bot ? " :robot:" : ""}`)
    .setThumbnail(displayAvatarURL)
    .setColor(displayHexColor)
    .addField("ID", id)
    .addField("Created", showDateWithFromNow(createdAt), true)
    .addField("Joined server", showDateWithFromNow(joinedAt), true)
    .addField("Last message", getLastMessageTime(isAuthor, lastMessage), true)
  if (birthday) {
    embed = embed.addField("Birthday :birthday:", moment(birthday).format("ll"), true)
  }
  const team = roles.has(positiveRole) ? "Positives" : roles.has(negativeRole) ? "Negatives" : "Free Agent"
  return embed.addField("Current team", team, true).addField("Money", money, true)
}

const ping: Command = {
  name: "user",
  description: "I'll show you info about yourself or another user. ~~I know you like snooping.~~ :wink:",
  execute: ({ channel, mentions, author, guild }) => {
    const users = mentions.users.size ? mentions.users.array() : [author]
    users.forEach(async (u) => {
      channel.send(await getUserInfo(u, guild.member(u), u.id === author.id))
    })
  },
}

export default ping
