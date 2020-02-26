import Discord from "discord.js"
import simpleLogger from "simple-node-logger"

const logger = simpleLogger.createRollingFileLogger({
  logDirectory: "../data/logs/messages",
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY.MM.DD",
})

export const logMessage = ({ channel, guild, author, cleanContent, embeds }: Discord.Message) => {
  const channelStr = ["dm", "group"].includes(channel.type)
    ? "DM"
    : `${guild.name}#${(<Discord.GuildChannel>channel).name}`
  const content = embeds.length ? (cleanContent ? `_<embed(s)>_ + ${cleanContent}` : "_<embed(s)>_") : cleanContent
  logger.info(`\`${channelStr}:${author.tag}\` ${content}`)
}
