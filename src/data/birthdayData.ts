import Keyv from "keyv"
import moment from "moment"

import { DataManager } from "./dataManager"

export interface BirthdayData {
  users: string[]
}

const initializeBirthdayData = () => ({
  users: [],
})

const birthdaysKeyv = new Keyv<BirthdayData>("sqlite://../data/userData.sqlite", { namespace: "birthdays" })

export const birthdays = new DataManager<BirthdayData>(birthdaysKeyv, initializeBirthdayData)

export const addBirthday = async (date: moment.Moment, userId: string) => {
  const formattedDate = date.format("MM-DD")
  const { users } = await birthdays.get(formattedDate)
  birthdays.set(formattedDate, { users: [...users, userId] })
}
