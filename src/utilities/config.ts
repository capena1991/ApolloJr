export const isDev = () => process.env.ENVIRONMENT === "dev"

export const db = process.env.DATABASE_URL

interface Config {
  token: string
  prefix: string
  admins: string[]
  countingChannel: string
  gifChannels: string[]
  positiveRole: string
  negativeRole: string
  botUserId: string
  nicePeople: string[]
  alts: string[]
  specialPeople: Array<{ id: string; categories: string[] }>
  allBirthdays: Array<{ id: string; date: string }>
  logMessages?: boolean
}

export const getConfig = <T extends keyof Config>(key: T): Config[T] => {
  const val = process.env[key]
  return val && JSON.parse(val)
}

export const token = getConfig("token")
export const prefix = getConfig("prefix")
export const admins = getConfig("admins")
export const countingChannel = getConfig("countingChannel")
export const gifChannels = getConfig("gifChannels")
export const positiveRole = getConfig("positiveRole")
export const negativeRole = getConfig("negativeRole")
export const botUserId = getConfig("botUserId")
export const nicePeople = getConfig("nicePeople")
export const alts = getConfig("alts")
export const specialPeople = getConfig("specialPeople")
export const allBirthdays = getConfig("allBirthdays")
export const logMessages = getConfig("logMessages")
