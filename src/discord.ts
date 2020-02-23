import Discord from "discord.js"
import { getCommand } from "./commands"

import { token, prefix } from "./config.json"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", (message) => {
  const { content, channel, author, reply } = message

  if (!content.startsWith(prefix) || author.bot) {
    return
  }

  const args = content.slice(prefix.length).split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (channel.type !== "text") {
    return
  }

  if (!command) {
    return reply("you talkin' to me?")
  }

  const cmd = getCommand(command)

  try {
    return cmd.execute(message, args)
  } catch (error) {
    console.error(error)
    return reply("there was an error trying to execute that command!")
  }
})

client.login(token)
