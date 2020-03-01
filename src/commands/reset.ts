import { Command } from "./types"

import { userData } from "../data/userData"

const allowedUsers = ["425379183829581835"]

const reset: Command = {
  name: "reset",
  description: "Resets user data.",
  execute: async ({ channel, author, mentions }, args) => {
    if (!allowedUsers.includes(author.id) || !args.length) {
      return
    }
    mentions.members.forEach((user) => userData.reset(user.id))
    channel.send("done")
  },
}

export default reset
