import { Command } from "./types"

const inventory: Command = {
  name: "inventory",
  aliases: ["inv", "items"],
  description:
    "Whether you're a hoarder or just have that one item you bough once, you can check your possesions with this.",
  execute: ({ channel }) => {
    channel.send("This is the inventory placeholder.")
  },
}

export default inventory
