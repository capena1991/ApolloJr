import Keyv from "keyv"

import { DataManager, defaultDB } from "./dataManager"

export interface CountingRound {
  roundNumber?: number
  count: number
}

const initializeCountingRound = () => ({
  count: 0,
})

const usersKeyv = new Keyv<CountingRound>(defaultDB, { namespace: "counting" })

export const counting = new DataManager<CountingRound>(usersKeyv, initializeCountingRound)

export const getCurrent = () => counting.get("current")
export const setCurrent = (data: CountingRound) => counting.set("current", data)
