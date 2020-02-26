import Discord from "discord.js"
import { get, set } from "./userData"

const mentionReactions = [
  () => "Who's calling me? :eyes:",
  () => "Who's calling me? :eyes:",
  ({ id }: Discord.User) => `Who's call... oh, it's you again. What's up, <@${id}>?`,
  ({ id }: Discord.User) => `Hi, <@${id}>. I see you like saying my name.`,
  () =>
    "Hi, again. You know I have some commands you can use, right? " +
    "I mean, not that I'm complaining. I like being pinged. :blush:",
  () => "I dare you say my name again! :angry:\n~~jk, you know I love it~~",
  () => `Oh, so you really dared say my name again. Why am I not surprised? :smirk:`,
  () => `Ok, mention me one more time and you'll see the consequences.`,
  ({ id }: Discord.User) =>
    "Here are the consequences for mentioning me again. " +
    `<@${id}> I hereby bestow upon you the title of... old friend. :slight_smile:`,
  ({ id }: Discord.User) => `Hi, <@${id}>. How are you, old friend?`,
]

const reasons = {
  mention: async ({ author }: Discord.Message) => {
    const { timesMentioned, ...rest } = await get(author.id)
    set(author.id, { ...rest, timesMentioned: timesMentioned + 1 })
    return mentionReactions[Math.min(timesMentioned, mentionReactions.length - 1)](author)
  },
  noCommand: (_message: Discord.Message) => "You talkin' to me? :face_with_raised_eyebrow:",
  invalidCommand: (_message: Discord.Message) => "That's not a valid command. What are you trying to do? :unamused:",
}

export const getReaction = async (reason: "mention" | "noCommand" | "invalidCommand", message: Discord.Message) =>
  await reasons[reason](message)
