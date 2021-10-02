import Discord from "discord.js"
import { DateTime } from "luxon"

import { parseDate } from "../../../utilities/date-helpers"
import { executeActions } from "./actions"
import { getApplyBonus } from "./actions/bonus"
import { getCount as getCountAction } from "./actions/count"
import { tryFinishRound } from "./actions/finish"
import { getApplyPenalty } from "./actions/penalty"
import { rewardSpecialNumber } from "./actions/specialNumbers"
import { getPlayData, PlayData, savePlayData } from "./data"
import { getRemainingTimeText } from "./messages"
import { PlayResult } from "./types"
import { validatePlay } from "./validate"

const getActiveCharges = (now: DateTime, lastCounts: Array<{ datetime: string } | undefined>) => {
  const _5minAgo = now.minus({ minutes: 5 })
  const base = 5 - lastCounts.length
  return base + lastCounts.filter((countEntry) => countEntry && parseDate(countEntry.datetime) < _5minAgo).length
}

const rateLimit = (playTime: DateTime, { user }: PlayData) => {
  const lastCounts = user.counting.lastCounts
  const activeCharges = getActiveCharges(playTime, lastCounts)

  if (lastCounts.length < 5) {
    return { activeCharges, remainingTime: +Infinity }
  }

  const oldest = parseDate(lastCounts[4]?.datetime ?? "")
  const limit = oldest.plus({ minutes: 5 })
  const remainingTime = limit.diff(playTime).as("seconds")

  return { activeCharges, remainingTime }
}

export const play = async (member: Discord.GuildMember, number: number): Promise<PlayResult> => {
  const playTime = DateTime.utc()
  const playData = await getPlayData(member.user.id, number)

  const [valid, result] = validatePlay(member, number, playData)
  if (!valid) {
    return result ?? { messages: [] }
  }

  const { activeCharges, remainingTime } = rateLimit(playTime, playData)
  if (!activeCharges) {
    const actions = [getApplyPenalty(remainingTime), tryFinishRound]
    const { messages, playData: finalPlayData } = await executeActions(actions, playData)
    await savePlayData(finalPlayData)

    return {
      originalMessage: { reject: true },
      messages: [
        { key: "rateLimit", params: { remaining: getRemainingTimeText(remainingTime) }, kind: "validation" },
        ...messages,
      ],
    }
  }

  const actions = [
    getCountAction({ playTime, activeCharges }),
    rewardSpecialNumber,
    getApplyBonus(remainingTime),
    tryFinishRound,
  ]
  const { messages, reactions, playData: finalPlayData } = await executeActions(actions, playData)
  await savePlayData(finalPlayData)

  return { originalMessage: { reactions }, messages }
}
