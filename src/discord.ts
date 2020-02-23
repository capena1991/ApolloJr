import Discord from "discord.js"

import auth from "./config.json"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", ({ content, channel }) => {
  if (content === "!ping") {
    channel.send("Pong.")
  }
})

client.login(auth.token)
