import { PlayData } from "../data"
import { Action, ActionResult } from "./types"

type ActionWithParam<T> = (playData: PlayData, param: T) => Promise<ActionResult>

export const withParam =
  <T>(action: ActionWithParam<T>, param: T): Action =>
  (playData: PlayData) =>
    action(playData, param)

export const emptyActionResult = (playData: PlayData) => ({ messages: [], playData, reactions: [] })

export const clampExtra = (extra: number, currentCount: number) =>
  Math.min(Math.max(currentCount + extra, -100), 100) - currentCount

export const getContributions = (countSign: number, contribution: number) => ({
  positive: countSign > 0 ? contribution : 0,
  negative: countSign < 0 ? -contribution : 0,
})
