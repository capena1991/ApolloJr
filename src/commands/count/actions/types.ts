import { PlayData } from "../data"
import { PlayMessageResult } from "../types"

export interface ActionResult {
  messages: PlayMessageResult[]
  reactions: string[]
  playData: PlayData
}

export type Action = (playData: PlayData) => Promise<ActionResult>
