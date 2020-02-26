import { Command } from "./types"

import { reset as resetUser } from "../userData"

const allowedUsers = ["425379183829581835"]

const reset: Command = {
  name: "reset",
  description: "Resets user data.",
  execute: async ({ channel, author, mentions }, args) => {
    if (!allowedUsers.includes(author.id) || !args.length) {
      return
    }
    mentions.members.forEach((user) => resetUser(user.id))
    channel.send("done")
  },
}

export default reset
