import Discord from "discord.js"
import simpleLogger from "simple-node-logger"
import { isDev } from "./config"

interface Logger {
  info: (message: string) => void
}

let logger: Logger

if (isDev()) {
  logger = simpleLogger.createRollingFileLogger({
    logDirectory: "data/logs/messages",
    fileNamePattern: "<DATE>.log",
    dateFormat: "YYYY.MM.DD",
  })
} else {
  logger = {
    info: () => {
      // do nothing
    },
  }
}

const formatMessage = ({ channel, guild, author, cleanContent, embeds }: Discord.Message) => {
  const channelStr = [Discord.ChannelType.DM, Discord.ChannelType.GroupDM].includes(channel.type)
    ? "DM"
    : `${guild?.name || "unknown"}#${(<Discord.GuildChannel>channel).name}`
  const content = embeds.length ? (cleanContent ? `_<embed(s)>_ + ${cleanContent}` : "_<embed(s)>_") : cleanContent
  return `\`${channelStr}:${author.tag}\` ${content}`
}

export const logMessage = (message: Discord.Message) => {
  logger.info(formatMessage(message))
}

export const logInfo = (infoMessage: string, message: Discord.Message | undefined = undefined) => {
  console.log(infoMessage)
  if (message) {
    console.log(formatMessage(message))
  }
}
