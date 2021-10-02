import { Dict } from "../../../type-helpers"
import { MessageKey } from "./messages"

export interface PlayMessageResult {
  key: MessageKey
  params?: Dict<unknown>
  kind: "validation" | "info"
  reactions?: string[]
  pin?: boolean
}

export interface PlayResult {
  originalMessage?: { reject?: boolean; reactions?: string[] }
  messages: PlayMessageResult[]
}
