import Keyv from "keyv"

const users = new Keyv("sqlite://../data/userData.sqlite", { namespace: "users" })

export const get = async (userId: string) => <UserData>((await users.get(userId)) || initializeUserData())

export const set = (userId: string, data: UserData) => users.set(userId, data)

export const reset = (userId: string) => users.set(userId, initializeUserData())

export interface UserData {
  timesMentioned: number
}

const initializeUserData = () => ({
  timesMentioned: 0,
})
