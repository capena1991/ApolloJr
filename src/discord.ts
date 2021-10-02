import Discord from "discord.js"

import { getCommand, getChannelCommand, Command, findConditionalCommand } from "./commands"
import { getReaction } from "./reactions"
import { token, prefix } from "./utilities/config"
import { logMessage, logInfo } from "./utilities/log"
import { notifyBirthday1Day, notifyBirthday1Week } from "./utilities/birthdayNotifications"
import { parseArgs, parseArgsWithCommand, schedule } from "./utilities/utils"

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
})

const runCommand = (
  channel: Discord.TextBasedChannels,
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
  client.user.setPresence({ status: "online", activities: [{ name: "all of you.", type: "LISTENING" }] })
  schedule(notifyBirthday1Day, 3600000, client)
  schedule(notifyBirthday1Week, 3600000, client)
})

client.on("messageCreate", async (message) => {
  if (!client.user) {
    throw `Logged in but no user.`
  }

  const { content, channel, author, mentions } = message

  logMessage(message)

  if (author.bot) {
    return
  }

  const channelCommand = getChannelCommand(channel.id)
  if (channelCommand) {
    const args = parseArgs(content)
    await runCommand(channel, channelCommand, message, args, "CHANNEL COMMAND")
    return
  }

  const conditionalCommand = findConditionalCommand(message)
  if (conditionalCommand) {
    const args = parseArgs(content)
    await runCommand(channel, conditionalCommand, message, args, "CHANNEL COMMAND")
    return
  }

  if (!content.startsWith(prefix)) {
    if (mentions.members?.has(client.user.id)) {
      logInfo("MENTIONED", message)
      await channel.send(await getReaction("mention", message))
    }
    return
  }

  const { command, args } = parseArgsWithCommand(content, prefix)

  if (!command) {
    logInfo("PREFIX WITH NO COMMAND", message)
    await channel.send(await getReaction("noCommand", message))
    return
  }

  const cmd = getCommand(command)

  if (!cmd) {
    logInfo("INVALID COMMAND", message)
    await channel.send(await getReaction("invalidCommand", message))
    return
  }

  await runCommand(channel, cmd, message, args)
})

client.login(token).catch(() => {
  process.exit()
})
