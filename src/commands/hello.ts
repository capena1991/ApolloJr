import { Command } from "./types"
import { getSpecialNickname } from "../utilities/specialPeople"

const hello: Command = {
  name: "hello",
  description: "Greet me. I will appreciate it and answer in kind.",
  execute: ({ channel, author }) => {
    channel.send(`Well, hello there${getSpecialNickname(author.id)}. :smirk:`)
  },
}

export default hello
