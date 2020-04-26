import { Command } from "./types"
import items from "../data/items.json"
import { users } from "../data/userData"
import { Dict } from "../type-helpers"
import { createPageableEmbed } from "../utilities/paging"

type ItemKeys = keyof typeof items
type Item = typeof items[ItemKeys]

const inventory: Command = {
  name: "inventory",
  aliases: ["inv", "items"],
  description:
    "Whether you're a hoarder or just have that one item you bough once, you can check your possesions with this.",
  execute: async ({ channel, author }) => {
    const typedItems = items as Dict<Item>
    const user = await users.get(author.id)
    const ownedItems = Object.entries(user.items || {}).map(([id, amount]) => ({ item: typedItems[id], amount }))
    createPageableEmbed(
      channel,
      {
        title: "Inventory",
        description: "These are the items you own.",
        fields: ownedItems.map(({ item, amount }) => ({
          name: `${item?.icon} ${item?.name}`,
          value: `**${amount}**`,
          inline: true,
        })),
      },
      author,
    )
  },
}

export default inventory
