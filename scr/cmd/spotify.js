const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "spotify",
    description: "Search and send Spotify music previews.",
    usage: "spotify <song_name>",
    cooldown: 5,
    accessableby: 0,
    category: "music",
    prefix: true
  },

  start: async function ({ api, event, text, reply }) {
    try {
      // Join the text input as the search query
      const searchQuery = text.join(" ");
      
      if (!searchQuery) {
        return reply("Please provide a song name to search for.");
      }

      // Fetch data from the Spotify API using the provided search query
      const response = await axios.get(`${global.deku.ENDPOINT}/search/spotify?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.data.status || response.data.result.length === 0) {
        return reply("No results found for your query. Please try a different search.");
      }

      // Select the first result from the response
      const song = response.data.result[0];
      const previewUrl = song.direct_url;

      if (!previewUrl) {
        return reply("No audio preview available for this track.");
      }

      // Define the path to save the preview audio temporarily
      const audioPath = path.resolve(__dirname, 'temp', `spotify_preview_${song.id}.mp3`);

      // Download the preview audio
      const audioResponse = await axios.get(previewUrl, { responseType: 'stream' });
      audioResponse.data.pipe(fs.createWriteStream(audioPath));

      // Wait for the file to finish downloading
      await new Promise((resolve) => {
        audioResponse.data.on('end', resolve);
      });

      // Send the audio as a voice attachment
      api.sendMessage({
        body: `Now playing: ${song.title} by ${song.artist}`,
        attachment: fs.createReadStream(audioPath)
      }, event.threadID);

      // Clean up the downloaded audio file
      fs.unlinkSync(audioPath);

    } catch (error) {
      console.error(error);
      reply("An error occurred while fetching the song. Please try again later.");
    }
  }
};
