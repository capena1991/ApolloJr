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
  if (message) {
    console.log(formatMessage(message))
  }
  if (interaction) {
    console.log(formatInteraction(interaction))
  }
}

export const logError = (
  errorMessage: string,
  { message, interaction }: { message?: Discord.Message; interaction?: Discord.ChatInputCommandInteraction } = {},
) => {
  if (message) {
    console.error(formatMessage(message))
    errorLogger.error(formatMessage(message))
  }
  if (interaction) {
    console.error(formatInteraction(interaction))
    errorLogger.error(formatInteraction(interaction))
  }
  console.error(errorMessage)
  errorLogger.error(errorMessage)
}
