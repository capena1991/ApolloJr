import Discord from "discord.js"

import { createReactableEmbed } from "./reactions"

export const createPageableEmbed = async (
  channel: Discord.TextBasedChannels,
  getPage: (page: number) => Discord.MessageEmbed,
  nPages: number,
  author?: Discord.User,
) => {
  let page = 0

  const pageJump = (message: Discord.Message, jump: number) => {
    page = Math.min(Math.max(page + jump, 0), nPages - 1)
    message.edit({ embeds: [getPage(page)] })
  }

  const reactions = {
    "⬅": (message: Discord.Message) => pageJump(message, -1),
    "➡": (message: Discord.Message) => pageJump(message, 1),
  }

  createReactableEmbed(channel, getPage(page), reactions, { activeTime: 300000, author })
}

export const createListPageableEmbed = (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  embeds: Discord.MessageEmbed[],
  author?: Discord.User,
) => createPageableEmbed(channel, (page) => embeds[page], embeds.length, author)

export const createFieldsPageableEmbed = (
  channel: Discord.TextBasedChannels,
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
  channel: Discord.TextBasedChannels,
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
