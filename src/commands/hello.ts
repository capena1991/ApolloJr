import { Command } from "./types"

const hello: Command = {
  name: "hello",
  description: "Greet Apollo Jr. He will appreciate it and answer in kind.",
  execute({ channel }) {
    channel.send("Well, hello there. :smirk:")
  },
}

export default hello
