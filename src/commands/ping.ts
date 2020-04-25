import { Command } from "./types"

const ping: Command = {
  name: "ping",
  description: "Ping me to check whether I'm listening.",
  execute: async ({ channel, client, createdTimestamp }) => {
    const base = "I'm awake! I'm awake. Just resting my eyes for a bit."
    let message = await channel.send(base)
    if (Array.isArray(message)) {
      message = message[0]
    }
    const botPing = message.createdTimestamp - createdTimestamp
    message.edit(
      base +
        "\nIf you doubt me, check out these amazing ~~or not~~ reaction times:\n" +
        `**My ping**: ${Math.round(botPing)}ms  **API ping**: ${Math.round(client.ws.ping)}ms`,
    )
  },
}

export default ping
