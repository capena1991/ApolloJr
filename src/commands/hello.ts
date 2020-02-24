import { Command } from "./types"

const hello: Command = {
  name: "hello",
  description: "Says hello back",
  execute({ channel }) {
    channel.send("Well, hello there. :smirk:")
  },
}

export default hello
