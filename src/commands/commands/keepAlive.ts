import { MessageCommand } from "../types"

const keepAlive: MessageCommand = {
  name: "keepAlive",
  description: "React to ping to stay alive.",
  allowsBots: true,
  runOnMessage: async (message) => {
    await message.channel.send("ack")
  },
}

export default keepAlive
