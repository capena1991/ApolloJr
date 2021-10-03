import { admins } from "../../utilities/config"
import { Command } from "../types"

const says: Command = {
  name: "says",
  description: "Shhh.",
  runOnMessage: (message, args) => {
    const { channel, author } = message
    if (!admins.includes(author.id) || !args.length) {
      return
    }
    message.delete()
    channel.send(args.join(" "))
  },
}

export default says
