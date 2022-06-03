import { DateTime } from "luxon"
import { addContribution, addCountEntries, PlayData, setCount } from "../data"
import { ActionResult } from "./types"
import { clampExtra, emptyActionResult, getContributions, withParam } from "./utils"

const timePenalty = [
  { range: [15, 300], penalty: -1, text: "⏱ counting before your time" },
  { range: [5, 15], penalty: -2, text: "⏱ less than 15 seconds remaining" },
  { range: [1, 5], penalty: -3, text: "⏱❗ less than 5 seconds remaining!" },
  { range: [0, 1], penalty: -4, text: "⏱‼ less than 1 seconds remaining, 😬 so close!" },
]

const getPenalty = (remainingTime: number, sign: number) => {
  if (remainingTime < 0) {
    return null
  }
  const penaltyData = timePenalty.find(({ range: [min, max] }) => min <= remainingTime && remainingTime < max)
  if (!penaltyData) {
    return null
  }
  return { penalty: penaltyData.penalty * sign, text: penaltyData.text }
}

const applyPenalty = async (
  playData: PlayData,
  { remainingTime, playTime }: { remainingTime: number; playTime: DateTime },
): Promise<ActionResult> => {
  const { currentRound, countSign, userId } = playData

  const penaltyData = getPenalty(remainingTime, countSign)

  if (!penaltyData) {
    return emptyActionResult(playData)
  }

  const { penalty, text } = penaltyData
  const clampedPenalty = clampExtra(penalty, playData.currentRound.count)

  let newPlayData = setCount(playData, playData.currentRound.count + clampedPenalty)
  newPlayData = addContribution(newPlayData, getContributions(countSign, clampedPenalty))
  newPlayData = addCountEntries(newPlayData, playTime, { addRoundCountEntry: true, addUserCountEntry: false })

  const numbers = [...Array(Math.abs(clampedPenalty)).keys()].map((i) => currentRound.count - (i + 1) * countSign)
  const messages = numbers.map((count) => ({
    key: "penalty" as const,
    params: { userId, count, penaltyText: text },
    reactions: ["⚠"],
    kind: "info" as const,
  }))
  return { messages, playData: newPlayData, reactions: [] }
}

export const getApplyPenalty = (remainingTime: number, playTime: DateTime) =>
  withParam(applyPenalty, { remainingTime, playTime })
