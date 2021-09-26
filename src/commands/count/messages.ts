import { Dict } from "../../type-helpers"
import { nicePeople } from "../../utilities/config"

const messages = {
  invalidNumber: {
    nice: () => "Sorry, but I didn't recognize that number. Would you be so kind to try again?",
    sassy: () =>
      "We mean business in the counting channel. Valid numbers. Yours was not.\n" +
      "Leave the idle chit chat for another channel.",
  },
  wrongCount: {
    nice: ({ count }: { count?: number }) =>
      `Hmmm, so... I think the last number was ${count}. I might be wrong, but can you please count from there.`,
    sassy: ({ count }: { count?: number }) =>
      `Try again, pal. Last count was **${count}**. :rolling_eyes:\n` +
      "If I've said this to you too many times, maybe you should consider going back to elementary school. :wink:",
  },
  countTwice: {
    nice: () =>
      "I like you but I can't break the rules for you. What would people say if I let you count twice in a row?",
    sassy: () => "Nice try :smirk:, but you gotta let others play. Can't count twice in a row.",
  },
  rateLimit: {
    nice: ({ remaining }: { remaining?: string }) =>
      "I'm so sorry for having to say this... You're so nice and I'm here being annoying...\n" +
      `But can you please try again **${remaining}**, if it's not too much trouble?`,
    sassy: ({ remaining }: { remaining?: string }) =>
      "Not so fast! That's too many times you've tried recently.\n" + `Try again **${remaining}**.`,
  },
  wrongTeam: {
    nice: () =>
      "Sorry, I'm confused. I thought you weren't on that team. I'm so sorry, I probably messed it up." +
      "Would you be so kind to pick your team again?",
    sassy: () => "You're not on the right team. Pick your side first.",
  },
  alt: {
    nice: () => "You're banned from counting. Reason: suspicion of being alt account.",
    sassy: () => "You're banned from counting. Reason: suspicion of being alt account.",
  },
  penalty: {
    nice: ({ userId, count, penaltyText }: { userId?: string; count?: number; penaltyText?: string }) =>
      `${count} **penalty!** _for <@${userId}> _(_${penaltyText}_)`,
    sassy: ({ userId, count, penaltyText }: { userId?: string; count?: number; penaltyText?: string }) =>
      `${count} **penalty!** _for <@${userId}> _(_${penaltyText}_)`,
  },
  bonus: {
    nice: ({ userId, count, bonusText }: { userId?: string; count?: number; bonusText?: string }) =>
      `${count} **bonus!** _for <@${userId}> _(_${bonusText}_)`,
    sassy: ({ userId, count, bonusText }: { userId?: string; count?: number; bonusText?: string }) =>
      `${count} **bonus!** _for <@${userId}> _(_${bonusText}_)`,
  },
  winner: {
    nice: ({ winner }: { winner?: string }) => `${winner} win this round! :tada:`,
    sassy: ({ winner }: { winner?: string }) => `${winner} win this round! :tada:`,
  },
  rewards: {
    nice: ({ rewards }: { rewards?: Array<{ user: string; reward: string }> }) =>
      `**Rewards:**\n${rewards?.map(({ user, reward }) => `<@${user}> earned ${reward} drachmae`).join("\n")}`,
    sassy: ({ rewards }: { rewards?: Array<{ user: string; reward: string }> }) =>
      `**Rewards:**\n${rewards?.map(({ user, reward }) => `<@${user}> earned ${reward} drachmae`).join("\n")}`,
  },
  rewardsLost: {
    nice: ({ lostRewards }: { lostRewards?: Array<{ user: string; reward: string }> }) =>
      `**Rewards lost:**\n${lostRewards
        ?.map(({ user, reward }) => `<@${user}> did **not** earn ${reward} drachmae`)
        .join("\n")}`,
    sassy: ({ lostRewards }: { lostRewards?: Array<{ user: string; reward: string }> }) =>
      `**Rewards lost:**\n${lostRewards
        ?.map(({ user, reward }) => `<@${user}> did **not** earn ${reward} drachmae`)
        .join("\n")}`,
  },
  newRound: {
    nice: ({ roundNumber }: { roundNumber?: number }) => `Round ${roundNumber} starts now.`,
    sassy: ({ roundNumber }: { roundNumber?: number }) => `Round ${roundNumber} starts now.`,
  },
  zero: {
    nice: () => "0",
    sassy: () => "0",
  },
  nextCount: {
    nice: ({ inTime, userId }: { inTime?: string; userId?: string }) =>
      `:stopwatch: _Next **${inTime}** for <@${userId}> _`,
    sassy: ({ inTime, userId }: { inTime?: string; userId?: string }) =>
      `:stopwatch: _Next **${inTime}** for <@${userId}> _`,
  },
}

export type MessageKey = keyof typeof messages

export const getMessage = (kind: MessageKey, userId: string, params: Dict<unknown> = {}) =>
  messages[kind][nicePeople.includes(userId) ? "nice" : "sassy"](params)
