import Discord from "discord.js"
import moment from "moment"
import { User } from "discord.js"

import { Command } from "./types"
import { users } from "../data/userData"
import { birthdays, addBirthday, removeBirthday } from "../data/birthdayData"

const setBirthday = async ({ id: userId }: User, date: string | undefined) => {
  if (!date) {
    return "Don't tease me like that, just tell me the date of your birthday."
  }
  const parsedDate = moment(date)
  if (!parsedDate.isValid()) {
    return "I'm either dumb or that wasn't a valid date. I wouldn't be surprised of either."
  }
  const userData = await users.get(userId)
  users.set(userId, { ...userData, birthday: parsedDate.toISOString() })
  if (userData.birthday) {
    removeBirthday(moment(userData.birthday), userId)
  }
  addBirthday(parsedDate, userId)
  return "Now I know your birthday. :wink:"
}

const monthBirthdayList = async () => {
  const monthBirthdays: { user: string; date: string }[] = []
  const now = moment()
  let day = now.clone().startOf("month")
  const daysInMonth = now.daysInMonth()
  for (let d = 0; d < daysInMonth; d++) {
    const key = day.format("MM-DD")
    console.log(`getting ${key}`)
    const { birthdays: bds } = await birthdays.get(key)
    bds.forEach((bd) => monthBirthdays.push(bd))
    day = day.add(1, "day")
  }
  if (!monthBirthdays.length) {
    return "This is a sad month... no birthdays. :slight_frown:"
  }
  return monthBirthdays.reduce(
    (e, { user, date }) => e.addField(moment(date).format("ll"), `<@${user}>`, true),
    new Discord.RichEmbed().setTitle(`${now.format("MMMM")}'s Birthdays`),
  )
}

const birthday: Command = {
  name: "birthday",
  aliases: ["bd"],
  description: "Your friends won't need to know you don't remember their birthdays. I'll remind you of them.",
  execute: async ({ author, channel }, args) => {
    switch ((args[0] || "").toLowerCase()) {
      case "":
        return channel.send(await monthBirthdayList())
      case "set":
        return channel.send(await setBirthday(author, args[1]))
      default:
        return channel.send(await setBirthday(author, args[0]))
    }
  },
}

export default birthday
