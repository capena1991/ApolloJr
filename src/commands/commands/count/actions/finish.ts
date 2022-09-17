import { Dict } from "../../../../type-helpers"
import { archiveCurrentRound, getPreviousRoundsSummary, grantRewards, PlayData } from "../data"
import { ActionResult } from "./types"

const getRewards = (contributions: Dict<{ p: number; n: number }>, positivesWin: boolean) =>
  Object.entries(contributions)
    .filter(([, c]) => c && !c.p !== !c.n && !!c.p === positivesWin)
    .map(([user, c]) => ({ user, reward: (positivesWin ? c?.p : c?.n) || 0 }))

export const tryFinishRound = async (playData: PlayData): Promise<ActionResult> => {
  const { currentRound } = playData

  if (currentRound.count !== 100 && currentRound.count !== -100) {
    return { messages: [], playData, reactions: [] }
  }

  const positivesWin = currentRound.count > 0

  const rewards = getRewards(currentRound.contributions, positivesWin)
  const sortedRewards = rewards.sort(({ reward: r1 }, { reward: r2 }) => r2 - r1)

  const lostRewards = getRewards(currentRound.contributions, !positivesWin)
  const sortedLostRewards = lostRewards.sort(({ reward: r1 }, { reward: r2 }) => r2 - r1)

  let newPlayData = await grantRewards(playData, rewards)
  newPlayData = await archiveCurrentRound(newPlayData)

  const roundsSummary = await getPreviousRoundsSummary()

  const messages = [
    {
      key: "winner" as const,
      params: { winner: positivesWin ? "Positives" : "Negatives" },
      pin: true,
      kind: "info" as const,
    },
    { key: "rewards" as const, params: { rewards: sortedRewards }, kind: "info" as const },
    { key: "rewardsLost" as const, params: { lostRewards: sortedLostRewards }, kind: "info" as const },
    { key: "roundsSummary" as const, params: roundsSummary, kind: "info" as const },
    { key: "newRound" as const, params: { roundNumber: newPlayData.currentRound.roundNumber }, kind: "info" as const },
    { key: "zero" as const, reactions: ["☑"], kind: "info" as const },
  ]

  return { messages, playData: newPlayData, reactions: [] }
}
