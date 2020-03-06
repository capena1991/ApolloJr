import { Command } from "./types"
import moment from "moment"

import { getCurrent, setCurrent, archiveCurrent } from "../data/countingData"
import { users } from "../data/userData"

const count: Command = {
  name: "count",
  description: "The game of count. Two teams try to get teh count to either 100 or -100",
  execute: async (message, args) => {
    const { channel, author } = message

    const reject = (reason?: string) => {
      message.delete()
      if (reason) {
        author.send(reason)
      }
    }

    const number = parseInt(args[0])
    if (!Number.isFinite(number)) {
      return reject(
        "We mean business in the counting channel. Valid numbers. Yours was not.\n" +
          "Leave the idle chit chat for another channel.",
      )
    }
    const { count, last, ...rest } = await getCurrent()
    const diff = number - count
    if (diff !== 1 && diff !== -1) {
      return reject(
        `Try again, pal. Last count was **${count}**. :rolling_eyes:\n` +
          "If I've said this to you too many times, maybe you should consider going back to elementary school. :wink:",
      )
    }

    if (last.user === author.id) {
      return reject("Nice try :smirk:, but you gotta let others play. Can't count twice in a row.")
    }

    const user = await users.get(author.id)
    const now = moment()
    const lastCounts = user.counting.lastCounts
    if (lastCounts.length >= 5) {
      const oldest = moment(lastCounts[4].datetime)
      const limit = oldest.add(5, "minutes")
      if (limit.isAfter(now)) {
        return reject(
          "Not so fast! You've tried to count too many times recently. You got to give the others a chance.\n" +
            `Try again **${limit.fromNow()}**.`,
        )
      }
    }

    message.react("☑")
    const newCount = count + diff
    users.set(author.id, {
      ...user,
      counting: {
        ...user.counting,
        lastCounts: [{ datetime: now.toISOString() }, ...lastCounts].slice(0, 5),
      },
    })
    await setCurrent({ count: newCount, last: { user: author.id, datetime: moment().toISOString() }, ...rest })

    if (newCount !== 100 && newCount !== -100) {
      return
    }

    const archiveProm = archiveCurrent()
    await channel.send(`${newCount > 0 ? "Positives" : "Negatives"} win this round! :tada:`)
    const newRoundNumber = await archiveProm
    await channel.send(`Round ${newRoundNumber} starts now.`)
    let zeroMsg = await channel.send("0")
    if (Array.isArray(zeroMsg)) {
      zeroMsg = zeroMsg[0]
    }
    return zeroMsg.react("☑")
  },
}

export default count
