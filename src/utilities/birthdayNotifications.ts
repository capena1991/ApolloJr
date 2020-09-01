import Discord from "discord.js"
import moment from "moment"

import { getBirthdays } from "../data/birthdayData"
import { subscriptions, knownSubscriptions } from "../data/subscriptions"
import { joinReadable } from "./utils"
import { logInfo } from "./log"

const notifyBirthday = async (
  client: Discord.Client,
  dateSelector: (date: moment.Moment) => moment.Moment,
  subscriptionKey: string,
  timeExpression: string,
) => {
  logInfo("NOTIFYING BIRTHDAYS")

  const now = moment()
  const dateToCheck = dateSelector(now.clone())
  const birthdays = await getBirthdays(dateToCheck)
  if (!birthdays.length) {
    logInfo(`NO BIRTHDAYS ${timeExpression.toUpperCase()}`)
    return
  }
  const { subscribed } = await subscriptions.get(subscriptionKey)
  const notification = { reason: dateToCheck.format("MM-DD"), datetime: now.toISOString(true) }
  const updated = await Promise.all(
    subscribed.map(async ({ user, lastNotification }) => {
      let res = { user, lastNotification }
      try {
        if (lastNotification?.reason !== notification.reason) {
          const clientUser = await client.users.fetch(user)
          let own = false
          const birthdayPeople = birthdays.map(({ user: bdUser }) => {
            if (bdUser === user) {
              own = true
              return "a very special person"
            } else {
              return `<@${bdUser}>`
            }
          })
          const message = `Just a friendly reminder that ${joinReadable(
            birthdayPeople,
          )}'s birthday is ${timeExpression} (${dateToCheck.format("MMMM Do")})! :tada::birthday:${
            own ? "\n(the very special person is you) :wink:" : ""
          }`
          clientUser?.send(message)
          res = { user, lastNotification: notification }
        }
      } catch (e) {
        console.log(`Error notifying user. Error: ${e}`)
      }
      return res
    }),
  )
  subscriptions.set(subscriptionKey, { subscribed: updated })
  logInfo("SUBSCRIBERS HAVE BEEN NOTIFIED")
}

export const notifyBirthday1Day = async (client: Discord.Client) => {
  notifyBirthday(client, (date) => date.add(1, "day"), knownSubscriptions.birthdayDay, "tomorrow")
}

export const notifyBirthday1Week = async (client: Discord.Client) => {
  notifyBirthday(client, (date) => date.add(1, "week"), knownSubscriptions.birthdayWeek, "in a week")
}
