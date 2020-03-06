import { Command } from "./types"
import moment from "moment"

import { getCurrent, setCurrent, archiveCurrent } from "../data/countingData"

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

    message.react("☑")
    const newCount = count + diff
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
