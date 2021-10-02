import Discord from "discord.js"

import { Dict } from "@app/type-helpers"
import { alts, negativeRole, positiveRole } from "../../../utilities/config"
import { PlayData } from "./data"
import { MessageKey } from "./messages"
import { PlayResult } from "./types"

const getRequiredRole = (diff: 1 | -1) => (diff === 1 ? positiveRole : negativeRole)

const failValidate = (messageKey: MessageKey, params?: Dict<unknown>): [false, PlayResult] => [
  false,
  { originalMessage: { reject: true }, messages: [{ key: messageKey, params, kind: "validation" }] },
]

export const validatePlay = (
  member: Discord.GuildMember,
  number: number,
  { currentRound }: PlayData,
): [boolean, PlayResult | null] => {
  const user = member.user

  if (alts.includes(user.id)) {
    return failValidate("alt")
  }

  if (!Number.isFinite(number)) {
    return failValidate("invalidNumber")
  }

  const diff = number - currentRound.count
  if (diff !== 1 && diff !== -1) {
    return failValidate("wrongCount", { count: currentRound.count })
  }

  if (currentRound.last.user === user.id) {
    return failValidate("countTwice")
  }

  if (!member?.roles.cache.has(getRequiredRole(diff))) {
    return failValidate("wrongTeam")
  }

  return [true, null]
}
