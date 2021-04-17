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
  last: { user: botUserId, datetime: DateTime.utc().toISO() }, // bot's user id
  contributions: {},
})

const usersKeyv = new Keyv<CountingRound>(db, { namespace: "counting" })

export const counting = new DataManager<CountingRound>(usersKeyv, initializeCountingRound)

export const getCurrent = () => counting.get("current")

export const setCurrent = (data: CountingRound) => counting.set("current", data)

export const archiveCurrent = async () => {
  const current = await getCurrent()
  counting.set(current.roundNumber.toString(), current)
  const newRoundNumber = current.roundNumber + 1
  setCurrent(initializeCountingRound(newRoundNumber))
  return newRoundNumber
}
