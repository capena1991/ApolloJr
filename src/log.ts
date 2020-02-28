import Discord from "discord.js"
import simpleLogger from "simple-node-logger"
import moment from "moment"

const logger = simpleLogger.createRollingFileLogger({
  logDirectory: "../data/logs/messages",
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY.MM.DD",
})

const formatMessage = ({ channel, guild, author, cleanContent, embeds }: Discord.Message) => {
  const channelStr = ["dm", "group"].includes(channel.type)
    ? "DM"
    : `${guild.name}#${(<Discord.GuildChannel>channel).name}`
  const content = embeds.length ? (cleanContent ? `_<embed(s)>_ + ${cleanContent}` : "_<embed(s)>_") : cleanContent
  return `\`${channelStr}:${author.tag}\` ${content}`
}

export const logMessage = (message: Discord.Message) => {
  logger.info(formatMessage(message))
}

export const logInfo = (infoMessage: string, message: Discord.Message) => {
  console.log(`${moment().toISOString(true)} ${infoMessage}\n${formatMessage(message)}`)
}
