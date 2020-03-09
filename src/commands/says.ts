import { Command } from "./types"

import { admins } from "../config.json"

const says: Command = {
  name: "says",
  description: "Shhh.",
  execute: (message, args) => {
    const { channel, author } = message
    if (!admins.includes(author.id) || !args.length) {
      return
    }
    message.delete()
    channel.send(args.join(" "))
  },
}

export default says
