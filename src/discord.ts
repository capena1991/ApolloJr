import Discord from "discord.js"
import { getCommand } from "./commands"

import { token, prefix } from "./config.json"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setPresence({ status: "online", game: { name: "only basic commands for now.", type: "LISTENING" } })
})

client.on("message", (message) => {
  const { content, channel, author, mentions } = message

  if (channel.type !== "text") {
    return
  }

  if (!content.startsWith(prefix) || author.bot) {
    if (mentions.members.find((u) => u.id === client.user.id)) {
      channel.send("Who's calling me? :eyes:")
    }
    return
  }

  const args = content.slice(prefix.length).split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (!command) {
    return channel.send("You talkin' to me? :face_with_raised_eyebrow:")
  }

  const cmd = getCommand(command)

  if (!cmd) {
    return channel.send("That's not a valid command. What are you trying to do? :unamused:")
  }

  try {
    return cmd.execute(message, args)
  } catch (error) {
    console.error(error)
    return channel.send("Oops! There was an error trying to execute that command! :disappointed:")
  }
})

client.login(token).catch(() => {
  process.exit()
})
