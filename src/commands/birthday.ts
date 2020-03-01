import Discord from "discord.js"
import moment from "moment"

import { allBirthdays } from "../config.json"
import { Command } from "./types"
import { users } from "../data/userData"
import { birthdays, addBirthday, removeBirthday } from "../data/birthdayData"

const setBirthday = async (userId: string, date: string | undefined) => {
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
    await removeBirthday(moment(userData.birthday), userId)
  }
  addBirthday(parsedDate, userId)
  return `Now I know your birthday, <@${userId}> (${parsedDate.format("ll")}). :wink:`
}

const getBirthday = async (userId: string) => {
  const { birthday } = await users.get(userId)
  if (!birthday) {
    return "I don't know their birthday. :slight_frown:"
  }
  const parsedBirthday = moment(birthday)
  const now = moment()
  let nextBirthday = parsedBirthday.clone().year(now.year())
  if (nextBirthday.isBefore(now)) {
    nextBirthday = nextBirthday.add(1, "year")
  }
  return `<@${userId}>'s birthday is ${parsedBirthday.format("ll")} (${nextBirthday.fromNow()}).`
}

const monthBirthdayList = async () => {
  const monthBirthdays: { user: string; date: string }[] = []
  const now = moment()
  let day = now.clone().startOf("month")
  const daysInMonth = now.daysInMonth()
  for (let d = 0; d < daysInMonth; d++) {
    const key = day.format("MM-DD")
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

const allowedUsers = ["425379183829581835"]

const birthday: Command = {
  name: "birthday",
  aliases: ["bd"],
  description: "Your friends won't need to know you don't remember their birthdays. I'll remind you of them.",
  execute: async ({ author, channel }, args) => {
    switch ((args[0] || "").toLowerCase()) {
      case "setall":
        if (!allowedUsers.includes(author.id)) {
          return channel.send("Nothing here for you, kid. Keep walking. :unamused:")
        }
        return allBirthdays.forEach(async ({ id, date }) => channel.send(await setBirthday(id, date)))
      case "":
        return channel.send(await monthBirthdayList())
      case "set":
        return channel.send(await setBirthday(author.id, args[1]))
      default:
        const match = args[0].match(/<@!?(\d+)>/)
        if (match) {
          return channel.send(await getBirthday(match[1]))
        }
        return channel.send(await setBirthday(author.id, args[0]))
    }
  },
}

export default birthday
