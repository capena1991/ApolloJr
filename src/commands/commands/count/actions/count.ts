import { DateTime } from "luxon"

import { parseDate } from "../../../../utilities/date-helpers"
import { addContribution, addCountEntries, PlayData, setCount } from "../data"
import { getRemainingTimeText } from "../messages"
import { PlayMessageResult } from "../types"
import { ActionResult } from "./types"
import { getContributions, withParam } from "./utils"

const getChargesReaction = (charges: number) => ["🅾", "1️⃣", "2️⃣", "3️⃣", "4️⃣"][charges]

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
    // if activeCharges is 1, then lastCounts[3] is guarantee to exist
    const newOldest = parseDate(user.counting.lastCounts[3]?.datetime ?? "")
    const limit = newOldest.plus({ minutes: 5 })
    messages = [
      {
        key: "nextCount",
        params: { inTime: getRemainingTimeText(limit.diff(playTime).as("seconds")), userId },
        kind: "info",
      },
    ]
  }

  return { messages, playData: newPlayData, reactions: [getChargesReaction(activeCharges - 1)] }
}

export const getCount = ({ playTime, activeCharges }: { playTime: DateTime; activeCharges: number }) =>
  withParam(count, { playTime, activeCharges })
