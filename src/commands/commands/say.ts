import Discord from "discord.js"

import { Command } from "../types"
import { randBool } from "../../utilities/utils"
import { getSpecialNickname } from "../../utilities/specialPeople"

const run = (message: string | null, author: Discord.User) => {
  if (!message) {
    return { reply: null, message: "_silence_" }
  }
  const reply = randBool(0.1)
    ? `You really want me to say that?... _sigh_... ok${getSpecialNickname(author.id)} :rolling_eyes:`
    : null
  return { reply, message }
}

const say: Command = {
  name: "say",
  description: "I will say something of your chosing.",
  options: [
    {
      name: "message",
      description: "What you want me to say.",
      type: "STRING",
      required: true,
    },
  ],
  runOnMessage: async ({ channel, author }, args) => {
    const { reply, message } = run(args.join(" "), author)
    if (reply) {
      await channel.send(reply)
    }
    await channel.send(message)
  },
  runOnInteraction: async (interaction) => {
    const { user, options, channel } = interaction
    const { reply, message } = run(options.getString("message"), user)
    await interaction.reply({ content: reply ?? "saying that...", ephemeral: true })
    await channel?.send(message)
  },
}

export default say
