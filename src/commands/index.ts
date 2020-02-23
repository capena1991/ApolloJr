import { Dict } from "../type-helpers"
import { Command } from "./types"

import ping from "./ping"
import server from "./server"
import user from "./user"

export const getCommand = (name: string) => {
  const commands: Dict<Command> = { ping, server, user }
  return commands[name]
}
