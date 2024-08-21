const axios = require('axios');

module.exports = {
  config: {
    name: "lens",
    description: "Search for images and display results from source URL",
    usage: "Reply to an image or provide an image URL",
    cooldown: 5,
    accessableby: 0,
    category: "UTILITY",
    prefix: true,
    author: "Churchill"
  },
  start: async function ({ api, text, event, reply }) {
    let imageUrl;

    if (event.messageReply && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    } else if (text.length > 0) {
      imageUrl = text[0];
    } else {
      return reply("Please reply to an image or provide an image URL.");
    }

    try {
      const response = await axios.get(`https://samirxpikachuio.onrender.com/glens?url=${encodeURIComponent(imageUrl)}`);
      const results = response.data.slice(0, 6);

      if (results.length > 0) {
        const trackInfo = results.map((result, index) => 
          `${index + 1}. ${result.title}\nURL: ${result.link}\n`
        ).join("\n\n");

        const thumbnails = results.map(result => result.thumbnail);
        const attachments = await Promise.all(
          thumbnails.map(thumbnail => 
            global.utils.getStreamFromURL(thumbnail)
          )
        );

        await reply({
          body: `${trackInfo}`,
          attachment: attachments
        });
      } else {
        reply("No results found for the given image.");
      }
    } catch (error) {
      console.error(error);
      reply("An error occurred while fetching image search results.");
    }
  }
};
