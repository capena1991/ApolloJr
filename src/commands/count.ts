import Discord from "discord.js"
import moment from "moment"

import { Command } from "./types"
import { Dict } from "../type-helpers"
import { positiveRole, negativeRole } from "../config.json"
import { getCurrent, setCurrent, archiveCurrent } from "../data/countingData"
import { users } from "../data/userData"

const goldenNumbers = new Set([0, 42, -42, 69, -69, 100, -100])
const silverNumbers = new Set([25, -25, 50, -50, 75, -75])

const getRequiredRole = (diff: 1 | -1) => (diff === 1 ? positiveRole : negativeRole)

const getContributionValue = (count: number) => (goldenNumbers.has(count) ? 5 : silverNumbers.has(count) ? 3 : 1)

const addToContribution = ({ p, n }: { p: number; n: number }, diff: 1 | -1, count: number) => ({
  p: p + (diff === 1 ? getContributionValue(count) : 0),
  n: n + (diff === -1 ? getContributionValue(count) : 0),
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

const react = async (message: Discord.Message, count: number) => {
  await message.react("☑")
  if (goldenNumbers.has(count)) {
    message.react("🌟")
  }
  if (silverNumbers.has(count)) {
    message.react("🏅")
  }
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

    const newCount = count + diff
    react(message, newCount)
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
      contributions: { ...contributions, [author.id]: addToContribution(userContrib, diff, newCount) },
      ...rest,
    }
    await setCurrent(newCurrent)

    if (newCount !== 100 && newCount !== -100) {
      return
    }

    const positivesWin = newCount > 0
    const archiveProm = archiveCurrent()
    let winnerMsg = await channel.send(`${positivesWin ? "Positives" : "Negatives"} win this round! :tada:`)
    if (Array.isArray(winnerMsg)) {
      winnerMsg = winnerMsg[0]
    }
    if (winnerMsg.pinnable) {
      winnerMsg.pin()
    }
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
