import Keyv from "keyv"

import { DataManager, defaultDB } from "./dataManager"

export interface UserData {
  timesMentioned: number
  birthday?: string
  counting: { lastCounts: { datetime: string }[] }
  money: number
}

const initializeUserData = () => ({
  timesMentioned: 0,
  counting: { lastCounts: [] },
  money: 0,
})

const usersKeyv = new Keyv<UserData>(defaultDB, { namespace: "users" })

export const users = new DataManager<UserData>(usersKeyv, initializeUserData)
