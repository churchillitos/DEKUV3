const axios = require('axios');
let mantika = false;

module.exports = {
  config: {
    name: "sim",
    description: "Toggle SimSimi auto-reply",
    usage: "sim <on|off>",
    cooldown: 2,
    accessableby: 0,
    category: "fun",
    prefix: true
  },

  auto: async function ({ api, event }) {
    if (mantika && event.type === "message" && event.senderID !== api.getCurrentUserID()) {
      const pogi = encodeURIComponent(event.body);
      const lubo = `https://markdevs-last-api-2epw.onrender.com/sim?q=${pogi}`;

      try {
        const pangit = await axios.get(lubo);
        const chilli = pangit.data.response;

        if (pangit.data.error) {
          api.sendMessage(`Error: ${pangit.data.error}`, event.threadID);
        } else if (typeof chilli === "string") {
          api.sendMessage(chilli, event.threadID);
        } else {
          api.sendMessage("Received an unexpected response from the API.", event.threadID);
        }
      } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching the data.", event.threadID);
      }
    }
  },

  start: async function ({ api, event, text }) {
    const { threadID, messageID } = event;
    const chilli = text[0]?.toLowerCase();

    if (chilli === "on") {
      mantika = true;
      return api.sendMessage("SimSimi auto-reply is now ON.", threadID, messageID);
    } else if (chilli === "off") {
      mantika = false;
      return api.sendMessage("SimSimi auto-reply is now OFF.", threadID, messageID);
    } else {
      if (!mantika) {
        return api.sendMessage("SimSimi auto-reply is currently OFF. Use 'sim on' to enable.", threadID, messageID);
      }

      api.sendMessage("Invalid command. You can only use 'sim on' or 'sim off'.", threadID, messageID);
    }
  }
};
