export const isDev = () => process.env.ENVIRONMENT === "dev"

interface Config {
  token: string
  prefix: string
  admins: string[]
  countingChannel: string
  positiveRole: string
  negativeRole: string
  botUserId: string
  nicePeople: string[]
  alts: string[]
  specialPeople: Array<{ id: string; categories: string[] }>
  allBirthdays: Array<{ id: string; date: string }>
}

export const getConfig = <T extends keyof Config>(key: T): Config[T] => {
  if (isDev()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../config.json")[key]
  } else {
    const val = process.env[key]
    return val && JSON.parse(val)
  }
}

export const token = getConfig("token")
export const prefix = getConfig("prefix")
export const admins = getConfig("admins")
export const countingChannel = getConfig("countingChannel")
export const positiveRole = getConfig("positiveRole")
export const negativeRole = getConfig("negativeRole")
export const botUserId = getConfig("botUserId")
export const nicePeople = getConfig("nicePeople")
export const alts = getConfig("alts")
export const specialPeople = getConfig("specialPeople")
export const allBirthdays = getConfig("allBirthdays")
