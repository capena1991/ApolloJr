import { Command } from "./types"

import { getCurrent, setCurrent } from "../data/countingData"

const count: Command = {
  name: "count",
  description: "The game of count. Two teams try to get teh count to either 100 or -100",
  execute: async (message, args) => {
    const number = parseInt(args[0])
    if (!Number.isFinite(number)) {
      return message.delete()
    }
    const { count, ...rest } = await getCurrent()
    const diff = number - count
    if (diff !== 1 && diff !== -1) {
      return message.delete()
    }
    setCurrent({ count: count + diff, ...rest })
    return message.react("✅")
  },
}

export default count
