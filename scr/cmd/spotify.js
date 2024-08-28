const axios = require("axios");
const fs = require('fs-extra');
const { getStreamFromURL, shortenURL, randomString } = global.utils;

module.exports = {
  config: {
    name: "spotify",
    description: "Play song from Spotify",
    usage: "{pn} songname",
    cooldown: 10,
    accessableby: 0,
    category: "music",
    prefix: true,
    author: "Churchill",
  },

  start: async function ({ api, text, event, reply }) {
    api.setMessageReaction("🕢", event.messageID, null, true);
    
    try {
      let songName = '';

      const getSongTitleFromAttachment = async () => {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "audio" || attachment.type === "video") {
          const shortenedURL = await shortenURL(attachment.url);
          const response = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortenedURL)}`);
          return response.data.title;
        } else {
          throw new Error("Invalid attachment type.");
        }
      };

      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        songName = await getSongTitleFromAttachment();
      } else if (text.length === 0) {
        throw new Error("Please provide a song name.");
      } else {
        songName = text.join(" ");
      }

      const spotifyResponse = await axios.get(`https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(songName)}`);
      const trackURLs = spotifyResponse.data.trackURLs;
      if (!trackURLs || trackURLs.length === 0) {
        throw new Error("No track found for the provided song name.");
      }

      const trackURL = trackURLs[0];
      const downloadResponse = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackURL)}`);
      const downloadLink = downloadResponse.data.download_link;

      const downloadedTrack = await downloadTrack(downloadLink);

      await reply({
        body: `🎧 Playing: ${songName}`,
        attachment: fs.createReadStream(downloadedTrack)
      });

    } catch (error) {
      console.error("Error occurred:", error);
      reply(`An error occurred: ${error.message}`);
    }
  }
};

async function downloadTrack(url) {
  const stream = await getStreamFromURL(url);
  const filePath = `${__dirname}/tmp/${randomString()}.mp3`;
  const writeStream = fs.createWriteStream(filePath);
  stream.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}
