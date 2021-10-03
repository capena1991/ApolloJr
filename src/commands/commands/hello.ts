import Discord from "discord.js"

import { Command } from "../types"
import { getSpecialNickname } from "../../utilities/specialPeople"

const run = (author: Discord.User) => `Well, hello there${getSpecialNickname(author.id)}. :smirk:`

const hello: Command = {
  name: "hello",
  description: "Greet me. I will appreciate it and answer in kind.",
  runOnMessage: async ({ channel, author }) => channel.send(run(author)),
  runOnInteraction: async (interaction) => interaction.reply(run(interaction.user)),
}

export default hello
