import Keyv from "keyv"

import { DataManager } from "./dataManager"

export interface UserData {
  timesMentioned: number
  birthday?: string
}

const initializeUserData = () => ({
  timesMentioned: 0,
})

const users = new Keyv<UserData>("sqlite://../data/userData.sqlite", { namespace: "users" })

export const userData = new DataManager<UserData>(users, initializeUserData)