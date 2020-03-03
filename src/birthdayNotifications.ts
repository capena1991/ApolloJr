import Discord from "discord.js"
import moment from "moment"

import { getBirthdays } from "./data/birthdayData"
import { subscriptions, knownSubscriptions } from "./data/subscriptions"
import { joinReadable } from "./utils"
import { logInfo } from "./log"

export const notifyBirthday = async (client: Discord.Client) => {
  logInfo("NOTIFYING BIRTHDAYS")

  const now = moment()
  const tomorrow = now.clone().add(1, "day")
  const birthdays = await getBirthdays(tomorrow)
  if (!birthdays.length) {
    logInfo("NO BIRTHDAYS TOMORROW")
    return
  }
  const { subscribed } = await subscriptions.get(knownSubscriptions.birthday)
  const notification = { reason: tomorrow.format("MM-DD"), datetime: now.toISOString(true) }
  const message = `Just a friendly notification that ${joinReadable(
    birthdays.map(({ user }) => `<@${user}>`),
  )}'s birthday is tomorrow! :tada::birthday:`
  const updated = subscribed.map(({ user, lastNotification }) => {
    let res = { user, lastNotification }
    try {
      if (lastNotification?.reason !== notification.reason) {
        const clientUser = client.users.get(user)
        clientUser?.send(message)
        res = { user, lastNotification: notification }
      }
    } finally {
      return res
    }
  })
  subscriptions.set(knownSubscriptions.birthday, { subscribed: updated })
  logInfo("SUBSCRIBERS HAVE BEEN NOTIFIED")
}
