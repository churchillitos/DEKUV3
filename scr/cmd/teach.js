module.exports = {
  config: {
    name: "teach",
    prefix: true,
    accessibleby: 0,
    description: "Teach Sim 🐣",
    author: "Deku",
    category: "fun",
    usage: "[your ask => Sim asnwer]",
    cooldown: 0,
  },
  start: async function ({ text, reply, react }) {
    const axios = require("axios");
    const url =
      "https://62968ae8-b717-4d66-b3ee-5d1f6d3f6a08-00-39w6h0ixmrgia.sisko.replit.dev:3000/sim/teach?";
    const q = text.join(" ");
    try {
      const ask = q.split("=>")[0];
      const ans = q.split("=>")[1];
      if (!ask) return reply("🐣 | Missing ask!");
      if (!ans) return reply("🐣 | Missing answer!");
      const { data } = await axios.get(url + "q=" + ask + "&ans=" + ans);
      if (data.status == true) {
        react("🐣");
        return reply("🐣 | " + data.result);
      } else {
        return reply("🐣 | Something went wrong");
      }
    } catch (e) {
      console.error(e.message);
      return reply("Sim Error");
    }
  },
};
