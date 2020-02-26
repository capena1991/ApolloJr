import Discord from "discord.js"

import { getCommand } from "./commands"
import { getReaction } from "./reactions"
import { token, prefix } from "./config.json"
import { logMessage } from "./log"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setPresence({ status: "online", game: { name: "all of you.", type: "LISTENING" } })
})

client.on("message", async (message) => {
  const { content, channel, author, mentions } = message

  logMessage(message)

  if (channel.type !== "text") {
    return
  }

  if (!content.startsWith(prefix) || author.bot) {
    if (mentions.members.has(client.user.id)) {
      channel.send(await getReaction("mention", message))
    }
    return
  }

  const args = content.slice(prefix.length).split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (!command) {
    return channel.send(await getReaction("noCommand", message))
  }

  const cmd = getCommand(command)

  if (!cmd) {
    return channel.send(await getReaction("invalidCommand", message))
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
