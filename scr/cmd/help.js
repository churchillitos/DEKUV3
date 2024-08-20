module.exports = {
  config: {
    name: "help",
    accessableby: 0,
    usage: "[page|all]",
    prefix: true,
    cooldown: 0,
  },
  start: async function ({ text, reply }) {
    const fs = require("fs");

    try {
      let path = process.cwd() + "/scr/cmd";
      let files = fs.readdirSync(path);
      let commands = [];

      for (let file of files) {
        if (file.endsWith(".js")) {
          let script = require(path + "/" + file).config;
          commands.push(script.name);
        }
      }

      // Kung "all" ang input, ipakita lahat ng commands
      if (text[0] && text[0].toLowerCase() === "all") {
        let output = `━━𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂━━\n`;

        commands.forEach((command) => {
          output += ` ⊂⊃ ➥ ${command}\n`;
        });

        output += `━━━━━━━━━━━━━━━\n`;
        output += `Total commands: ${commands.length}\n`;
        output += `━━━━━━━━━━━━━━━━━━\n\n`;
        output += `𝙰𝚄𝚃𝙾𝙻𝚄𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁: https://www.facebook.com/Churchill.Dev4100`;

        return reply({ body: output });
      }

      // Kung hindi "all", hanapin ang page number
      let page = parseInt(text[0]) || 1;

      if (page < 1) return reply("Invalid page number.");

      let totalPages = Math.ceil(commands.length / 15);
      if (page > totalPages) return reply("Invalid page number.");

      let startIndex = (page - 1) * 15;
      let endIndex = page * 15;

      let output = `━━𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂━━\n`;

      const commandList = commands.slice(startIndex, endIndex);

      commandList.forEach((command) => {
        output += ` ⊂⊃ ➥ ${command}\n`;
      });

      output += `━━━━━━━━━━━━━━━\n`;
      output += `━━𝙲𝙾𝙼𝙼𝙰𝙽𝙳 𝙿𝙰𝙶𝙴 : <${page}/${totalPages}>━━\n`;
      output += `━━CHILLI 𝖠𝖨 𝖢𝖧𝖠𝖳𝖡𝖮𝖳━━\n`;
      output += `Total commands: ${commands.length}\n`;
      output += `Type "help all" to see all commands.\n`;
      output += `━━━━━━━━━━━━━━━━━━\n\n`;
      output += `𝙾𝚆𝙽𝙴𝚁: https://www.facebook.com/Churchill.Dev4100`;

      return reply({ body: output });
    } catch (e) {
      return reply(e.message);
    }
  },
};
