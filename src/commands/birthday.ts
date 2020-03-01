import moment from "moment"
import { User } from "discord.js"

import { Command } from "./types"
import { userData } from "../data/userData"

const setBirthday = async (author: User, date: string | undefined) => {
  if (!date) {
    return "Don't tease me like that, just tell me the date of your birthday."
  }
  const parsedDate = moment(date)
  if (!parsedDate.isValid()) {
    return "I'm either dumb or that wasn't a valid date. I wouldn't be surprised of either."
  }
  await userData.setPartial(author.id, { birthday: parsedDate.toISOString() })
  return "Now I know your birthday. :wink:"
}

const birthday: Command = {
  name: "birthday",
  aliases: ["bd"],
  description: "Your friends won't need to know you don't remember their birthdays. I'll remind you of them.",
  execute: async ({ author, channel }, args) => {
    switch ((args[0] || "").toLowerCase()) {
      case "set":
        return channel.send(await setBirthday(author, args[1]))
      default:
        return channel.send(await setBirthday(author, args[0]))
    }
  },
}

export default birthday
