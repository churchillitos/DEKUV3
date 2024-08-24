const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'slap',
    version: '1.0.1',
    description: 'Slap someone with a custom image.',
    usage: 'slap @mention or slap reply',
    cooldown: 3,
    accessableby: 0,
    category: 'fun',
    prefix: false
  },
  start: async function ({ api, text, react, event, reply, User }) {
    let chilli;

    // Determine who to slap
    if (event.type === 'message_reply') {
      chilli = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      chilli = Object.keys(event.mentions)[0];
    } else {
      return reply('Please mention someone to slap, or use the command in reply to a message.');
    }

    const pogi = event.senderID;
    const senderInfo = await api.getUserInfo(pogi);
    const chilliInfo = await api.getUserInfo(chilli);

    const pangit = senderInfo[pogi].name;
    const oubot = chilliInfo[chilli].name;

    const mapanghi = `${global.deku.ENDPOINT}/canvas/slap?uid=${pogi}&uid2=${chilli}`;
    const filePath = path.resolve(__dirname, 'slap.png');

    try {
      const response = await axios({
        url: mapanghi,
        responseType: 'stream',
      });

      response.data.pipe(fs.createWriteStream(filePath));

      response.data.on('end', async () => {
        await api.sendMessage({
          body: `${pangit} slapped ${oubot}! 👋`,
          attachment: fs.createReadStream(filePath),
        }, event.threadID, () => {
          fs.unlinkSync(filePath);
        }, event.messageID);
      });

    } catch (error) {
      console.error('Error:', error);
      reply('An error occurred while generating the slap image. Please try again later.');
    }
  }
};
