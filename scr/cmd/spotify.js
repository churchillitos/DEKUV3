const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "spotify",
    description: "Search for a song on Spotify and send it as an attachment.",
    usage: "spotify <song name>",
    cooldown: 5,
    accessableby: 0,
    category: "music",
    prefix: true,
  },
  start: async function ({ api, text, react, event, reply }) {
    try {
      const query = text.join("_"); // Join the text arguments to form the search query
      const response = await axios.get(`https://chorawrs-sheshh.vercel.app/spt?search=${query}`);

      if (response.data) {
        const { name, image, music } = response.data;

        // React to the user's message to indicate processing
        await react("🎵");

        // Fetch the song data (audio file)
        const musicResponse = await axios.get(music, { responseType: 'arraybuffer' });
        const musicPath = path.join(__dirname, `${name.track}.mp3`);

        // Save the music file locally
        fs.writeFileSync(musicPath, musicResponse.data);

        // Send the music file as an attachment
        api.sendMessage({
          body: `🎧 Now Playing: ${name.track} by ${name.artist}`,
          attachment: fs.createReadStream(musicPath)
        }, event.threadID, () => {
          // Clean up by deleting the local file after sending
          fs.unlinkSync(musicPath);
        });
      } else {
        reply("Couldn't find the song. Please try another search term.");
      }
    } catch (error) {
      console.error(error);
      reply("An error occurred while processing your request. Please try again later.");
    }
  }
};
