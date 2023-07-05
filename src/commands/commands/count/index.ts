import { MessageCommand } from "../../types"
import { TaskQueueHandler } from "../../../utilities/queue"
import { pinMessage, RepliableMessage } from "../../../utilities/discord"
import { play } from "./game"
import { getMessage } from "./messages"

const doCount = async (message: RepliableMessage, args: string[]) => {
  const { channel, author, member } = message

  if (!member) {
    throw Error("This will never happen because this command will always run in a server channel")
  }

  const number = parseInt(args[0])

  const { originalMessage, messages: resultMessages } = await play(member, number)

  if (originalMessage?.reject) {
    await message.delete()
  } else if (originalMessage?.reactions) {
    for (const reaction of originalMessage.reactions) {
      await message.react(reaction)
    }
  }

  for (const { key, params, reactions, pin, kind } of resultMessages) {
    const msg = getMessage(key, author.id, params)
    const destination = kind === "validation" ? author : channel
    const sentMessage = await destination.send(msg)
    for (const r of reactions ?? []) {
      await sentMessage.react(r)
    }
    if (pin) {
      await pinMessage(sentMessage)
    }
  }
}

const queue = new TaskQueueHandler<void>()

const count: MessageCommand = {
  name: "count",
  description: "The game of count. Two teams try to get the count to either 100 or -100",
  runOnMessage: async (message, args) => {
    queue.enqueue(() => doCount(message, args))
  },
}

export default count
