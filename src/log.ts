import Discord from "discord.js"

const logsChannelId = "681709479921975321"

export const log = ({ client, channel, guild, author, content }: Discord.Message) => {
  if (channel.id === logsChannelId) {
    return
  }
  const logChannel = <Discord.TextChannel>client.channels.get(logsChannelId)
  const channelStr = ["dm", "group"].includes(channel.type)
    ? "DM"
    : `${guild.name}#${(<Discord.GuildChannel>channel).name}`
  logChannel.send(`\`${channelStr}:${author.tag}\` ${content}`)
}
