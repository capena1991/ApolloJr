import Discord from "discord.js"
import { DateTime } from "luxon"

import { allBirthdays, admins } from "../utilities/config"
import { parseDate } from "../utilities/date-helpers"
import { createSimplePageableEmbed } from "../utilities/paging"
import { users } from "../data/userData"
import {
  addBirthday,
  removeBirthday as removeBirthdayData,
  getBirthdays as getBirthdayData,
} from "../data/birthdayData"
import { toggleSubscribe, knownSubscriptions } from "../data/subscriptions"
import { Command } from "./types"

const getBirthday = async (userId: string) => {
  const { birthday } = await users.get(userId)
  if (!birthday) {
    return "I don't know their birthday. :slight_frown:"
  }
  const parsedBirthday = parseDate(birthday)
  const now = DateTime.local()
  let nextBirthday = parsedBirthday.set({ year: now.year })
  if (nextBirthday < now) {
    nextBirthday = nextBirthday.plus({ year: 1 })
  }
  const age = nextBirthday.year - parsedBirthday.year
  return (
    `<@${userId}>'s birthday is ${parsedBirthday.toLocaleString(DateTime.DATE_MED)} ` +
    `(turning ${age} ${nextBirthday.toRelative()}).`
  )
}

const setBirthday = async (userId: string, date: string | undefined) => {
  if (!date) {
    return "Don't tease me like that, just tell me the date of your birthday."
  }
  const parsedDate = parseDate(date)
  if (!parsedDate.isValid) {
    return "I'm either dumb or that wasn't a valid date. I wouldn't be surprised of either."
  }
  const userData = await users.get(userId)
  users.set(userId, { ...userData, birthday: parsedDate.toISODate() })
  if (userData.birthday) {
    await removeBirthdayData(parseDate(userData.birthday), userId)
  }
  addBirthday(parsedDate, userId)
  return `Now I know your birthday, <@${userId}> (${parsedDate.toLocaleString(DateTime.DATE_MED)}). :wink:`
}

const removeBirthday = async (userId: string) => {
  const { birthday, ...userDataSansBD } = await users.get(userId)
  if (!birthday) {
    return "But... I don't know your birthday. Are you sure you know what you're doing? :unamused:"
  }
  users.set(userId, userDataSansBD)
  removeBirthdayData(parseDate(birthday), userId)
  return (
    "That's sad :disappointed:. People won't be reminded of your birthday now. " +
    "Let's hope they remember it because I won't. :slight_frown:"
  )
}

const monthBirthdayList = async () => {
  const monthBirthdays: { user: string; date: string }[] = []
  const now = DateTime.local()
  const startOfMonth = now.startOf("month")
  const daysInMonth = now.daysInMonth
  for (let d = 0; d < daysInMonth; d++) {
    const day = startOfMonth.plus({ days: d })
    const bds = await getBirthdayData(day)
    bds.forEach((bd) => monthBirthdays.push(bd))
  }
  if (!monthBirthdays.length) {
    return "This is a sad month... no birthdays. :slight_frown:"
  }
  return monthBirthdays.reduce(
    (e, { user, date }) => e.addField(parseDate(date).toLocaleString(DateTime.DATE_MED), `<@${user}>`, true),
    new Discord.MessageEmbed().setTitle(`${now.toLocaleString({ month: "long" })}'s Birthdays`),
  )
}

const listAllBirthdays = async (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  author: Discord.User,
  page = 1,
) => {
  const allBirthdays: { user: string; date: string }[] = []
  const startOfYear = parseDate("2020-01-01") // any leap year will do
  for (let d = 0; d < 366; d++) {
    const day = startOfYear.plus({ days: d })
    const bds = await getBirthdayData(day)
    bds.forEach((bd) => allBirthdays.push(bd))
  }
  if (!allBirthdays.length) {
    return "I'm sad... I don't know any birthday. :slight_frown:"
  }
  if (!Number.isFinite(page)) {
    page = 1
  }
  return await createSimplePageableEmbed(
    channel,
    new Discord.MessageEmbed().setTitle("All Birthdays"),
    allBirthdays.map(({ user, date }) => ({
      name: parseDate(date).toLocaleString(DateTime.DATE_MED),
      value: `<@${user}>`,
      inline: true,
    })),
    author,
  )
}

const subscribeToNotifications = async (userId: string) => {
  const toggleDay = toggleSubscribe(knownSubscriptions.birthdayDay, userId)
  const toggleWeek = toggleSubscribe(knownSubscriptions.birthdayWeek, userId)

  return (await toggleDay) || (await toggleWeek)
    ? "So your memory sucks, right? Don't worry, that's what I'm here for. I'll let you know before every birthday."
    : "Was I too annoying? :pleading_face: Sorry, I won't notify you anymore... Your memory better be good."
}

const birthday: Command = {
  name: "birthday",
  aliases: ["bd", "bday", "birthdays", "bds", "bdays"],
  description: "Your friends won't need to know you don't remember their birthdays. I'll remind you of them.",
  execute: async ({ author, channel }, args) => {
    switch ((args[0] || "").toLowerCase()) {
      case "setall":
        if (!admins.includes(author.id)) {
          return channel.send("Nothing here for you, kid. Keep walking. :unamused:")
        }
        return allBirthdays.forEach(async ({ id, date }) => channel.send(await setBirthday(id, date)))
      case "":
        return channel.send(await monthBirthdayList())
      case "all":
        return await listAllBirthdays(channel, author, parseInt(args[1]))
      case "set":
        return channel.send(await setBirthday(author.id, args.slice(1).join(" ")))
      case "remove":
      case "unset":
      case "delete":
      case "forget":
        return channel.send(await removeBirthday(author.id))
      case "sub":
      case "subscribe":
      case "notify":
        return channel.send(await subscribeToNotifications(author.id))
      default: {
        const match = args[0].match(/<@!?(\d+)>/)
        if (match) {
          return channel.send(await getBirthday(match[1]))
        }
        return channel.send(await setBirthday(author.id, args.join(" ")))
      }
    }
  },
}

export default birthday
