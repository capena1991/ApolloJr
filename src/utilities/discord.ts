import Discord from "discord.js"

export type SendableChannel = Exclude<Discord.TextBasedChannel, Discord.StageChannel>
export type RepliableMessage = Discord.Message & { channel: SendableChannel }

export const isSendableChannel = (channel: Discord.TextBasedChannel): channel is SendableChannel =>
  channel.type !== Discord.ChannelType.GuildStageVoice

export const isRepliableMessage = (message: Discord.Message): message is RepliableMessage =>
  isSendableChannel(message.channel)
