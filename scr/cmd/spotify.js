const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function searchSpotify(query) {
  try {
    const response = await axios.get(
      `${global.deku.ENDPOINT}/search/spotify?q=${encodeURIComponent(query)}`
    );
    return response.data.result;
  } catch (error) {
    return null;
  }
}

module.exports = {
  config: {
    name: "spotify",
    description: "Search for a song on Spotify and play it.",
    prefix: false,
    usage: "[song title]",
    accessableby: 0,
    cooldown: 5,
  },
  startReply: async function ({ api, replier }) {
    const selection = parseInt(replier.data.msg.trim());
    const replyInfo = global.handle.replies[replier.received.mid];

    if (isNaN(selection) || !replyInfo || !replyInfo.results[selection - 1]) {
      return api.sendMessage("Invalid selection. Please reply with a number corresponding to the song.", replier.received.tid);
    }

    const track = replyInfo.results[selection - 1];
    const filePath = path.join(__dirname, `${track.title}.mp3`);

    try {
      const response = await axios.get(track.direct_url, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          { attachment: fs.createReadStream(filePath) },
          replier.received.tid,
          () => fs.unlinkSync(filePath) // Delete the file after sending
        );
      });
    } catch (error) {
      api.sendMessage("An error occurred while downloading the song.", replier.received.tid);
    }
  },
  start: async function ({ text, api, reply, react, event }) {
    const query = text.join(" ");
    if (!query) return reply("Please enter a song title to search.");

    react("🔍");

    const results = await searchSpotify(query);
    if (!results || results.length === 0) {
      return reply("No results found for your query.");
    }

    let message = "🎵 Here are the search results:\n";
    results.forEach((result, index) => {
      message += `\n${index + 1}. ${result.title} by ${result.artist}`;
    });
    message += "\n\nReply with the number of the song you want to play.";

    api.sendMessage(message, event.threadID, async (err, info) => {
      if (err) return;
      global.handle.replies[info.messageID] = {
        cmdname: module.exports.config.name,
        results,
        tid: event.threadID,
        mid: event.messageID,
      };
    });
  },
};
