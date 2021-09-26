import { DateTime } from "luxon"

import { parseDate } from "../../../utilities/date-helpers"
import { addContribution, addCountEntries, PlayData, setCount } from "../data"
import { PlayMessageResult } from "../types"
import { ActionResult } from "./types"
import { getContributions, withParam } from "./utils"

const getChargesReaction = (charges: number) => ["🅾", "1️⃣", "2️⃣", "3️⃣", "4️⃣"][charges]

const getRemainingTime = (time: DateTime, base: DateTime) => {
  const diff = time.diff(base).as("seconds")
  if (diff > 59) {
    return time.toRelative({ base }) ?? ""
  }
  return `in ${diff} seconds`
}

const count = async (
  playData: PlayData,
  { playTime, activeCharges }: { playTime: DateTime; activeCharges: number },
): Promise<ActionResult> => {
  const { countSign, currentRound, user, userId } = playData

  let newPlayData = addCountEntries(playData, playTime)
  newPlayData = setCount(newPlayData, currentRound.count + countSign)
  newPlayData = addContribution(newPlayData, getContributions(countSign, 1))

  let messages: PlayMessageResult[] = []
  if (activeCharges === 1) {
    const newOldest = parseDate(user.counting.lastCounts[3].datetime)
    const limit = newOldest.plus({ minutes: 5 })
    messages = [{ key: "nextCount", params: { inTime: getRemainingTime(limit, playTime), userId }, kind: "info" }]
  }

  return { messages, playData: newPlayData, reactions: [getChargesReaction(activeCharges - 1)] }
}

export const getCount = ({ playTime, activeCharges }: { playTime: DateTime; activeCharges: number }) =>
  withParam(count, { playTime, activeCharges })
