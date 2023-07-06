import Discord from "discord.js"
import simpleLogger from "simple-node-logger"
import { logMessages } from "./config"

interface Logger {
  info: (message: string) => void
}

let messageLogger: Logger | undefined

if (logMessages) {
  messageLogger = simpleLogger.createRollingFileLogger({
    logDirectory: "data/logs/messages",
    fileNamePattern: "<DATE>.log",
    dateFormat: "YYYY-MM-DD",
    timestampFormat: "HH:mm:ss.SSSZ",
  })
}

const errorLogger = simpleLogger.createRollingFileLogger({
  logDirectory: "data/logs/errors",
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY-MM",
  timestampFormat: "YYYY-MM-DDTHH:mm:ss.SSSZ",
})

const infoLogger = simpleLogger.createRollingFileLogger({
  logDirectory: "data/logs/info",
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY-MM-DD",
  timestampFormat: "HH:mm:ss.SSSZ",
})

const formatMessage = ({ channel, guild, author, cleanContent, embeds }: Discord.Message) => {
  const channelStr = [Discord.ChannelType.DM, Discord.ChannelType.GroupDM].includes(channel.type)
    ? "DM"
    : `${guild?.name || "unknown"}#${(<Discord.GuildChannel>channel).name}`
  const content = embeds.length ? (cleanContent ? `_<embed(s)>_ + ${cleanContent}` : "_<embed(s)>_") : cleanContent
  return `\`${channelStr}:${author.tag}\` ${content}`
}

const formatInteraction = ({ channel, guild, user, commandName, options }: Discord.ChatInputCommandInteraction) => {
  const channelStr =
    channel && [Discord.ChannelType.DM, Discord.ChannelType.GroupDM].includes(channel.type)
      ? "DM"
      : `${guild?.name || "unknown"}#${(<Discord.GuildChannel>channel).name}`
  const formattedOptions = JSON.stringify(Object.fromEntries(options.data.map(({ name, value }) => [name, value])))
  return `\`${channelStr}:${user.tag}\` /${commandName} ${formattedOptions}`
}

export const logMessage = (message: Discord.Message) => {
  messageLogger?.info(formatMessage(message))
}

export const logInteraction = (interaction: Discord.ChatInputCommandInteraction) => {
  messageLogger?.info(formatInteraction(interaction))
}

export const logInfo = (
  infoMessage: string,
  { message, interaction }: { message?: Discord.Message; interaction?: Discord.ChatInputCommandInteraction } = {},
) => {
  console.log(infoMessage)
  infoLogger.info(infoMessage)
  if (message) {
    const formattedMessage = formatMessage(message)
    console.log(formattedMessage)
    infoLogger.info(formattedMessage)
  }
  if (interaction) {
    const formattedInteraction = formatInteraction(interaction)
    console.log(formattedInteraction)
    infoLogger.info(formattedInteraction)
  }
}

export const logError = (
  errorMessage: string,
  { message, interaction }: { message?: Discord.Message; interaction?: Discord.ChatInputCommandInteraction } = {},
) => {
  if (message) {
    const formattedMessage = formatMessage(message)
    console.error(formattedMessage)
    errorLogger.error(formattedMessage)
  }
  if (interaction) {
    const formattedInteraction = formatInteraction(interaction)
    console.error(formattedInteraction)
    errorLogger.error(formattedInteraction)
  }
  console.error(errorMessage)
  errorLogger.error(errorMessage)
}
