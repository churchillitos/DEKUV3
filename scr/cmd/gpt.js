const axios = require("axios");

async function fetchGPT4Response(query, userId) {
  try {
    const { data } = await axios.get(`https://markdevs-last-api-2epw.onrender.com/gpt4`, {
      params: { prompt: query, uid: userId }
    });
    return data.gpt4;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

module.exports = {
  config: {
    name: "gpt",
    description: "Interact with GPT-4 AI",
    prefix: false,
    usage: "<your message>",
    accessableby: "Members",
    cooldown: 5,
    author: "Churchill"
  },
  execute: async ({ text, api, reply, react, event }) => {
    const userPrompt = text.join(" ");
    const userId = event.senderID;

    if (!userPrompt) return reply("Please provide a prompt to interact with GPT-4.");

    react("🔄");

    try {
      const loadingMessage = "[ AI Assistant ]\n\nSearching for a response...\n\n[ Type 'clear' to reset the conversation ]";
      const messageInfo = await api.sendMessage(loadingMessage, event.threadID);

      const response = await fetchGPT4Response(userPrompt, userId);

      const updatedMessage = `[ AI Assistant ]\n\n${response}\n\n[ Reply to this message to continue the conversation ]`;
      await api.editMessage(updatedMessage, messageInfo.messageID);

      global.handle.replies[messageInfo.messageID] = {
        cmdname: module.exports.config.name,
        threadID: event.threadID,
        messageID: event.messageID,
        replyMessageID: messageInfo.messageID,
      };
    } catch (error) {
      return reply(`Failed to process your request: ${error.message}`);
    }
  }
};
