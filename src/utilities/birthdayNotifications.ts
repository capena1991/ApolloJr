import Discord from "discord.js"
import { DateTime } from "luxon"

import { getBirthdays } from "../data/birthdayData"
import { subscriptions, knownSubscriptions } from "../data/subscriptions"
import { joinReadable } from "./utils"
import { logError, logInfo } from "./log"

const notifyBirthday = async (
  client: Discord.Client,
  dateSelector: (date: DateTime) => DateTime,
  subscriptionKey: string,
  timeExpression: string,
) => {
  logInfo("NOTIFYING BIRTHDAYS")

  const now = DateTime.local()
  const dateToCheck = dateSelector(now)
  const birthdays = await getBirthdays(dateToCheck)
  if (!birthdays.length) {
    logInfo(`NO BIRTHDAYS ${timeExpression.toUpperCase()}`)
    return
  }
  const { subscribed } = await subscriptions.get(subscriptionKey)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const notification = { reason: dateToCheck.toFormat("MM-dd"), datetime: now.toISO()! }
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
          const message =
            `Just a friendly reminder that ${joinReadable(birthdayPeople)}'s ` +
            `birthday is ${timeExpression} (${dateToCheck.toLocaleString({ month: "long", day: "numeric" })})! ` +
            `:tada::birthday:${own ? "\n(the very special person is you) :wink:" : ""}`
          clientUser?.send(message)
          res = { user, lastNotification: notification }
        }
      } catch (e) {
        logError(`Error notifying user. Error: ${e}`)
      }
      return res
    }),
  )
  subscriptions.set(subscriptionKey, { subscribed: updated })
  logInfo("SUBSCRIBERS HAVE BEEN NOTIFIED")
}

export const notifyBirthday1Day = async (client: Discord.Client) => {
  notifyBirthday(client, (date) => date.plus({ day: 1 }), knownSubscriptions.birthdayDay, "tomorrow")
}

export const notifyBirthday1Week = async (client: Discord.Client) => {
  notifyBirthday(client, (date) => date.plus({ week: 1 }), knownSubscriptions.birthdayWeek, "in a week")
}
