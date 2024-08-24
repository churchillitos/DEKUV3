const axios = require("axios");

async function aic(q, uid) {
  try {
    const r = (
      await axios.get(`${global.deku.ENDPOINT}/gpt4?prompt=${q}&uid=${uid}`)
    ).data;
    return r.gpt4;
  } catch (e) {
    return e.message;
  }
}

module.exports = {
  config: {
    name: "ai",
    description: "Talk to GPT4 (conversational)",
    prefix: false,
    usage: "[ask]",
    accessableby: 0,
    cooldown: 5,
  },
  startReply: async function ({ api, replier }) {
    await api.sendMessage(
      "🤖 𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐 𝙿𝚕𝚜𝚜 𝚠𝚊𝚒𝚝...",
      replier.received.tid,
      async (err, info) => {
        if (err) return;
        const r = await aic(replier.data.msg, replier.received.uid);
        api.editMessage(
          "𝙶𝚙𝚝4++ 𝙲𝚘𝚗𝚝𝚒𝚗𝚞𝚎𝚜\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            r +
            "\n━━━━━━━━━━━━━━━━━━\n\n" +
            "[ 𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝚃𝙷𝙸𝚂 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚃𝙾 𝙲𝙾𝙽𝚃𝙸𝙽𝚄𝙴 𝚃𝙷𝙴 𝙲𝙾𝙽𝚅𝙴𝚁𝚂𝙰𝚃𝙸𝙾𝙽 𝚆𝙸𝚃𝙷 𝙰𝙸 ]",
          info.messageID,
        );
        global.handle.replies[info.messageID] = {
          cmdname: module.exports.config.name,
          this_mid: info.messageID,
          this_tid: info.threadID,
          tid: replier.received.tid,
          mid: replier.received.mid,
        };
      },
      replier.received.mid,
    );
  },
  start: async function ({ text, api, reply, react, event }) {
    let p = text.join(" "),
      uid = event.senderID;
    if (!p) return reply("Please enter a prompt.");
    react("✨");
    try {
      await api.sendMessage(
        "🤖 𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐 𝙿𝚕𝚜𝚜 𝚠𝚊𝚒𝚝...",
        event.threadID,
        async (err, info) => {
          if (err) return;
          const r = await aic(p, uid);
          api.editMessage(
            "𝙶𝚙𝚝4++ 𝙲𝚘𝚗𝚝𝚒𝚗𝚞𝚎𝚜\n" +
              "━━━━━━━━━━━━━━━━━━\n" +
              r +
              "\n━━━━━━━━━━━━━━━━━━\n\n" +
              "[ 𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝚃𝙷𝙸𝚂 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚃𝙾 𝙲𝙾𝙽𝚃𝙸𝙽𝚄𝙴 𝚃𝙷𝙴 𝙲𝙾𝙽𝚅𝙴𝚁𝚂𝙰𝚃𝙸𝙾𝙽 𝚆𝙸𝚃𝙷 𝙰𝙸 ]",
            info.messageID,
          );
          global.handle.replies[info.messageID] = {
            cmdname: module.exports.config.name,
            tid: event.threadID,
            mid: event.messageID,
            this_mid: info.messageID,
            this_tid: info.threadID,
          };
        },
        event.messageID,
      );
    } catch (g) {
      return reply(g.message);
    }
  },
};
