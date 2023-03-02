import Discord from "discord.js"
import axios from "axios"
import cheerio from "cheerio"

import { ConditionalCommand } from "../types"
import { gifChannels } from "../../utilities/config"

const gifLinkRe = /^https:\/\/tenor.com\/view\//

const gif: ConditionalCommand = {
  name: "gif",
  description: "Replaces a gif link with a visible one in channels where media is not allowed.",
  condition: ({ channel, content }) => gifChannels.includes(channel.id) && gifLinkRe.test(content),
  runOnMessage: async ({ channel, author }, args) => {
    const [url] = args
    let gifUrl
    try {
      const { data } = await axios.get(url)
      const $ = cheerio.load(data)
      gifUrl = $('head>link[rel="image_src"]').attr("href")
    } catch (error) {
      console.error(error)
    }
    if (!gifUrl) {
      return
    }
    const embed = new Discord.EmbedBuilder().setDescription(`GIF from <@${author.id}>`).setImage(gifUrl)
    return channel.send({ embeds: [embed] })
  },
}

export default gif
