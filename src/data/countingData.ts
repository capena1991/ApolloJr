import Keyv from "keyv"
import { DateTime } from "luxon"

import { botUserId, db } from "../utilities/config"
import { Dict } from "../type-helpers"
import { DataManager } from "./dataManager"

export interface CountingRound {
  roundNumber: number
  count: number
  last: { user: string; datetime: string }
  contributions: Dict<{ p: number; n: number }>
}

const initializeCountingRound = (roundNumber = 0) => ({
  roundNumber,
  count: 0,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  last: { user: botUserId, datetime: DateTime.utc().toISO()! }, // bot's user id
  contributions: {},
})

const usersKeyv = new Keyv<CountingRound>(db, { namespace: "counting" })

export const counting = new DataManager<CountingRound>(usersKeyv, initializeCountingRound)

export const getCurrent = () => counting.get("current")

export const setCurrent = (data: CountingRound) => counting.set("current", data)

export const archiveCurrent = async (currentRound: CountingRound) => {
  await counting.set(currentRound.roundNumber.toString(), currentRound)
  return initializeCountingRound(currentRound.roundNumber + 1)
}
