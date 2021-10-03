import { Command } from "../types"

import { admins } from "../../utilities/config"
import { users } from "../../data/userData"

const reset: Command = {
  name: "reset",
  description: "Resets user data.",
  runOnMessage: async ({ channel, author, mentions }, args) => {
    if (!admins.includes(author.id) || !args.length) {
      return
    }
    // TODO: reset info in other collections as well
    mentions.members?.forEach((user) => users.reset(user.id))
    channel.send("done")
  },
}

export default reset
