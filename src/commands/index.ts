import { Dict } from "../type-helpers"
import { Command } from "./types"

import ping from "./ping"
import hello from "./hello"
import server from "./server"
import user from "./user"

export const getCommand = (name: string) => {
  const commands: Dict<Command> = { ping, hello, server, user }
  return commands[name]
}
