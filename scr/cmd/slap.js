const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "slap",
    description: "Slap another user!",
    usage: "@mention or reply to a message",
    cooldown: 5,
    accessableby: 0,
    category: "fun",
    prefix: true
  },
  start: async function({ event, api, args, Users, reply }) {
    let mentionedID;

    if (event.messageReply) {
      mentionedID = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      mentionedID = Object.keys(event.mentions)[0];
    } else {
      return reply("You need to mention someone or reply to someone's message to slap them!");
    }

    try {
      const uid1 = event.senderID;
      const uid2 = mentionedID;

      const response = await axios.get(`${global.deku.ENDPOINT}/canvas/slap?uid=${uid1}&uid2=${uid2}`, {
        responseType: 'arraybuffer'
      });

      const slapImagePath = path.join(__dirname, 'slap.png');
      fs.writeFileSync(slapImagePath, response.data);

      const msg = {
        body: `Take that!`,
        attachment: fs.createReadStream(slapImagePath)
      };

      api.sendMessage(msg, event.threadID, () => {
        fs.unlinkSync(slapImagePath);
      });

    } catch (error) {
      console.error("Error fetching slap image: ", error);
      reply("Sorry, something went wrong while trying to slap!");
    }
  }
};
