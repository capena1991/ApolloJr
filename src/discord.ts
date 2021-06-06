import Discord from "discord.js"

import { getCommand, getChannelCommand, Command, findConditionalCommand } from "./commands"
import { getReaction } from "./reactions"
import { token, prefix } from "./utilities/config"
import { logMessage, logInfo } from "./utilities/log"
import { notifyBirthday1Day, notifyBirthday1Week } from "./utilities/birthdayNotifications"
import { parseArgs, parseArgsWithCommand, schedule } from "./utilities/utils"

const client = new Discord.Client()

const runCommand = (
  channel: Discord.TextChannel,
  command: Command,
  message: Discord.Message,
  args: string[],
  commandType = "COMMAND",
) => {
  try {
    logInfo(`EXECUTING ${commandType} ${command.name}`, message)
    return command.execute(message, args)
  } catch (error) {
    console.error(error)
    return channel.send("Oops! There was an error trying to execute that command! :disappointed:")
  }
}

client.on("ready", () => {
  if (!client.user) {
    throw `Logged in but no user.`
  }
  console.log(`Logged in as ${client.user?.tag}!`)
  client.user.setPresence({ status: "online", activity: { name: "all of you.", type: "LISTENING" } })
  schedule(notifyBirthday1Day, 3600000, client)
  schedule(notifyBirthday1Week, 3600000, client)
})

client.on("message", async (message) => {
  if (!client.user) {
    throw `Logged in but no user.`
  }

  const { content, channel, author, mentions } = message

  logMessage(message)

  if (channel.type !== "text" || author.bot) {
    return
  }

  const channelCommand = getChannelCommand(channel.id)
  if (channelCommand) {
    const args = parseArgs(content)
    return runCommand(channel, channelCommand, message, args, "CHANNEL COMMAND")
  }

  const conditionalCommand = findConditionalCommand(message)
  if (conditionalCommand) {
    const args = parseArgs(content)
    return runCommand(channel, conditionalCommand, message, args, "CHANNEL COMMAND")
  }

  if (!content.startsWith(prefix)) {
    if (mentions.members?.has(client.user.id)) {
      logInfo("MENTIONED", message)
      channel.send(await getReaction("mention", message))
    }
    return
  }

  const { command, args } = parseArgsWithCommand(content, prefix)

  if (!command) {
    logInfo("PREFIX WITH NO COMMAND", message)
    return channel.send(await getReaction("noCommand", message))
  }

  const cmd = getCommand(command)

  if (!cmd) {
    logInfo("INVALID COMMAND", message)
    return channel.send(await getReaction("invalidCommand", message))
  }

  return runCommand(channel, cmd, message, args)
})

client.login(token).catch(() => {
  process.exit()
})
