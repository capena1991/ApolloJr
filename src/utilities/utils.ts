export const randInt = (min: number, max: number | undefined = undefined) => {
  if (max === undefined) {
    max = min
    min = 0
  }
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export const chooseOne = <T>(values: T[]) => values[randInt(values.length)]

export const randBool = (probability = 0.5) => Math.random() < probability

export const joinReadable = (list: string[]) => {
  const len = list.length
  switch (len) {
    case 0:
      return ""
    case 1:
      return list[0]
    default:
      return `${list.slice(0, len - 1).join(", ")} and ${list[len - 1]}`
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const schedule = (fn: (...args: any[]) => any, time: number, ...args: any[]) => {
  setImmediate(fn, ...args)
  return setInterval(fn, time, ...args)
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const pluralize = (count: number, singular: string, plural: string) => (count === 1 ? singular : plural)

export const nDrachma = (n: number) => `${n} ${pluralize(n, "drachma", "drachmae")}`

export const parseArgs = (text: string, prefix: string) => {
  const split = text.slice(prefix.length).match(/(?:"(?:(?:\\.)|[^\\"])*?")|(?:[^\s]+)/g) ?? []
  const args = split.map((t) => t.replace(/(^|[^\\])"/g, "$1").replace(/\\"/g, '"'))
  const command = args.shift()?.toLowerCase()
  return { command, args }
}
