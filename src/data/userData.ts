import Keyv from "keyv"

import { db } from "../utilities/config"
import { DataManager } from "./dataManager"
import { Dict } from "../type-helpers"

export interface UserData {
  timesMentioned: number
  birthday?: string
  counting: { lastCounts: Array<{ datetime: string } | undefined> }
  money: number
  items?: Dict<number>
}

const initializeUserData = () => ({
  timesMentioned: 0,
  counting: { lastCounts: [] },
  money: 0,
})

const usersKeyv = new Keyv<UserData>(db, { namespace: "users" })

export const users = new DataManager<UserData>(usersKeyv, initializeUserData)
