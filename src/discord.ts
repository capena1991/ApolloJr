import Discord from "discord.js"

import { token, prefix } from "./config.json"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

const getUserInfo = (user: Discord.User) =>
  [`${user.username}'s ID: ${user.id}`, `${user.username}'s avatar: ${user.displayAvatarURL}`].join("\n")

client.on("message", ({ content, channel, guild, author, mentions }) => {
  if (!content.startsWith(prefix) || author.bot) {
    return
  }

  const args = content.slice(prefix.length).split(/\s+/)
  const command = args.shift()?.toLowerCase()

  if (!command) {
    channel.send("You talkin' to me?")
  } else if (command === "ping") {
    channel.send("Pong.")
  } else if (command === "server") {
    channel.send(`Server name: ${guild.name}\nTotal members: ${guild.memberCount}`)
  } else if (command === "user") {
    const users = mentions.users.size ? mentions.users.array() : [author]
    const message = users.map((u) => getUserInfo(u)).join("\n\n")
    channel.send(message)
  }
})

client.login(token)
