import { Command } from "./types"

const ping: Command = {
  name: "ping",
  description: "Ping me to check whether I'm listening.",
  execute({ channel }) {
    channel.send("Pong.")
  },
}

export default ping
