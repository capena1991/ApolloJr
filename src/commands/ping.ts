import { Command } from "./types"

const ping: Command = {
  name: "ping",
  description: "Ping Apollo Jr. to check whether he's listening.",
  execute({ channel }) {
    channel.send("Pong.")
  },
}

export default ping
