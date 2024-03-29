import Discord from "discord.js"

import items from "../../data/items.json"
import { users } from "../../data/userData"
import { Dict, ObjectValues } from "../../type-helpers"
import { createSimplePageableEmbed } from "../../utilities/paging"
import { Command } from "../types"

const inventory: Command = {
  name: "inventory",
  aliases: ["inv", "items"],
  description:
    "Whether you're a hoarder or just have that one item you bought once, you can check your possesions with this.",
  runOnMessage: async ({ channel, author }) => {
    const typedItems = items as Dict<ObjectValues<typeof items>>
    const user = await users.get(author.id)
    const ownedItems = Object.entries(user.items || {}).map(([id, amount]) => ({ item: typedItems[id], amount }))
    createSimplePageableEmbed(
      channel,
      new Discord.EmbedBuilder().setTitle("Inventory").setDescription("These are the items you own."),
      ownedItems.map(({ item, amount }) => ({
        name: `${item?.icon} ${item?.name}`,
        value: `**${amount}**`,
        inline: true,
      })),
      author,
    )
  },
}

export default inventory
