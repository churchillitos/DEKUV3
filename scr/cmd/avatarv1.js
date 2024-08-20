const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "avatarv1",
    description: "Generate avatar v1",
    usage: "avatarv1 <id> | <bgname> | <signature> | <color>",
    cooldown: 5,
    accessableby: 0,
    category: "image",
    prefix: false,
    author: "Churchill"
  },
  start: async function({ api, event, reply, react, args }) {
    try {
      const userInput = args.join(" ").split("|").map(part => part.trim());

      const id = userInput[0];
      const bgname = userInput[1];
      const signature = userInput[2];
      const color = userInput[3];

      if (!id || !bgname || !signature || !color) {
        return reply("Please provide all required parameters in the format: avatarv1 id 1 to 800 | bgname | signature | color");
      }

      const apiUrl = `${global.deku.ENDPOINT}/canvas/avatar?id=${encodeURIComponent(id)}&bgname=${encodeURIComponent(bgname)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;

      await react('⏳');
      reply("Generating avatar, please wait...");

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const avatarPath = path.join(__dirname, "avatar.jpg");

      fs.writeFileSync(avatarPath, response.data);

      api.sendMessage({
        body: "Here is your avatar:",
        attachment: fs.createReadStream(avatarPath)
      }, event.threadID, () => {
        fs.unlinkSync(avatarPath);
      });

      await react('✅');

    } catch (error) {
      console.error('Error:', error);
      reply("An error occurred while processing the request.");
    }
  }
};
