import { Command } from "./types"
import { randBool } from "../utilities/utils"
import { getSpecialNickname } from "../utilities/specialPeople"

const say: Command = {
  name: "say",
  description: "I will say something of your chosing.",
  execute: ({ channel, author }, args) => {
    if (!args.length) {
      return channel.send("_silence_")
    }
    if (randBool(0.1)) {
      channel.send(`You really want me to say that?... _sigh_... ok${getSpecialNickname(author.id)} :rolling_eyes:`)
    }
    return channel.send(args.join(" "))
  },
}

export default say
