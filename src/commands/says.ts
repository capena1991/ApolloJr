import { Command } from "./types"

const allowedUsers = ["425379183829581835"]

const says: Command = {
  name: "says",
  description: "Shhh.",
  execute: (message, args) => {
    const { channel, author } = message
    if (!allowedUsers.includes(author.id) || !args.length) {
      return
    }
    message.delete()
    channel.send(args.join(" "))
  },
}

export default says
