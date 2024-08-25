const axios = require('axios');
const fs = require('fs');
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
  start: async function ({ api, text, react, event, reply, User }) {
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
        const pogiPath = path.resolve(__dirname, 'temp', `pinterest_${i}.jpg`);

        const pangit = await axios.get(pogiUrl, { responseType: 'stream' });
        pangit.data.pipe(fs.createWriteStream(pogiPath));

        await new Promise((resolve) => {
          pangit.data.on('end', resolve);
        });

        attachments.push(fs.createReadStream(pogiPath));
      }

      api.sendMessage({
        body: `Here are your ${mantika} images for "${lubo}":`,
        attachment: attachments
      }, event.threadID);

      for (let i = 0; i < attachments.length; i++) {
        fs.unlinkSync(attachments[i].path);
      }

    } catch (error) {
      console.error(error);
      reply("An error occurred while fetching the images. Please try again later.");
    }
  }
}
