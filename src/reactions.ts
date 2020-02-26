import Discord from "discord.js"

const reasons = {
  mention: (_message: Discord.Message) => "Who's calling me? :eyes:",
  noCommand: (_message: Discord.Message) => "You talkin' to me? :face_with_raised_eyebrow:",
  invalidCommand: (_message: Discord.Message) => "That's not a valid command. What are you trying to do? :unamused:",
}

export const getReaction = (reason: "mention" | "noCommand" | "invalidCommand", message: Discord.Message) =>
  reasons[reason](message)
