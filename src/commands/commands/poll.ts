import Discord from "discord.js"

import { extractMatch } from "../../utilities/utils"
import { createReactableEmbed } from "../../utilities/reactions"
import { Command } from "../types"

interface PollState {
  question: string
  choices: string[]
  votes: Discord.User[][]
  closed: boolean
  multiple: boolean
}

const choiceEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

const getUserList = (users: Discord.User[]) => users.map((u) => `<@${u.id}>`).join(" ") || "No one yet"
const getPercent = (amount: number, total: number, width = 60) => {
  const percent = total === 0 ? 0 : Math.round((amount * 100) / total)
  const scaled = Math.round((percent * width) / 100)
  return `\`${"█".repeat(scaled)}${" ".repeat(width - scaled)}\` ${percent}% (${amount})`
}

const getEmbed = ({ question, choices, votes, closed, multiple }: PollState) => {
  const totalVotes = votes.reduce((cum, choiceVotes) => cum + choiceVotes.length, 0)
  return new Discord.EmbedBuilder()
    .setTitle(`Poll (${multiple ? "multiple" : "single"} choice)`)
    .setDescription(question)
    .addFields(
      choices.map((c, i) => ({
        name: `${choiceEmojis[i]} ${c}`,
        value: `${getUserList(votes[i])}\n${getPercent(votes[i].length, totalVotes)}`,
      })),
    )
    .setFooter({ text: `Total votes: ${totalVotes}` + (closed ? "\nPoll closed 🔒" : "") })
}

const poll: Command = {
  name: "poll",
  description: "Wanna know what everybody thinks? No better way than with a poll. Hooray for democracy!",
  runOnMessage: async ({ channel }, args) => {
    const myArgs = [...args]
    const multiple = !!extractMatch(myArgs, (a) => a === "-m" || a === "-multiple")
    const question = myArgs[0]
    const [, ...choices] = myArgs
    const votes: Discord.User[][] = choices.map(() => [])
    let closed = false

    if (!question) {
      await channel.send("What do you want people to vote on?")
      return
    }

    if (!choices.length) {
      await channel.send("You gotta give people some choices to vote on.")
      return
    }

    if (choices.length > choiceEmojis.length) {
      await channel.send("That's too many choices. I can't handle that :disappointed:")
      return
    }

    if (choices.length < 2) {
      await channel.send("A poll with only one choice is weird, but suit yourself.")
    }

    const reactions = choices.reduce<Record<string, (message: Discord.Message, user: Discord.User) => void>>(
      (cum, _, i) => ({
        ...cum,
        [choiceEmojis[i]]: (message, user) => {
          let match
          if (multiple) {
            match = extractMatch(votes[i], (u) => u.id === user.id)
          } else {
            const allMatches = votes.map((choiceVotes) => extractMatch(choiceVotes, (u) => u.id === user.id))
            match = allMatches[i]
          }
          if (!match) {
            votes[i].push(user)
          }
          message.edit({ embeds: [getEmbed({ question, choices, votes, closed, multiple })] })
        },
      }),
      {},
    )

    await createReactableEmbed(channel, getEmbed({ question, choices, votes, closed, multiple }), reactions, {
      activeTime: 86400000,
      endEffect: (message) => {
        closed = true
        message.edit({ embeds: [getEmbed({ question, choices, votes, closed, multiple })] })
      },
    })
  },
}

export default poll
