import Keyv from "keyv"
import moment from "moment"

import { DataManager } from "./dataManager"

export interface BirthdayData {
  birthdays: { user: string; date: string }[]
}

const initializeBirthdayData = () => ({
  birthdays: [],
})

const birthdaysKeyv = new Keyv<BirthdayData>("sqlite://../data/userData.sqlite", { namespace: "birthdays" })

export const birthdays = new DataManager<BirthdayData>(birthdaysKeyv, initializeBirthdayData)

export const addBirthday = async (date: moment.Moment, userId: string) => {
  const formattedDate = date.format("MM-DD")
  const { birthdays: users } = await birthdays.get(formattedDate)
  birthdays.set(formattedDate, { birthdays: [...users, { user: userId, date: date.toISOString() }] })
}

export const removeBirthday = async (date: moment.Moment, userId: string) => {
  const formattedDate = date.format("MM-DD")
  const { birthdays: users } = await birthdays.get(formattedDate)
  birthdays.set(formattedDate, { birthdays: users.filter(({ user }) => user !== userId) })
}
