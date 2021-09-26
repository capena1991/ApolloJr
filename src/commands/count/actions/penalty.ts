import { addContribution, PlayData, setCount } from "../data"
import { ActionResult } from "./types"
import { clampExtra, emptyActionResult, getContributions, withParam } from "./utils"

const timePenalty = [
  { range: [10, 300], penalty: -1, text: "⏱ counting before your time" },
  { range: [0, 10], penalty: -2, text: "⏱❗ less than 10 seconds remaining, 😬 so close!" },
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

const applyPenalty = async (playData: PlayData, remainingTime: number): Promise<ActionResult> => {
  const { currentRound, countSign, userId } = playData

  const penaltyData = getPenalty(remainingTime, countSign)

  if (!penaltyData) {
    return emptyActionResult(playData)
  }

  const { penalty, text } = penaltyData
  const clampedPenalty = clampExtra(penalty, playData.currentRound.count)

  let newPlayData = setCount(playData, playData.currentRound.count + clampedPenalty)
  newPlayData = addContribution(newPlayData, getContributions(countSign, clampedPenalty))

  const numbers = [...Array(Math.abs(clampedPenalty)).keys()].map((i) => currentRound.count - (i + 1) * countSign)
  const messages = numbers.map((count) => ({
    key: "penalty" as const,
    params: { userId, count, penaltyText: text },
    reactions: ["⚠"],
    kind: "info" as const,
  }))
  return { messages, playData: newPlayData, reactions: [] }
}

export const getApplyPenalty = (remainingTime: number) => withParam(applyPenalty, remainingTime)
