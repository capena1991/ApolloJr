import Discord from "discord.js"

import { getCommand } from "./commands"
import { getReaction } from "./reactions"
import { token, prefix } from "./config.json"
import { logMessage, logInfo } from "./log"
import { notifyBirthday1Day, notifyBirthday1Week } from "./birthdayNotifications"
import { schedule } from "./utils"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setPresence({ status: "online", game: { name: "all of you.", type: "LISTENING" } })
  schedule(notifyBirthday1Day, 3600000, client)
  schedule(notifyBirthday1Week, 3600000, client)
})

client.on("message", async (message) => {
  const { content, channel, author, mentions } = message

  logMessage(message)

  if (channel.type !== "text" || author.bot) {
    return
  }

  if (!content.startsWith(prefix)) {
    if (mentions.members.has(client.user.id)) {
      logInfo("MENTIONED", message)
      channel.send(await getReaction("mention", message))
    }
    return
  }

  const args = content.slice(prefix.length).split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (!command) {
    logInfo("PREFIX WITH NO COMMAND", message)
    return channel.send(await getReaction("noCommand", message))
  }

  const cmd = getCommand(command)

  if (!cmd) {
    logInfo("INVALID COMMAND", message)
    return channel.send(await getReaction("invalidCommand", message))
  }

  try {
    logInfo(`EXECUTING COMMAND ${cmd.name}`, message)
    return cmd.execute(message, args)
  } catch (error) {
    console.error(error)
    return channel.send("Oops! There was an error trying to execute that command! :disappointed:")
  }
})

client.login(token).catch(() => {
  process.exit()
})
