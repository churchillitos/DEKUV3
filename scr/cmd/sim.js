module.exports = {
  config: {
    name: "sim",
    prefix: true,
    accessibleby: 0,
    description: "Talk to Sim 🐣",
    author: "Deku",
    category: "fun",
    usage: "[ask]",
    cooldown: 0,
  },
  start: async function ({ text, reply, react }) {
    const axios = require('axios');
    const url = "https://62968ae8-b717-4d66-b3ee-5d1f6d3f6a08-00-39w6h0ixmrgia.sisko.replit.dev:3000/sim/ask?q=";
    const q = text.join(' ');
    if (!q) return reply("🐣 | Missing ask!");
    const { data } = await axios.get(url + q);
    if (data.status == true) {
      react("🐣");
      return reply("🐣 | " + data.result);
    } else {
      return reply("🐣 | Couldn't find the answer");
    }
  },
};
