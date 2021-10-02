import { PlayData } from "../data"
import { Action, ActionResult } from "./types"

export const executeActions = async (actions: Action[], playData: PlayData) => {
  const result: ActionResult = { messages: [], reactions: [], playData }

  for (const act of actions) {
    const { messages, reactions, playData } = await act(result.playData)
    result.messages.push(...messages)
    result.reactions.push(...reactions)
    result.playData = playData
  }

  return result
}
