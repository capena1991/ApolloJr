import { Command } from "./types"

import { getCurrent, setCurrent, archiveCurrent } from "../data/countingData"

const count: Command = {
  name: "count",
  description: "The game of count. Two teams try to get teh count to either 100 or -100",
  execute: async (message, args) => {
    const { channel } = message

    const number = parseInt(args[0])
    if (!Number.isFinite(number)) {
      return message.delete()
    }
    const { count, ...rest } = await getCurrent()
    const diff = number - count
    if (diff !== 1 && diff !== -1) {
      return message.delete()
    }
    message.react("☑")
    const newCount = count + diff
    await setCurrent({ count: newCount, ...rest })
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
