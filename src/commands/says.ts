import { Command } from "./types"

const allowedUsers = ["425379183829581835"]

const says: Command = {
  name: "says",
  description: "Shhh.",
  execute: ({ channel, author }, args) => {
    if (!allowedUsers.includes(author.id) || !args.length) {
      return
    }
    channel.bulkDelete(1)
    channel.send(args.join(" "))
  },
}

export default says
