const axios = require('axios');

module.exports = {
    config: {
        name: 'ai2',
        description: 'Interact with the Hercai AI',
        usage: 'ai2 [question]',
        cooldown: 3,
        accessableby: 0, 
        category: 'AI',
        prefix: false,
    },
    start: async function({ api, event, text, reply }) {
        const question = text.join(' ');

        if (!question) {
            return reply('Please provide a question, for example: ai2 what is love?');
        }

        const initialMessage = await new Promise((resolve, reject) => {
            api.sendMessage({
                body: '🤖 Ai answering...',
                mentions: [{ tag: event.senderID, id: event.senderID }],
            }, event.threadID, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            }, event.messageID);
        });

        try {
            const response = await axios.get('https://hercai.onrender.com/v3/hercai', {
                params: { question }
            });
            const aiResponse = response.data;
            const responseString = aiResponse.reply ? aiResponse.reply : 'No result found.';

            const formattedResponse = `
🤖 Hercai AI
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
-𝚆𝙰𝙶 𝙼𝙾 𝙲𝙾𝙿𝚈 𝙻𝙰𝙷𝙰𝚃 𝙽𝙶 𝚂𝙰𝙶𝙾𝚃 𝙺𝚄𝙽𝙶 𝙰𝚈𝙰𝚆 𝙼𝙾𝙽𝙶 𝙼𝙰𝙷𝙰𝙻𝙰𝚃𝙰
━━━━━━━━━━━━━━━━━━
If you want to donate for the server, just PM or Add the developer: [https://www.facebook.com/Churchill.Dev4100]
            `;

            await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

        } catch (error) {
            console.error('Error:', error);
            await api.editMessage('An error occurred, please try again later.', initialMessage.messageID);
        }
    },
    auto: async function({ api, event, text, reply }) {
        // Optional: Add auto-response logic here if needed
    }
};
