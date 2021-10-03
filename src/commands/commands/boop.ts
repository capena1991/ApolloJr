import Discord from "discord.js"

import { Command } from "../types"
import { chooseOne, pluralize } from "../../utilities/utils"

const gifs = [
  "https://media1.tenor.com/images/083ccb85ea107a76b5030cbcb43cbf36/tenor.gif?itemid=7296714",
  "https://media1.tenor.com/images/4dc6c461cf0cacf8e7a6b4ace3f6813e/tenor.gif?itemid=5550498",
  "https://media1.tenor.com/images/3c8fec53a458eabf30e84b697848c169/tenor.gif?itemid=11159084",
  "https://media1.tenor.com/images/db72e923d5642a53ad06bb9bebdcfe43/tenor.gif?itemid=13734104",
]

const boop: Command = {
  name: "boop",
  description: "Want to mildly annoy someone in a cute and wholesome way? I got your back.",
  runOnMessage: ({ channel, author, mentions }) => {
    if (!mentions.users.size) {
      return channel.send(
        "Who do you want to boop? If you can't think of someone I offer myself as volunteer. :slight_smile:",
      )
    }
    const have = pluralize(mentions.users.size, "has", "have")
    const embed = new Discord.MessageEmbed()
      .setDescription(`${mentions.users.map(({ id }) => `<@${id}>`).join(", ")} ${have} been booped by <@${author.id}>`)
      .setImage(chooseOne(gifs))
    return channel.send({ embeds: [embed] })
  },
}

export default boop
