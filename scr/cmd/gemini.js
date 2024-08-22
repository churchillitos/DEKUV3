const axios = require('axios');

module.exports = {
  config: {
    name: 'gemini',
    description: 'Interact with the Gemini AI',
    usage: 'gemini [custom prompt] (attach image or not)',
    cooldown: 3,
    accessableby: 0,
    category: 'Utility',
    prefix: false,
    author: 'Churchill',
    version: '1.0.0',
  },
  start: async function ({ api, event, text, react, reply }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = text.join(' ');

    if (!customPrompt && !attachment) {
      return reply('Please provide a prompt or attach a photo for the gemink to analyze.');
    }

    let apiUrl = `${global.deku.ENDPOINT}/gemini?`;

    if (attachment && attachment.type === 'photo') {
      const prompt = customPrompt || 'answer that need to answer';
      const imageUrl = attachment.url;
      apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
      apiUrl += `prompt=${encodeURIComponent(customPrompt)}`;
    }

    await react('⏳'); 

    const initialMessage = await new Promise((resolve, reject) => {
      api.sendMessage({
        body: '🔍 Processing your request...',
        mentions: [{ tag: event.senderID, id: event.senderID }],
      }, event.threadID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    });

    try {
      const response = await axios.get(apiUrl);
      const aiResponse = response.data.gemini;

      const formattedResponse = `
✨ 𝙶𝚎𝚖𝚒𝚗𝚒 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${aiResponse.trim()}
━━━━━━━━━━━━━━━━━━
      `;

      await react('✅'); 
      await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
      console.error('Error:', error);
      await api.editMessage('An error occurred, please try using the "ai2" command.', initialMessage.messageID);
    }
  }
};
