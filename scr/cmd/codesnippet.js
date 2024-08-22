const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "codesnippet",
    description: "Generates an image from a code snippet",
    usage: "!codesnippet <code>",
    cooldown: 5,
    accessableby: 0,
    category: "utility",
    prefix: true,
  },
  start: async function ({ text, react, reply, api }) {
    try {
      const codeSnippet = text.join(" ");

      if (!codeSnippet) {
        return reply("Please provide a code snippet to generate an image.");
      }

      const options = {
        method: 'GET',
        url: 'https://www.samirxpikachu.run.place/snippet',
        params: { code: codeSnippet },
        responseType: 'arraybuffer' // Download the image as binary data
      };

      const { data } = await axios.request(options);

      const imagePath = path.join(__dirname, 'generated_codesnippet.jpg');
      
      fs.writeFileSync(imagePath, data); // Save the image locally

      await react("✅");

      await reply({
        body: "Here is your code snippet:",
        attachment: fs.createReadStream(imagePath) // Send the image as an attachment
      });

      fs.unlinkSync(imagePath); // Delete the image after sending

    } catch (error) {
      console.error(error);
      return reply("An error occurred while generating the snippet image.");
    }
  },
  auto: async function ({ event, reply }) {}
};
