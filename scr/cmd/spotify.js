//search: /api/scsearch?q=
// download: /api/scdl?q=
// endpoint global.deku.ENDPOINT
const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/cache/soundc.mp3";
async function search(q) {
  const r = (await axios.get(`${global.deku.ENDPOINT}/api/scsearch?q=${q}`))
    .data;
  return r.result;
}
let results;
async function download(q) {
  const r = (await axios.get(`${global.deku.ENDPOINT}/api/scdl?q=${q}`)).data;
  return r.result;
}
module.exports = {
  config: {
    name: "soundc",
    refix: false,
    accessibleby: 0,
    description: "Search and Download souncloud music.",
    credits: "Deku",
    category: "music",
    usage: "[reply by number]",
    cooldown: 0
  },
  start: async function ({ text, api, reply, react, event }) {
    try {
      let searchs = text.join(" ");
      if (!searchs) return reply("Please enter a search query.");
      react("🔎");
      const result = await search(searchs);
      if (!result) return reply("No results found.");
      results = result;
      // console.log(results);
      let msg = `[ 𝚂𝙾𝚄𝙽𝙳𝙲𝙻𝙾𝚄𝙳 ]\n\n🔎 Search results for "${searchs}":\n\n`;
      for (let i = 0; i < result.length; i++) {
        msg += `${i + 1}. 🎼 ${result[i].title}\n🔗Link: ${result[i].link}\n\n`;
      }
      msg += `\nReply with the number of the song you want to download.\n\nNOTE: if it didn't send music, please reply to this message again`;
      //console.log(msg)
      await api.sendMessage(
        msg,
        event.threadID,
        async function (err, info) {
          if (err) return;
          global.handle.replies[info.messageID] = {
            cmdname: module.exports.config.name,
            tid: event.threadID,
            mid: event.messageID,
            uid: event.senderID,
            this_mid: info.messageID,
            this_tid: info.threadID,
            step: "download",
          };
        },
        event.messageID,
      );
    } catch (e) {
      return reply(e.message);
    }
  },
  startReply: async function ({ api, replier }) {
    try {
      if (!results) {
        return api.sendMessage(
          "No search results available.",
          replier.received.tid,
          replier.received.mid,
        );
      }

      if (replier.received.step === "download") {
        let index = replier.data.msg;
        const num = parseInt(index);

        if (isNaN(num)) {
          return api.sendMessage(
            "Please provide a valid number",
            replier.received.tid,
            replier.received.mid,
          );
        }

        if (num < 1 || num > results.length) {
          return api.sendMessage(
            "Invalid number",
            replier.received.tid,
            replier.received.mid,
          );
        }

        const result = results[num - 1];
        const link = result.link;
        const dl = await download(link);
        //const info = dl.title;
        const links = dl.link;

        const res = (
          await axios.get(encodeURI(links), { responseType: "arraybuffer" })
        ).data;
        fs.writeFileSync(path, Buffer.from(res, "utf-8"));

        api.sendMessage(
          { attachment: fs.createReadStream(path) },
          replier.received.tid,
          replier.received.mid,
        );
      }
    } catch (e) {
      api.sendMessage(e.message, replier.received.tid, replier.received.mid);
    }
  },
};
