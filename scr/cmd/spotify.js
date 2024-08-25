const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "spotify",
    description: "Search and play a Spotify track",
    usage: "spotify <track name>",
    cooldown: 5,
    accessableby: 0,
    category: "Music",
    prefix: true,
  },
  start: async function({ api, text, react, event, reply }) {
    try {
      const query = text.join(' ');
      if (!query) {
        return reply("Please provide a track name to search for.");
      }

      react("🔍");
      reply("Searching for the track on Spotify...");

      const response = await axios.get(`${global.deku.ENDPOINT}/search/spotify?q=${encodeURIComponent(query)}`);
      
      if (!response.data.status || response.data.result.length === 0) {
        return reply("No tracks found for your query.");
      }

      const track = response.data.result[0];

      react("🎧");
      reply(`Playing "${track.title}" by ${track.artist}. Please wait...`);

      const voicePath = path.join(__dirname, '/cache/spotify_voice.mp3');

      const trackResponse = await axios.get(track.direct_url, { responseType: 'arraybuffer' });

      fs.writeFileSync(voicePath, Buffer.from(trackResponse.data, 'binary'));

      api.sendMessage({
        body: `Now playing: ${track.title} by ${track.artist}`,
        attachment: fs.createReadStream(voicePath)
      }, event.threadID, () => {
        fs.unlinkSync(voicePath);
      });

    } catch (error) {
      console.error('Error:', error);
      reply("An error occurred while processing your request.");
    }
  },
  auto: async function({ event, reply }) {}
};
