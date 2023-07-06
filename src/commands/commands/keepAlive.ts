import { sleep } from "../../utilities/utils"
import { MessageCommand } from "../types"

const keepAlive: MessageCommand = {
  name: "keepAlive",
  description: "React to ping to stay alive.",
  allowsBots: true,
  runOnMessage: async ({ channel }) => {
    await sleep(60000)
    await channel.send("ping")
  },
}

export default keepAlive
