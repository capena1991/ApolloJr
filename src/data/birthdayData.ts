import Keyv from "keyv"
import { DateTime } from "luxon"

import { db } from "../utilities/config"
import { DataManager } from "./dataManager"

export interface BirthdayData {
  birthdays: { user: string; date: string }[]
}

const initializeBirthdayData = () => ({
  birthdays: [],
})

const birthdaysKeyv = new Keyv<BirthdayData>(db, { namespace: "birthdays" })

export const birthdays = new DataManager<BirthdayData>(birthdaysKeyv, initializeBirthdayData)

export const addBirthday = async (date: DateTime, userId: string) => {
  const isoDate = date.toISODate()
  if (!isoDate) {
    return
  }

  const formattedDate = date.toFormat("MM-dd")
  const { birthdays: users } = await birthdays.get(formattedDate)
  birthdays.set(formattedDate, { birthdays: [...users, { user: userId, date: isoDate }] })
}

export const removeBirthday = async (date: DateTime, userId: string) => {
  const formattedDate = date.toFormat("MM-dd")
  const { birthdays: users } = await birthdays.get(formattedDate)
  birthdays.set(formattedDate, { birthdays: users.filter(({ user }) => user !== userId) })
}

export const getBirthdays = async (date: DateTime) => {
  const formattedDate = date.toFormat("MM-dd")
  const { birthdays: users } = await birthdays.get(formattedDate)
  return users
}
