import Discord from "discord.js"
import { SendableChannel } from "./discord"

import { createReactableEmbed } from "./reactions"

export const createPageableEmbed = async (
  channel: SendableChannel,
  getPage: (page: number) => Discord.EmbedBuilder,
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
  channel: SendableChannel,
  embeds: Discord.EmbedBuilder[],
  author?: Discord.User,
) => createPageableEmbed(channel, (page) => embeds[page], embeds.length, author)

export const createFieldsPageableEmbed = (
  channel: SendableChannel,
  baseEmbed: Discord.EmbedBuilder,
  fields: Discord.EmbedField[][],
  author?: Discord.User,
  setFooter = true,
) => {
  const getPage = (page: number) => {
    baseEmbed.setFields(fields[page])
    if (setFooter) {
      baseEmbed.setFooter({ text: `${page + 1}/${fields.length}` })
    }
    return baseEmbed
  }

  return createPageableEmbed(channel, getPage, fields.length, author)
}

export const createSimplePageableEmbed = (
  channel: SendableChannel,
  baseEmbed: Discord.EmbedBuilder,
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
