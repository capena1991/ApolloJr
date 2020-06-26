import Discord from "discord.js"

import { Dict } from "../type-helpers"

const pageIncDict: Dict<number> = { "➡": 1, "⬅": -1 }

export const createPageableEmbed = async (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  getPage: (page: number) => Discord.MessageEmbed,
  nPages: number,
  author?: Discord.User,
) => {
  let page = 0

  const message = await channel.send(getPage(page))

  await message.react("⬅")
  await message.react("➡")

  const collector = message.createReactionCollector(
    (reaction, user) => !user.bot && ["⬅", "➡"].includes(reaction.emoji.name) && (!author || user.id === author.id),
    { time: 300000 },
  )
  collector.on("collect", (reaction, user) => {
    reaction.users.remove(user)
    page = Math.min(Math.max(page + (pageIncDict[reaction.emoji.name] ?? 0), 0), nPages - 1)
    message.edit(getPage(page))
  })
  collector.on("end", () => message.reactions.removeAll())
}

export const createListPageableEmbed = (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  embeds: Discord.MessageEmbed[],
  author?: Discord.User,
) => createPageableEmbed(channel, (page) => embeds[page], embeds.length, author)

export const createFieldsPageableEmbed = (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  baseEmbed: Discord.MessageEmbed,
  fields: Discord.EmbedField[][],
  author?: Discord.User,
  setFooter = true,
) => {
  const getPage = (page: number) => {
    baseEmbed.fields = fields[page]
    if (setFooter) {
      baseEmbed.setFooter(`${page + 1}/${fields.length}`)
    }
    return baseEmbed
  }

  return createPageableEmbed(channel, getPage, fields.length, author)
}

export const createSimplePageableEmbed = (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  baseEmbed: Discord.MessageEmbed,
  fields: Discord.EmbedField[],
  author?: Discord.User,
  pageSize = 24,
  setFooter = true,
) => {
  const fieldsPerPage = Array.from({ length: Math.ceil(fields.length / pageSize) }, (_, i) =>
    fields.slice(i * pageSize, (i + 1) * pageSize),
  )
  return createFieldsPageableEmbed(channel, baseEmbed, fieldsPerPage, author, setFooter)
}
