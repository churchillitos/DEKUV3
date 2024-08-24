const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    description: 'Get a response from GPT-4',
    usage: 'ai [your message]',
    cooldown: 3,
    accessableby: 0, // 0 is for everyone
    category: 'AI',
    prefix: false // The command doesn't require a prefix
  },
  start: async function({ api, event, text, react, reply, User }) {
    const userId = event.senderID;
    const userPrompt = text.join(' ');

    if (!userPrompt) {
      return reply('Please provide a prompt, for example: ai What is the meaning of life?');
    }

    const userInfo = await api.getUserInfo(userId);
    const userName = userInfo[userId].name;

    let processingMessage;
    try {
      processingMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
          body: '𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐...',
          mentions: [{ tag: userName, id: userId }],
        }, event.threadID, (err, info) => {
          if (err) return reject(err);
          resolve(info);
        }, event.messageID);
      });

      react('⏳');
    } catch (err) {
      console.error('Error sending processing message:', err);
      return;
    }

    const apiUrl = `${global.deku.ENDPOINT}/gpt4?prompt=${encodeURIComponent(userPrompt)}&uid=${userId}`;

    try {
      const response = await axios.get(apiUrl);
      const gpt4Response = response.data.gpt4 || 'No response from GPT-4.';

      const formattedResponse = 
` 𝙶𝚙𝚝4++ 𝙲𝚘𝚗𝚝𝚒𝚗𝚞𝚎𝚜
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}`;

      await api.editMessage(formattedResponse, processingMessage.messageID);

      react('✅');

    } catch (error) {
      console.error('Error:', error);

      await api.editMessage('An error occurred while getting a response from GPT-4. Please try to use ai2.', processingMessage.messageID);

      react('');
    }
  }
};
