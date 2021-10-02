import Discord from "discord.js"

interface ReactableEmbedOptions {
  removeReactions?: boolean
  activeTime?: number
  author?: Discord.User
  endEffect?: (message: Discord.Message) => void
}

export const createReactableEmbed = async (
  channel: Discord.TextBasedChannels,
  embed: Discord.MessageEmbed,
  reactions: Record<string, (message: Discord.Message, user: Discord.User) => void>,
  { removeReactions = true, activeTime = 300000, author, endEffect }: ReactableEmbedOptions = {
    removeReactions: true,
    activeTime: 300000,
  },
) => {
  const message = await channel.send({ embeds: [embed] })

  for (const r of Object.keys(reactions)) {
    await message.react(r)
  }

  const collector = message.createReactionCollector({
    filter: (reaction, user) => !user.bot && reactions[reaction.emoji.name ?? ""] && (!author || user.id === author.id),
    time: activeTime,
  })
  collector.on("collect", (reaction, user) => {
    if (removeReactions) {
      reaction.users.remove(user)
    }
    const effect = reactions[reaction.emoji.name ?? ""]
    effect(message, user)
  })
  collector.on("end", () => {
    if (removeReactions) {
      message.reactions.removeAll()
    }
    if (endEffect) {
      endEffect(message)
    }
  })
}
