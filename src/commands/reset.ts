import { Command } from "./types"

import { admins } from "../config.json"
import { users } from "../data/userData"

const reset: Command = {
  name: "reset",
  description: "Resets user data.",
  execute: async ({ channel, author, mentions }, args) => {
    if (!admins.includes(author.id) || !args.length) {
      return
    }
    mentions.members.forEach((user) => users.reset(user.id))
    channel.send("done")
  },
}

export default reset
