import { Command } from "./types"

import { users } from "../data/userData"
import { pluralize } from "../utilities/utils"

const nDrachma = (n: number) => `${n} ${pluralize(n, "drachma", "drachmae")}`

const transfer: Command = {
  name: "transfer",
  aliases: ["give"],
  description: "You can give your hard-earned money to someone else... after I collect a small fee. :wink:",
  execute: async ({ channel, author, mentions }, args) => {
    const sender = await users.get(author.id)

    if (mentions.users.has(author.id)) {
      return channel.send(
        "Are you trying to transfer money to yourself? I just won't do that because it makes no sense.",
      )
    }

    const receivers = await Promise.all(mentions.users.map(async ({ id }) => ({ id, data: await users.get(id) })))
    if (!receivers.length) {
      return channel.send(
        "I understand it's not easy to give away your money, but if you're gonna do it I need to know to whom.",
      )
    }

    const amountStr = args.find((a) => a.match(/^\d+$/))
    if (!amountStr) {
      return channel.send("Say that again. I have no idea how much you want to transfer.")
    }

    const amount = parseInt(amountStr)
    if (!Number.isFinite(amount)) {
      return channel.send("That amount is a little suspicious. I'm not sure how much that is.")
    }

    if (amount < 2) {
      return channel.send(
        "You need to transfer at least **2 drachmae**. Trust me, I'm doing you a favor; taxes are wild.",
      )
    }

    const tax = Math.ceil(amount / 20)
    const totalAmount = amount * receivers.length
    if (totalAmount > sender.money) {
      return channel.send(
        `You're trying to transfer a total amount of **${nDrachma(totalAmount)}** ` +
          `but you only have **${nDrachma(sender.money)}**. Simple Math will tell you it's not possible.`,
      )
    }

    users.set(author.id, { ...sender, money: sender.money - totalAmount })
    receivers.forEach(({ id, data }) => users.set(id, { ...data, money: data.money + amount - tax }))

    const receiptMessage = receivers.map(({ id }) => `<@${id}> received **${nDrachma(amount - tax)}.**`).join("\n")
    return channel.send(
      `You transfered a total of **${nDrachma(totalAmount)}**.\n` +
        `${receiptMessage}\n` +
        `**${nDrachma(tax * receivers.length)}** collected as taxes.`,
    )
  },
}

export default transfer
