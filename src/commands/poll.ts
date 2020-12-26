import Discord from "discord.js"

import { createReactableEmbed } from "../utilities/reactions"
import { Command } from "./types"

interface PollState {
  question: string
  choices: string[]
  votes: Discord.User[][]
  closed: boolean
}

const choiceEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

const getUserList = (users: Discord.User[]) => users.map((u) => `<@${u}>`).join(" ") || "No one yet"
const getPercent = (amount: number, total: number, width = 60) => {
  const percent = total === 0 ? 0 : Math.round((amount * 100) / total)
  const scaled = Math.round((percent * width) / 100)
  return `\`${"█".repeat(scaled)}${" ".repeat(width - scaled)}\` ${percent}% (${amount})`
}

const getEmbed = ({ question, choices, votes, closed }: PollState) => {
  const totalVotes = votes.reduce((cum, choiceVotes) => cum + choiceVotes.length, 0)
  return new Discord.MessageEmbed()
    .setTitle("Poll")
    .setDescription(question)
    .addFields(
      choices.map((c, i) => ({
        name: `${choiceEmojis[i]} ${c}`,
        value: `${getUserList(votes[i])}\n${getPercent(votes[i].length, totalVotes)}`,
      })),
    )
    .setFooter(`Total votes: ${totalVotes}` + (closed ? "\nPoll closed 🔒" : ""))
}

const poll: Command = {
  name: "poll",
  description: "Wanna know what everybody thinks? No better way than with a poll. Hooray for democracy!",
  execute: async ({ channel }, args) => {
    const question = args[0]
    const [, ...choices] = args
    const votes: Discord.User[][] = choices.map(() => [])
    let closed = false

    if (!question) {
      channel.send("What do you want people to vote on?")
      return
    }

    if (!choices.length) {
      channel.send("You gotta give people some choices to vote on.")
      return
    }

    if (choices.length > choiceEmojis.length) {
      channel.send("That's too many choices. I can't handle that :disappointed:")
      return
    }

    if (choices.length < 2) {
      await channel.send("A poll with only one choice is weird, but suit yourself.")
    }

    const reactions = choices.reduce<Record<string, (message: Discord.Message, user: Discord.User) => void>>(
      (cum, _, i) => ({
        ...cum,
        [choiceEmojis[i]]: (message, user) => {
          const index = votes[i].findIndex((u) => u.id === user.id)
          if (index < 0) {
            votes[i].push(user)
          } else {
            votes[i].splice(index, 1)
          }
          message.edit(getEmbed({ question, choices, votes, closed }))
        },
      }),
      {},
    )

    await createReactableEmbed(channel, getEmbed({ question, choices, votes, closed }), reactions, {
      activeTime: 86400000,
      endEffect: (message) => {
        closed = true
        message.edit(getEmbed({ question, choices, votes, closed }))
      },
    })
  },
}

export default poll
