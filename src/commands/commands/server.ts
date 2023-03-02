import Discord from "discord.js"
import { DateTime } from "luxon"

import { Command } from "../types"

const TIER_LABEL = {
  [Discord.GuildPremiumTier.None]: "No Level",
  [Discord.GuildPremiumTier.Tier1]: "Level 1",
  [Discord.GuildPremiumTier.Tier2]: "Level 2",
  [Discord.GuildPremiumTier.Tier3]: "Level 3",
}

const run = (guild: Discord.Guild | null) => {
  if (!guild) {
    return "Where am I? I can't see the server."
  }

  const { name, createdAt, premiumTier, ownerId, memberCount, channels } = guild
  const createdDt = DateTime.fromJSDate(createdAt)
  let embed = new Discord.EmbedBuilder()
    .setTitle("About this server")
    .setDescription(`**${name}**`)
    .addFields(
      {
        name: "Created",
        value: `${createdDt.toLocaleString(DateTime.DATE_MED)}\n(${createdDt.toRelative()})`,
        inline: true,
      },
      { name: "Boost", value: TIER_LABEL[premiumTier], inline: true },
      { name: "Owner", value: `<@${ownerId}>`, inline: true },
      { name: "Total members", value: memberCount.toString(), inline: true },
      { name: "Total channels", value: channels?.cache.size.toString() ?? "unknown", inline: true },
    )

  const icon = guild.iconURL({ size: 4096, forceStatic: false })
  if (icon) {
    embed = embed.setThumbnail(icon)
  }

  const splash = guild.splashURL({ size: 4096 })
  if (splash) {
    embed = embed.setImage(splash)
  }

  return { embeds: [embed] }
}

const server: Command = {
  name: "server",
  description: "I'll show you stuff that you might not know about this server.",
  runOnMessage: ({ channel, guild }) => channel.send(run(guild)),
  runOnInteraction: (interaction) => interaction.reply(run(interaction.guild)),
}

export default server
