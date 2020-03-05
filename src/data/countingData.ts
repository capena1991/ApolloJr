import Keyv from "keyv"

import { DataManager, defaultDB } from "./dataManager"

export interface CountingRound {
  roundNumber: number
  count: number
}

const initializeCountingRound = (roundNumber = 0) => ({
  roundNumber,
  count: 0,
})

const usersKeyv = new Keyv<CountingRound>(defaultDB, { namespace: "counting" })

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
