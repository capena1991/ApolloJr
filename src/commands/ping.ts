import { Command } from "./types"

const ping: Command = {
  name: "ping",
  description: "Ping!",
  execute({ channel }) {
    channel.send("Pong.")
  },
}

export default ping
