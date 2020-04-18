import Discord from "discord.js"

import { botUserId } from "../config.json"
import { Dict } from "../type-helpers"

type PageableEmbed = {
  title?: string
  description?: string
  fields: { name?: string; value?: string; inline?: boolean }[]
}

const getPage = ({ title, description, fields }: PageableEmbed, page = 0, pageSize = 24) =>
  fields.slice(pageSize * page, pageSize * (page + 1)).reduce(
    (e, { name, value, inline }) => e.addField(name ?? "", value ?? "", inline),
    new Discord.RichEmbed()
      .setTitle(title ?? "")
      .setDescription(description ?? "")
      .setFooter(`${page + 1}/${Math.ceil(fields.length / pageSize)}`),
  )

const pageIncDict: Dict<number> = { "➡": 1, "⬅": -1 }

export const createPageableEmbed = async (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
  embedData: PageableEmbed,
  author?: Discord.User,
  pageSize = 24,
) => {
  const lastPage = Math.ceil(embedData.fields.length / pageSize) - 1
  let page = 0

  const res = await channel.send(getPage(embedData, page, pageSize))
  const message = Array.isArray(res) ? res[0] : res

  await message.react("⬅")
  await message.react("➡")

  const collector = message.createReactionCollector(
    (reaction, user) => ["⬅", "➡"].includes(reaction.emoji.name) && (!author || user.id === author.id),
    { time: 300000 },
  )
  collector.on("collect", (reaction) => {
    reaction.users.filter((u) => u.id !== botUserId).forEach((u) => reaction.remove(u))
    page = Math.min(Math.max(page + (pageIncDict[reaction.emoji.name] ?? 0), 0), lastPage)
    message.edit(getPage(embedData, page, pageSize))
  })
  collector.on("end", () => message.clearReactions())
}
