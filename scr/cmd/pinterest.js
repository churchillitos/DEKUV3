const axios = require('axios');
const path = require('path');

module.exports = {
  config: {
    name: "pinterest",
    description: "Search and send Pinterest images based on a query.",
    usage: "pinterest <query> - <number_of_images>",
    cooldown: 5,
    accessableby: 0,
    category: "media",
    prefix: true
  },
  start: async function ({ api, text, react, event, reply }) {
    try {
      const chilli = text.join(" ");
      const pogi = chilli.split(" - ");
      const lubo = pogi[0].trim();
      const mantika = parseInt(pogi[1]);

      if (!lubo || isNaN(mantika) || mantika < 1 || mantika > 20) {
        return reply("Please provide a valid search query and number of images using the format: pinterest <query> - <number>");
      }

      react("🔍");

      const pangit = await axios.get(`${global.deku.ENDPOINT}/pinterest?q=${encodeURIComponent(lubo)}`);
      if (pangit.data.status !== 200) {
        return reply("Failed to fetch images. Please try again later.");
      }

      const pogiResult = pangit.data.result.slice(0, mantika);

      let attachments = [];

      for (let i = 0; i < pogiResult.length; i++) {
        const pogiUrl = pogiResult[i];
        
        // Fetch image and store in a buffer
        const imageResponse = await axios.get(pogiUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        // Push the buffer directly to the attachments array
        attachments.push({
          name: `pinterest_${i}.jpg`,
          attachment: imageBuffer
        });
      }

      // Send the images as attachments to Discord
      api.sendMessage({
        body: `Here are your ${mantika} images for "${lubo}":`,
        attachment: attachments
      }, event.threadID);

    } catch (error) {
      console.error('Error:', error.message); // Improved error logging
      reply("An error occurred while fetching the images. Please try again later.");
    }
  }
}
