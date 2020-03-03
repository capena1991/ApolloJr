import Keyv from "keyv"

import { DataManager, defaultDB } from "./dataManager"

export interface UserData {
  timesMentioned: number
  birthday?: string
}

const initializeUserData = () => ({
  timesMentioned: 0,
})

const usersKeyv = new Keyv<UserData>(defaultDB, { namespace: "users" })

export const users = new DataManager<UserData>(usersKeyv, initializeUserData)
