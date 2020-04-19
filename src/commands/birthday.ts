import Discord from "discord.js"
import moment from "moment"

import { allBirthdays, admins } from "../config.json"
import { Command } from "./types"
import { users } from "../data/userData"
import { birthdays, addBirthday, removeBirthday as removeBirthdayData } from "../data/birthdayData"
import { toggleSubscribe, knownSubscriptions } from "../data/subscriptions"
import { createPageableEmbed } from "../utilities/paging"

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
    await removeBirthdayData(moment(userData.birthday), userId)
  }
  addBirthday(parsedDate, userId)
  return `Now I know your birthday, <@${userId}> (${parsedDate.format("ll")}). :wink:`
}

const removeBirthday = async (userId: string) => {
  const { birthday, ...userDataSansBD } = await users.get(userId)
  if (!birthday) {
    return "But... I don't know your birthday. Are you sure you know what you're doing? :unamused:"
  }
  users.set(userId, userDataSansBD)
  removeBirthdayData(moment(birthday), userId)
  return (
    "That's sad :disappointed:. People won't be reminded of your birthday now. " +
    "Let's hope they remember it because I won't. :slight_frown:"
  )
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

const listAllBirthdays = async (
  channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
  author: Discord.User,
  page: number = 1,
) => {
  const allBirthdays: { user: string; date: string }[] = []
  let day = moment("2020-01-01")
  for (let d = 0; d < 366; d++) {
    const key = day.format("MM-DD")
    const { birthdays: bds } = await birthdays.get(key)
    bds.forEach((bd) => allBirthdays.push(bd))
    day = day.add(1, "day")
  }
  if (!allBirthdays.length) {
    return "I'm sad... I don't know any birthday. :slight_frown:"
  }
  if (!Number.isFinite(page)) {
    page = 1
  }
  return await createPageableEmbed(
    channel,
    {
      title: "All Birthdays",
      fields: allBirthdays.map(({ user, date }) => ({
        name: moment(date).format("ll"),
        value: `<@${user}>`,
        inline: true,
      })),
    },
    author,
  )
  // return allBirthdays
  //   .slice(24 * (page - 1), 24 * page)
  //   .reduce(
  //     (e, { user, date }) => e.addField(moment(date).format("ll"), `<@${user}>`, true),
  //     new Discord.RichEmbed().setTitle(`All Birthdays (page ${page}/${Math.ceil(allBirthdays.length / 24)})`),
  //   )
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
      default:
        const match = args[0].match(/<@!?(\d+)>/)
        if (match) {
          return channel.send(await getBirthday(match[1]))
        }
        return channel.send(await setBirthday(author.id, args.join(" ")))
    }
  },
}

export default birthday
