import Discord from "discord.js"
import { DateTime } from "luxon"

import { allBirthdays as allBirthdaysBackup, admins } from "../../utilities/config"
import { parseDate } from "../../utilities/date-helpers"
import { createSimplePageableEmbed } from "../../utilities/paging"
import { users } from "../../data/userData"
import {
  addBirthday,
  removeBirthday as removeBirthdayData,
  getBirthdays as getBirthdayData,
} from "../../data/birthdayData"
import { toggleSubscribe, knownSubscriptions } from "../../data/subscriptions"
import { Command } from "../types"
import { SendableChannel } from "@app/utilities/discord"

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  users.set(userId, { ...userData, birthday: parsedDate.toISODate()! })
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
    `That's sad :disappointed:. People won't be reminded of your birthday now, <@${userId}>. ` +
    "Let's hope they remember it because I won't. :slight_frown:"
  )
}

const monthBirthdayList = async () => {
  const monthBirthdays: { user: string; date: string }[] = []
  const now = DateTime.local()
  const startOfMonth = now.startOf("month")
  const daysInMonth = now.daysInMonth ?? 31
  for (let d = 0; d < daysInMonth; d++) {
    const day = startOfMonth.plus({ days: d })
    const bds = await getBirthdayData(day)
    bds.forEach((bd) => monthBirthdays.push(bd))
  }
  if (!monthBirthdays.length) {
    return { content: "This is a sad month... no birthdays. :slight_frown:" }
  }
  const embed = new Discord.EmbedBuilder().setTitle(`${now.toLocaleString({ month: "long" })}'s Birthdays`).addFields(
    monthBirthdays.map(({ user, date }) => ({
      name: parseDate(date).toLocaleString(DateTime.DATE_MED),
      value: `<@${user}>`,
      inline: true,
    })),
  )
  return { embeds: [embed] }
}

const getAllBirthdays = async () => {
  const allBirthdays: { user: string; date: string }[] = []
  const startOfYear = parseDate("2020-01-01") // any leap year will do
  for (let d = 0; d < 366; d++) {
    const day = startOfYear.plus({ days: d })
    const bds = await getBirthdayData(day)
    bds.forEach((bd) => allBirthdays.push(bd))
  }
  return allBirthdays
}

const listAllBirthdays = async (channel: SendableChannel, author: Discord.User, page = 1) => {
  const allBirthdays = await getAllBirthdays()
  if (!allBirthdays.length) {
    return "I'm sad... I don't know any birthday. :slight_frown:"
  }
  if (!Number.isFinite(page)) {
    page = 1
  }
  return await createSimplePageableEmbed(
    channel,
    new Discord.EmbedBuilder().setTitle("All Birthdays"),
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
  runOnMessage: async ({ author, channel }, args) => {
    switch ((args[0] || "").toLowerCase()) {
      case "setall":
        if (!admins.includes(author.id)) {
          await channel.send("Nothing here for you, kid. Keep walking. :unamused:")
          return
        }
        return allBirthdaysBackup.forEach(async ({ id, date }) => channel.send(await setBirthday(id, date)))
      case "removeall": {
        if (!admins.includes(author.id)) {
          await channel.send("Nothing here for you, kid. Keep walking. :unamused:")
          return
        }
        const allBirthdays = await getAllBirthdays()
        await Promise.all(allBirthdays.map(async ({ user }) => channel.send(await removeBirthday(user))))
        return
      }
      case "":
      case "month":
        await channel.send(await monthBirthdayList())
        return
      case "all":
        await listAllBirthdays(channel, author, parseInt(args[1]))
        return
      case "set":
        await channel.send(await setBirthday(author.id, args.slice(1).join(" ")))
        return
      case "remove":
      case "unset":
      case "delete":
      case "forget":
        await channel.send(await removeBirthday(author.id))
        return
      case "sub":
      case "subscribe":
      case "notify":
        await channel.send(await subscribeToNotifications(author.id))
        return
      default: {
        const match = args[0].match(/<@!?(\d+)>/)
        if (match) {
          await channel.send(await getBirthday(match[1]))
          return
        }
        await channel.send(await setBirthday(author.id, args.join(" ")))
      }
    }
  },
}

export default birthday
