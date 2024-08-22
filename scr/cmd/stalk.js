const axios = require("axios");
const fs = require('fs');

module.exports = {
  config: {
    name: "stalk",
    description: "Stalk the tagged user",
    usage: "stalk @user",
    cooldown: 5,
    accessableby: 0,  // Only admins/bot owner
    category: "user",
    prefix: true
  },
  start: async function ({ api, event, text, react, reply, User }) {
    try {
      if (Object.keys(event.mentions).length === 0) {
        return reply('Please mention a user');
      } else {
        for (let i = 0; i < Object.keys(event.mentions).length; i++) {
          const mentionedUID = Object.keys(event.mentions)[i];
          const userInfo = await api.getUserInfo(mentionedUID);
          const fname = userInfo[mentionedUID].name;
          const accurl = userInfo[mentionedUID].profileUrl;
          const gendernum = userInfo[mentionedUID].gender;

          let gender = "";
          if (gendernum === 2) {
            gender = "Male";
          } else if (gendernum === 1) {
            gender = "Female";
          }
          if (mentionedUID == 100039366339941) {
            gender = "Bading";
          }

          // Fetch the user's avatar
          const Avatar = (await axios.get(
            `https://graph.facebook.com/${mentionedUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            { responseType: 'arraybuffer' }
          )).data;

          // Save the avatar image to cache
          fs.writeFileSync('cache/avt.png', Buffer.from(Avatar, 'binary'));

          const formattedMention = {
            body: `Name: ${fname}\nUID: ${mentionedUID} \nProfile URL: ${accurl} \nGender: ${gender}`,
            attachment: fs.createReadStream('cache/avt.png')
          };

          // Send the formatted message with the attachment
          reply(formattedMention);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};
