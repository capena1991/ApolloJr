import { Command } from "./types"
import { chooseOne } from "../utilities/utils"

const answers = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes - definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
]

const oracle: Command = {
  name: "oracle",
  aliases: ["8ball"],
  description: "Ask any question and I will answer through my magic oracle: :8ball:.",
  execute: ({ channel }, args) => {
    if (!args.length) {
      return channel.send("Huh? How can I give you an answer if you don't ask a question?")
    }
    return channel.send(`:8ball: ${chooseOne(answers)}`)
  },
}

export default oracle
