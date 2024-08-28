const axios = require("axios");
const fs = require("fs-extra");

const apiKey = "hgEG2LSoC8VD5A2akNvcFySR";

module.exports = {
  config: {
    name: "removebg",
    description: "Remove Background from Image",
    usage: "reply to an image or provide an image URL",
    cooldown: 20,
    accessableby: 0,
    category: "image",
    prefix: true,
    author: "Churchill",
  },

  start: async function ({ api, text, react, event, reply, User }) {
    let imageUrl;
    let type;

    if (event.type === "message_reply") {
      if (["photo", "sticker"].includes(event.messageReply.attachments[0].type)) {
        imageUrl = event.messageReply.attachments[0].url;
        type = isNaN(text[0]) ? 1 : Number(text[0]);
      }
    } else if (text[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
      imageUrl = text[0];
      type = isNaN(text[1]) ? 1 : Number(text[1]);
    } else {
      return reply("Please provide an image URL or reply to an image..!⚠");
    }

    const processingMessage = await reply("🕰️ | removing background...");

    try {
      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        {
          image_url: imageUrl,
          size: "auto",
        },
        {
          headers: {
            "X-Api-Key": apiKey,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const outputBuffer = Buffer.from(response.data, "binary");

      const fileName = `${Date.now()}.png`;
      const filePath = `./${fileName}`;

      fs.writeFileSync(filePath, outputBuffer);

      await reply({
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);

    } catch (error) {
      reply("Something went wrong. Please try again later..!\n⚠🤦\\I already sent a message to Admin about the error. He will fix it as soon as possible.🙎");

      const errorMessage = "----RemoveBG Log----\nSomething is causing an error with the removebg command.\nPlease check if the API key has expired.\nCheck the API key here: https://www.remove.bg/dashboard";

      const { config } = global.GoatBot;
      for (const adminID of config.adminBot) {
        api.sendMessage(errorMessage, adminID);
      }
    }

    api.unsendMessage(processingMessage.messageID);
  },

  auto: async function ({ api, event, text, reply }) {
    // auto-reply logic can be added here if needed
  }
};
