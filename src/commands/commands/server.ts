import Discord from "discord.js"
import { DateTime } from "luxon"

import { Command } from "../types"

const TIER_LABEL = {
  NONE: "No Level",
  TIER_1: "Level 1",
  TIER_2: "Level 2",
  TIER_3: "Level 3",
}

const run = (guild: Discord.Guild | null) => {
  if (!guild) {
    return "Where am I? I can't see the server."
  }

  const { name, createdAt, premiumTier, ownerId, memberCount, channels } = guild
  const createdDt = DateTime.fromJSDate(createdAt)
  let embed = new Discord.MessageEmbed()
    .setTitle("About this server")
    .setDescription(`**${name}**`)
    .addField("Created", `${createdDt.toLocaleString(DateTime.DATE_MED)}\n(${createdDt.toRelative()})`, true)
    .addField("Boost", TIER_LABEL[premiumTier], true)
    .addField("Owner", `<@${ownerId}>`, true)
    .addField("Total members", memberCount.toString(), true)
    .addField("Total channels", channels?.cache.size.toString() ?? "unknown", true)

  const icon = guild.iconURL({ size: 4096, dynamic: true })
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
