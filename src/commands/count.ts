import { Command } from "./types"
import moment from "moment"

import { Dict } from "../type-helpers"
import { getCurrent, setCurrent, archiveCurrent } from "../data/countingData"
import { users } from "../data/userData"

const positiveRole = "685703701209546908"
const negativeRole = "685703765785182347"
const getRequiredRole = (diff: 1 | -1) => (diff === 1 ? positiveRole : negativeRole)

const addToContribution = ({ p, n }: { p: number; n: number }, diff: 1 | -1) => ({
  p: p + (diff === 1 ? 1 : 0),
  n: n + (diff === -1 ? 1 : 0),
})

const getRewards = (contributions: Dict<{ p: number; n: number }>, positivesWin: boolean) =>
  Object.entries(contributions)
    .filter(([_, c]) => c && !c.p !== !c.n && !!c.p === positivesWin)
    .map(([user, c]) => ({ user, reward: (positivesWin ? c?.p : c?.n) || 0 }))

const grantRewards = (rewards: { user: string; reward: number }[]) => {
  rewards.forEach(async ({ user, reward }) => {
    const { money, ...rest } = await users.get(user)
    users.set(user, { money: money + reward, ...rest })
  })
}

const getRemainingTime = (time: moment.Moment, now: moment.Moment) => {
  const diff = time.diff(now, "seconds")
  if (diff > 44) {
    return time.from(now)
  }
  return `in ${diff} seconds`
}

const count: Command = {
  name: "count",
  description: "The game of count. Two teams try to get teh count to either 100 or -100",
  execute: async (message, args) => {
    const { channel, author, member } = message

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
    const { count, last, contributions, ...rest } = await getCurrent()
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
          "Not so fast! That's too many times you've tried recently. " +
            "You gotta give the others a chance; healthy competition and all that\n" +
            `Try again **${getRemainingTime(limit, now)}**.`,
        )
      }
    }

    if (!member.roles.has(getRequiredRole(diff))) {
      return reject("You're not on the right team. Pick your side first.")
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
    const userContrib = contributions[author.id] || { p: 0, n: 0 }
    const newCurrent = {
      count: newCount,
      last: { user: author.id, datetime: moment().toISOString() },
      contributions: { ...contributions, [author.id]: addToContribution(userContrib, diff) },
      ...rest,
    }
    await setCurrent(newCurrent)

    if (newCount !== 100 && newCount !== -100) {
      return
    }

    const positivesWin = newCount > 0
    const archiveProm = archiveCurrent()
    await channel.send(`${positivesWin ? "Positives" : "Negatives"} win this round! :tada:`)
    const rewards = getRewards(newCurrent.contributions, positivesWin)
    await channel.send(
      `**Rewards:**\n${rewards.map(({ user, reward }) => `<@${user}>: ${reward} drachmae`).join("\n")}`,
    )
    grantRewards(rewards)
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
