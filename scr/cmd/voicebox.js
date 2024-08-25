const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "voicebox",
    description: "Synthesize voice",
    usage: "voicebox <text>",
    cooldown: 5, // cooldown in seconds
    accessableby: 0, // 0 for everyone
    category: "Fun",
    prefix: false, // Command doesn't require a prefix
  },
  start: async function ({ api, text, react, event, reply }) {
    try {
        const cutemochill = text.join(" ");
        if (!cutemochill) {
            return reply("Usage: voicebox <text>");
        }

        reply("🤖 | Synthesizing voice, please wait...");

        const response = await axios.get(`${global.deku.ENDPOINT}/new/voicevox-synthesis?id=1&text=${encodeURIComponent(cutemochill)}`, {
            responseType: 'arraybuffer'
        });

        const cutemochillPath = path.join(__dirname, `/cache/voice_message.wav`);
        fs.writeFileSync(cutemochillPath, Buffer.from(response.data, 'binary'));

        api.sendMessage({
            body: `voice message:`,
            attachment: fs.createReadStream(cutemochillPath)
        }, event.threadID, () => {
            fs.unlinkSync(cutemochillPath);
        });
    } catch (error) {
        console.error('Error:', error);
        reply("An error occurred while processing the request.");
    }
  },
  auto: async function ({ event, reply }) {
    // Optional: You can add an auto-reply feature here if needed
  }
};
