import Discord from "discord.js"

import {
  getMessageCommand,
  getChannelCommand,
  findConditionalCommand,
  getInteractionCommand,
  registerCommands,
} from "./commands"
import { getReaction } from "./reactions"
import { token, prefix } from "./utilities/config"
import { logMessage, logInfo } from "./utilities/log"
import { notifyBirthday1Day, notifyBirthday1Week } from "./utilities/birthdayNotifications"
import { parseArgs, parseArgsWithCommand, schedule } from "./utilities/utils"
import { MessageCommand } from "./commands"
import { isRepliableMessage, RepliableMessage, SendableChannel } from "./utilities/discord"

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMessageReactions,
  ],
})

const runMessageCommand = (
  channel: SendableChannel,
  command: MessageCommand,
  message: RepliableMessage,
  args: string[],
  commandType = "COMMAND",
) => {
  try {
    logInfo(`EXECUTING ${commandType} ${command.name}`, message)
    return command.runOnMessage(message, args)
  } catch (error) {
    console.error(error)
    return channel.send("Oops! There was an error trying to execute that command! :disappointed:")
  }
}

client.on("ready", async () => {
  if (!client.user) {
    throw `Logged in but no user.`
  }
  console.log(`Logged in as ${client.user?.tag}!`)
  client.user.setPresence({
    status: "online",
    activities: [{ name: "all of you.", type: Discord.ActivityType.Listening }],
  })

  const application = client.application
  if (application) {
    await registerCommands(application.commands)
  }

  schedule(notifyBirthday1Day, 3600000, client)
  schedule(notifyBirthday1Week, 3600000, client)
})

client.on("messageCreate", async (message) => {
  if (!client.user) {
    throw Error("Logged in but no user.")
  }

  if (!isRepliableMessage(message)) {
    console.error("Unable to run command on stage channel.")
    return
  }

  const { content, channel, author, mentions } = message

  logMessage(message)

  if (author.bot) {
    return
  }

  const channelCommand = getChannelCommand(channel.id)
  if (channelCommand) {
    const args = parseArgs(content)
    await runMessageCommand(channel, channelCommand, message, args, "CHANNEL COMMAND")
    return
  }

  const conditionalCommand = findConditionalCommand(message)
  if (conditionalCommand) {
    const args = parseArgs(content)
    await runMessageCommand(channel, conditionalCommand, message, args, "CHANNEL COMMAND")
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

  const cmd = getMessageCommand(command)

  if (!cmd) {
    logInfo("INVALID COMMAND", message)
    await channel.send(await getReaction("invalidCommand", message))
    return
  }

  await runMessageCommand(channel, cmd, message, args)
})

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return
  }

  const { commandName } = interaction

  const command = getInteractionCommand(commandName)

  if (!command) {
    logInfo("INVALID SLASH COMMAND: ${commandName}")
    await interaction.reply(await getReaction("invalidCommand"))
    return
  }

  try {
    logInfo(`EXECUTING SLASH COMMAND ${command.name}`)
    await command.runOnInteraction(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply("Oops! There was an error trying to execute that command! :disappointed:")
  }
})

client.login(token).catch(() => {
  process.exit()
})
