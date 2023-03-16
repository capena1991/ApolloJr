import Discord from "discord.js"

import { Command } from "../types"
import { getSpecialNickname } from "../../utilities/specialPeople"
import { optionalText } from "../../utilities/utils"

interface Greeting {
  description: string
  reply: (author: Discord.User) => string
}

const greetings: Record<string, Greeting> = {
  hello: {
    description: "Greet me. I will appreciate it and answer in kind.",
    reply: (author) => `Well, hello there${getSpecialNickname(author.id)}. :smirk:`,
  },
  goodnight: {
    description: "Say this before going to bed and I'll wish you a good night.",
    reply: (author) =>
      `${optionalText(
        "Going to bed already? :disappointed:\n_sight_ Ok...\n",
        0.2,
      )}Goodnight to you too${getSpecialNickname(author.id)}! :slight_smile:`,
  },
}

export default Object.entries(greetings).map<Command>(([name, { description, reply }]) => ({
  name,
  description,
  runOnMessage: async ({ channel, author }) => channel.send(reply(author)),
  runOnInteraction: async (interaction) => interaction.reply(reply(interaction.user)),
}))
