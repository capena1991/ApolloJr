import Discord from "discord.js"

import auth from "./config.json"

const client = new Discord.Client()

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(auth.token)
