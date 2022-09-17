import { addContribution, PlayData, setCount } from "../data"
import { ActionResult } from "./types"
import { clampExtra, emptyActionResult, getContributions, withParam } from "./utils"

const timeBonus = [
  { range: [15, 30], bonus: 1, text: "⏱ within 30 seconds" },
  { range: [10, 15], bonus: 2, text: "⏱ within 15 seconds" },
  { range: [5, 10], bonus: 3, text: "⏱ within 10 seconds" },
  { range: [1, 5], bonus: 4, text: "⏱ within 5 seconds" },
  { range: [0, 1], bonus: 5, text: "⏱🎯 right on the spot!!!" },
]

const getBonus = (remainingTime: number, sign: number) => {
  const extraTime = -remainingTime
  if (extraTime < 0) {
    return null
  }
  const bonusData = timeBonus.find(({ range: [min, max] }) => min <= extraTime && extraTime < max)
  if (!bonusData) {
    return null
  }
  return { bonus: bonusData.bonus * sign, text: bonusData.text }
}

const applyBonus = async (playData: PlayData, remainingTime: number): Promise<ActionResult> => {
  const { currentRound, countSign, userId } = playData

  const bonusData = getBonus(remainingTime, countSign)

  if (!bonusData) {
    return emptyActionResult(playData)
  }

  const { bonus, text } = bonusData
  const clampedBonus = clampExtra(bonus, currentRound.count)

  let newPlayData = setCount(playData, currentRound.count + clampedBonus)
  newPlayData = addContribution(newPlayData, getContributions(countSign, Math.abs(clampedBonus)))

  const numbers = [...Array(Math.abs(clampedBonus)).keys()].map((i) => currentRound.count + (i + 1) * countSign)
  const messages = numbers.map((count) => ({
    key: "bonus" as const,
    params: { userId, count, bonusText: text },
    reactions: ["✅"],
    kind: "info" as const,
  }))
  return { messages, playData: newPlayData, reactions: [] }
}

export const getApplyBonus = (remainingTime: number) => withParam(applyBonus, remainingTime)
