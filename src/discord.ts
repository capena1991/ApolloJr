import Discord from "discord.js"

import { token, prefix } from "./config.json"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", ({ content, channel }) => {
  if (content === `${prefix}ping`) {
    channel.send("Pong.")
  }
})

client.login(token)
