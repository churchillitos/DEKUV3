const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.1',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4'],
    description: 'Get a response from GPT-4',
    usage: 'ai [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const userId = event.senderID;
    const userPrompt = args.join(' ');

    if (!userPrompt) {
        return api.sendMessage('Please provide a prompt, for example: ai What is the meaning of life?', event.threadID, event.messageID);
    }

    const userInfo = await api.getUserInfo(userId);
    const userName = userInfo[userId].name;

    // Notify user that the processing has started
    const processingMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐...',
            mentions: [{ tag: userName, id: userId }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    // React to the message with a "loading" emoji
    api.setMessageReaction('⏳', event.messageID, (err) => {
        if (err) console.error('Error reacting with loading emoji:', err);
    });

    // Use the global endpoint for API requests
    const apiUrl = `${global.deku.ENDPOINT}/gpt4?prompt=${encodeURIComponent(userPrompt)}&uid=${userId}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.gpt4 || 'No response from GPT-4.';

        // Format the GPT-4 response message
        const formattedResponse = 
` 𝙶𝚙𝚝4++ 𝙲𝚘𝚗𝚝𝚒𝚗𝚞𝚎𝚜
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}`;

        // Edit the processing message with the GPT-4 response
        await api.editMessage(formattedResponse, processingMessage.messageID);

        // React with a "check" emoji to indicate completion
        api.setMessageReaction('✅', event.messageID, (err) => {
            if (err) console.error('Error reacting with check emoji:', err);
        });

    } catch (error) {
        console.error('Error:', error);

        // Edit the processing message to indicate failure
        await api.editMessage('An error occurred while getting a response from GPT-4. Please try again later.', processingMessage.messageID);

        // Remove the loading emoji reaction
        api.setMessageReaction('', event.messageID, (err) => {
            if (err) console.error('Error removing loading emoji:', err);
        });
    }
};
