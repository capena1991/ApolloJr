import { Command } from "./types"

const shop: Command = {
  name: "shop",
  aliases: ["buy"],
  description: "The shop is open for business! Come buy all kinds of stuff.",
  execute: ({ channel }) => {
    channel.send("This is the shop placeholder.")
  },
}

export default shop
