import Discord from "discord.js"
import { SendableChannel } from "./discord"

export const createConfirm = async (
  channel: SendableChannel,
  author: Discord.User,
  text: string,
  confirmIcon: string,
  onConfirm: () => void,
  cancelIcon?: string,
  onCancel?: () => void,
) => {
  const message = await channel.send(text)

  await message.react(confirmIcon)
  if (cancelIcon) {
    await message.react(cancelIcon)
  }

  const collector = message.createReactionCollector({
    filter: (reaction, user) =>
      !user.bot && [confirmIcon, cancelIcon].includes(reaction.emoji.name ?? "") && user.id === author.id,
    time: 60000,
  })
  collector.on("collect", (reaction) => {
    if (reaction.emoji.name === confirmIcon) {
      onConfirm()
    } else if (reaction.emoji.name === cancelIcon && onCancel) {
      onCancel()
    }
  })
  collector.on("end", () => message.reactions.removeAll())
}
