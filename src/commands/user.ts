import Discord from "discord.js"
import moment from "moment"

import { positiveRole, negativeRole } from "../config.json"
import { Command } from "./types"
import { users } from "../data/userData"
import items from "../data/items.json"
import { Dict, ObjectValues } from "../type-helpers"

const getLastMessageTime = (isAuthor: boolean, lastMessage: Discord.Message | null) => {
  if (isAuthor) {
    return "right now... duh"
  } else if (!lastMessage) {
    return "¯\\_(ツ)_/¯"
  } else {
    return moment(lastMessage.createdAt).fromNow()
  }
}

const showDateWithFromNow = (date?: Date | null) => {
  if (!date) {
    return "¯\\_(ツ)_/¯"
  }
  const momentDate = moment(date)
  return `${momentDate.format("ll")}\n(${momentDate.fromNow()})`
}

const getUserInfo = async (user: Discord.User, guildMember?: Discord.GuildMember | null, isAuthor = false) => {
  const { id, username, bot, createdAt, discriminator, lastMessage } = user
  const { displayHexColor, joinedAt, roles } = guildMember ?? {}
  const { birthday, money, items: userItems } = await users.get(id)
  let embed = new Discord.MessageEmbed()
    .setTitle("User Info")
    .setDescription(`**<@${id}>** (${username}#${discriminator})${bot ? " :robot:" : ""}`)
    .setThumbnail(user.displayAvatarURL({ size: 4096, dynamic: true }))
    .addField("ID", id)
    .addField("Created", showDateWithFromNow(createdAt), true)
    .addField("Joined server", showDateWithFromNow(joinedAt), true)
    .addField("Last message", getLastMessageTime(isAuthor, lastMessage), true)

  if (displayHexColor) {
    embed = embed.setColor(displayHexColor)
  }

  if (birthday) {
    embed = embed.addField("Birthday :birthday:", moment(birthday).format("ll"), true)
  }

  const team = roles?.cache.has(positiveRole)
    ? "Positives"
    : roles?.cache.has(negativeRole)
    ? "Negatives"
    : "Free Agent"
  embed = embed.addField("Current team", team, true).addField("Money", money, true)

  const typedItems = items as Dict<ObjectValues<typeof items>>
  const allUserItems = Object.entries(userItems || {})
  const ownedItems = allUserItems
    .slice(0, 20)
    .map(([id, amount]) => `${typedItems[id]?.icon}${amount && amount > 1 ? `x${amount}` : ""}`)
    .join("  ")
  embed = embed.addField("Owned items", ownedItems + (allUserItems.length > 20 ? "..." : ""), false)

  return embed
}

const ping: Command = {
  name: "user",
  description: "I'll show you info about yourself or another user. ~~I know you like snooping.~~ :wink:",
  execute: ({ channel, mentions, author, guild }) => {
    const users = mentions.users.size ? mentions.users.array() : [author]
    users.forEach(async (u) => {
      channel.send(await getUserInfo(u, guild?.member(u), u.id === author.id))
    })
  },
}

export default ping
