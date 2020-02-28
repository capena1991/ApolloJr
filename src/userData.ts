import Keyv from "keyv"

import { Partial } from "./type-helpers"

const users = new Keyv("sqlite://../data/userData.sqlite", { namespace: "users" })

export const get = async (userId: string) => {
  const dbData = <UserData>await users.get(userId)
  return { ...initializeUserData(), ...dbData }
}

export const set = (userId: string, data: UserData) => users.set(userId, data)

export const setPartial = async (userId: string, data: Partial<UserData>) => {
  const currentData = await get(userId)
  return set(userId, { ...currentData, ...data })
}

export const reset = (userId: string) => users.set(userId, initializeUserData())

export interface UserData {
  timesMentioned: number
  birthday?: string
}

const initializeUserData = () => ({
  timesMentioned: 0,
})
