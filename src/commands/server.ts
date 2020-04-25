import Discord from "discord.js"
import moment from "moment"

import { Command } from "./types"

const server: Command = {
  name: "server",
  description: "I'll show you stuff that you might not know about this server.",
  execute: ({ channel, guild }) => {
    if (!guild) {
      return channel.send("Where am I? I can't see the server.")
    }

    const { name, createdAt, region, ownerID, memberCount, channels } = guild
    let embed = new Discord.MessageEmbed()
      .setTitle("About this server")
      .setDescription(`**${name}**`)
      .addField("Created", `${moment(createdAt).format("ll")} (${moment(createdAt).fromNow()})`, true)
      .addField("Region", region, true)
      .addField("Owner", `<@${ownerID}>`, true)
      .addField("Total members", memberCount, true)
      .addField("Total channels", channels?.cache.size || "unknown", true)

    const icon = guild.iconURL({ size: 4096, dynamic: true })
    if (icon) {
      embed = embed.setThumbnail(icon)
    }

    const splash = guild.splashURL({ size: 4096 })
    if (splash) {
      embed = embed.setImage(splash)
    }

    return channel.send(embed)
  },
}

export default server
