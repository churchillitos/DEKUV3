const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "spotify",
    description: "Search for a song on Spotify and send an audio preview",
    usage: "spotify <query>",
    cooldown: 5,
    accessableby: 0,
    category: "music",
    prefix: true
  },
  start: async function({ event, api, args, reply }) {
    if (args.length === 0) {
      return reply("Please provide a search query for Spotify.");
    }

    const query = args.join(" ");
    const apiKey = "syugg";
    const endpoint = `http://linda.hidencloud.com:25636/spotify/search?q=${encodeURIComponent(query)}&apikey=${apiKey}`;

    try {
      const response = await axios.get(endpoint);

      if (response.data && response.data.data && response.data.data.length > 0) {
        const song = response.data.data[0];
        
        const previewUrl = song.preview;
        const previewPath = path.join(__dirname, 'spotify_preview.mp3');

        if (!previewUrl) {
          return reply("Sorry, no preview available for this song.");
        }

        // Download the audio preview
        const audioResponse = await axios.get(previewUrl, {
          responseType: 'arraybuffer'
        });

        fs.writeFileSync(previewPath, audioResponse.data);

        const msg = {
          body: `Here is a preview of ${song.title}\nPopularity: ${song.popularity}\nListen on Spotify: ${song.url}`,
          attachment: fs.createReadStream(previewPath)
        };

        // Send the audio preview as an attachment
        api.sendMessage(msg, event.threadID, () => {
          fs.unlinkSync(previewPath); // Clean up the file
        });
      } else {
        reply("No results found for your search.");
      }
    } catch (error) {
      console.error("Error fetching data from Spotify API: ", error);
      reply("Sorry, something went wrong while searching for the song.");
    }
  }
};
