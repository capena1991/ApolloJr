import Discord from "discord.js"
import { DateTime } from "luxon"

// import { Dict, ObjectValues } from "../type-helpers"
import { positiveRole, negativeRole } from "../../utilities/config"
import { parseDate } from "../../utilities/date-helpers"
// import items from "../data/items.json"
import { users } from "../../data/userData"
import { Command } from "../types"

const showDateWithFromNow = (date?: Date | null) => {
  if (!date) {
    return "¯\\_(ツ)_/¯"
  }
  const dt = DateTime.fromJSDate(date)
  return `${dt.toLocaleString(DateTime.DATE_MED)}\n(${dt.toRelative()})`
}

const getUserInfo = async (user: Discord.User, guildMember?: Discord.GuildMember | null) => {
  const { id, username, bot, createdAt, discriminator } = user
  const { displayHexColor, joinedAt, roles } = guildMember ?? {}
  const { birthday, money } = await users.get(id)
  let embed = new Discord.EmbedBuilder()
    .setTitle("User Info")
    .setDescription(`**<@${id}>** (${username}#${discriminator})${bot ? " :robot:" : ""}`)
    .setThumbnail(user.displayAvatarURL({ size: 4096, forceStatic: false }))
    .addFields(
      { name: "ID", value: id },
      { name: "Created", value: showDateWithFromNow(createdAt), inline: true },
      { name: "Joined server", value: showDateWithFromNow(joinedAt), inline: true },
    )

  if (displayHexColor) {
    embed = embed.setColor(displayHexColor)
  }

  if (birthday) {
    embed = embed.addFields({
      name: "Birthday :birthday:",
      value: parseDate(birthday).toLocaleString(DateTime.DATE_MED),
      inline: true,
    })
  }

  const team = roles?.cache.has(positiveRole)
    ? "Positives"
    : roles?.cache.has(negativeRole)
    ? "Negatives"
    : "Free Agent"
  embed = embed.addFields(
    { name: "Current team", value: team, inline: true },
    { name: "Money", value: money.toString(), inline: true },
  )

  // const typedItems = items as Dict<ObjectValues<typeof items>>
  // const allUserItems = Object.entries(userItems || {})
  // const ownedItems = allUserItems
  //   .slice(0, 20)
  //   .map(([id, amount]) => `${typedItems[id]?.icon}${amount && amount > 1 ? `x${amount}` : ""}`)
  //   .join("  ")
  // if (allUserItems.length) {
  //   embed = embed.addField("Owned items", ownedItems + (allUserItems.length > 20 ? "..." : ""), false)
  // }

  return embed
}

const ping: Command = {
  name: "user",
  description: "I'll show you info about yourself or another user. ~~I know you like snooping.~~ :wink:",
  options: [
    {
      name: "user",
      description: "The user that you want to know about.",
      type: Discord.ApplicationCommandOptionType.User,
    },
  ],
  runOnMessage: ({ channel, mentions, author, guild }) => {
    const users = mentions.users.size ? [...mentions.users.values()] : [author]
    users.forEach(async (u) => {
      const embed = await getUserInfo(u, guild?.members.cache.get(u.id))
      channel.send({ embeds: [embed] })
    })
  },
  runOnInteraction: async (interaction) => {
    const { options, user, guild } = interaction
    const wantedUser = options.getUser("user") ?? user
    const embed = await getUserInfo(wantedUser, guild?.members.cache.get(wantedUser.id))
    interaction.reply({ embeds: [embed] })
  },
}

export default ping
