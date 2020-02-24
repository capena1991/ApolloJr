import Discord from "discord.js"
import moment from "moment"

import { Command } from "./types"

const server: Command = {
  name: "server",
  description: "Shows you stuff that you might not know about this server.",
  execute({ channel, guild: { name, iconURL, splashURL, createdAt, region, ownerID, memberCount, channels } }) {
    const embed = new Discord.RichEmbed()
      .setTitle("About this server")
      .setDescription(`**${name}**`)
      .setThumbnail(iconURL)
      .setImage(splashURL)
      .addField("Created", `${moment(createdAt).format("ll")} (${moment(createdAt).fromNow()})`, true)
      .addField("Region", region, true)
      .addField("Owner", `<@${ownerID}>`, true)
      .addField("Total members", memberCount, true)
      .addField("Total channels", channels.size, true)
    channel.send(embed)
  },
}

export default server
