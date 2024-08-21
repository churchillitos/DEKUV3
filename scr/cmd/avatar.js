const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "avatar",
    description: "Generate a custom avatar image with specified parameters.",
    usage: "avatar [id | bgtext | signature | color]",
    cooldown: 5,
    accessableby: 0,
    category: "IMAGE",
    prefix: true,
    author: "Churchill"
  },
  start: async function ({ api, text, event, reply }) {
    // Parse the user input based on the '|' delimiter
    const [id, bgtext, signature, color] = text.join(" ").split(" | ").map(item => item.trim());

    // Validate the inputs
    if (!id || !bgtext || !signature || !color) {
      return reply("Please provide all parameters: id 1 to 800 lang | bgtext | signature | color. Example: `avatar 4 | Joshua | Joshua Sy | black`");
    }

    // Construct the API URL with user-provided inputs
    const url = `https://deku-rest-api-3jvu.onrender.com/canvas/avatarv2?id=${encodeURIComponent(id)}&bgtext=${encodeURIComponent(bgtext)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;

    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
      });

      const imagePath = path.join(__dirname, 'avatar_image.jpg');
      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer);

      writer.on('finish', async () => {
        await reply({
          body: "Here's your custom avatar:",
          attachment: fs.createReadStream(imagePath)
        });

        // Clean up by deleting the image after sending
        fs.unlinkSync(imagePath);
      });

      writer.on('error', () => {
        reply("An error occurred while saving the avatar image.");
      });

    } catch (error) {
      console.error(error);
      reply("An error occurred while generating the avatar image.");
    }
  }
};
