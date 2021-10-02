import { addContribution, PlayData } from "../data"
import { ActionResult } from "./types"
import { emptyActionResult, getContributions } from "./utils"

const goldenNumbers = new Set([0, 13, 42, 69, 100])
const silverNumbers = new Set([
  2, 3, 5, 7, 11, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
])
const bronzeNumbers = new Set([25, 50, 75])

const rewards = {
  bronze: 1,
  silver: 2,
  gold: 4,
}

const getReward = (number: number) => {
  const abs = Math.abs(number)
  return goldenNumbers.has(abs)
    ? { reward: rewards.gold, reaction: "🌟" }
    : silverNumbers.has(abs)
    ? { reward: rewards.silver, reaction: "⭐" }
    : bronzeNumbers.has(abs)
    ? { reward: rewards.bronze, reaction: "✨" }
    : null
}

export const rewardSpecialNumber = async (playData: PlayData): Promise<ActionResult> => {
  const { currentRound, countSign } = playData

  const rewardData = getReward(currentRound.count)

  if (!rewardData) {
    return emptyActionResult(playData)
  }

  const { reward, reaction } = rewardData

  // TODO: modify DB and get new playData
  const newPlayData = addContribution(playData, getContributions(countSign, reward))

  return { messages: [], playData: newPlayData, reactions: [reaction] }
}
