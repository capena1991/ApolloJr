import Keyv from "keyv"

import { db } from "../utilities/config"
import { DataManager } from "./dataManager"

export interface Subscription {
  subscribed: { user: string; lastNotification?: { reason: string; datetime: string } }[]
}

const initializeSubscriptionData = () => ({
  subscribed: [],
})

const subscriptionsKeyv = new Keyv<Subscription>(db, { namespace: "subscriptions" })

export const subscriptions = new DataManager<Subscription>(subscriptionsKeyv, initializeSubscriptionData)

export const subscribe = async (subscription: string, userId: string) => {
  const { subscribed } = await subscriptions.get(subscription)
  if (subscribed.find(({ user }) => user === userId)) {
    return false
  }
  subscriptions.set(subscription, { subscribed: [...subscribed, { user: userId }] })
  return true
}

export const toggleSubscribe = async (subscription: string, userId: string) => {
  const { subscribed } = await subscriptions.get(subscription)
  const index = subscribed.findIndex(({ user }) => user === userId)
  if (index >= 0) {
    subscriptions.set(subscription, { subscribed: [...subscribed.slice(0, index), ...subscribed.slice(index + 1)] })
    return false
  }
  subscriptions.set(subscription, { subscribed: [...subscribed, { user: userId }] })
  return true
}

export const knownSubscriptions = {
  birthdayDay: "birthdayDay",
  birthdayWeek: "birthdayWeek",
}
