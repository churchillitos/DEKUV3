const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "flux",
    description: "Generate an image using the Flux API based on your prompt",
    usage: "flux [your prompt here]",
    cooldown: 5,
    accessableby: 0,
    category: "IMAGE",
    prefix: true,
    author: "Chilli"
  },
  start: async function ({ api, text, event, reply }) {
    if (text.length === 0) {
      return reply("Please provide a prompt to generate an image. Example: `!flux a beautiful sunset over the ocean`");
    }

    const prompt = text.join(" ");
    const url = `https://samirxpikachuio.onrender.com/flux?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
      });

      const imagePath = path.join(__dirname, 'flux_image.jpg');
      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer);

      writer.on('finish', async () => {
        await reply({
          body: "Here's your generated image:",
          attachment: fs.createReadStream(imagePath)
        });

        // Clean up by deleting the image after sending
        fs.unlinkSync(imagePath);
      });

      writer.on('error', () => {
        reply("An error occurred while saving the image.");
      });

    } catch (error) {
      console.error(error);
      reply("An error occurred while generating the image.");
    }
  }
};
