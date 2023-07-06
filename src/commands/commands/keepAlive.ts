import { botUserId } from "../../utilities/config"
import { MessageCommand } from "../types"

const keepAlive: MessageCommand = {
  name: "keepAlive",
  description: "React to ping to stay alive.",
  allowsBots: true,
  runOnMessage: async ({ channel, author }) => {
    if (author.id === botUserId) {
      return
    }
    await channel.send("ack")
  },
}

export default keepAlive
