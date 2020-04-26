import { Command } from "./types"
import items from "./items.json"
import { createPageableEmbed } from "../utilities/paging"
import { nDrachma } from "../utilities/utils"
import { createConfirm } from "../utilities/confirm"
import { users } from "../data/userData"

const findItem = (search: string) => {
  if (!search) {
    return undefined
  }
  const processedSearch = search.toLowerCase()
  return Object.values(items).find(({ name }) => name.toLowerCase() === processedSearch) // TODO: better, more permissive matching
}

const shop: Command = {
  name: "shop",
  aliases: ["buy"],
  description: "The shop is open for business! Come buy all kinds of stuff.",
  execute: ({ channel, author }, args) => {
    const itemSearch = args.join(" ")
    const item = findItem(itemSearch)

    if (!item) {
      return createPageableEmbed(
        channel,
        {
          title: "Shop",
          description: "Here's the available items",
          fields: Object.values(items).map(({ name, icon, price }) => ({
            name: `${icon} ${name}`,
            value: nDrachma(price),
          })),
        },
        author,
      )
    }

    return createConfirm(
      channel,
      author,
      `If you want to buy **${item.icon} ${item.name} (${nDrachma(item.price)})**, hand in the money.`,
      "💰",
      async () => {
        const user = await users.get(author.id)
        if (user.money < item.price) {
          return channel.send(
            `You only have ${nDrachma(user.money)}. You need ${nDrachma(item.price - user.money)} more to buy that.`,
          )
        }
        const userItems = { ...user.items }
        userItems[item.id] = (userItems[item.id] || 0) + 1
        const newMoney = user.money - item.price
        await users.set(author.id, { ...user, money: newMoney, items: userItems })
        return channel.send(
          `You have bought a **${item.icon} ${item.name} (${nDrachma(item.price)})**.` +
            `You now have ${nDrachma(newMoney)}.`,
        )
      },
    )
  },
}

export default shop
