const X = require("./fca/index"),
  { warn, logger, logs } = require("./utils/logger"),
  fs = require("fs"),
  { join } = require("path");
require("./utils/index");
const cron = require("node-cron");
const axios = require("axios");
const appState = JSON.parse(fs.readFileSync("botCookie.json", "utf8"));
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const formatter = require("./handle/handleFormat");
const { PREFIX, ADMINBOT, BOTNAME } = config;
let p = PREFIX;
global.deku = new Object({
  PREFIX,
  BOTNAME,
  ADMINBOT,
  ENDPOINT: "https://deku-rest-api-3jvu.onrender.com",
  AUTOPOST: config["SETTING"]["AUTOPOST"],
  //  ADMINONLY: config["SETTING"]["ADMINONLY"], // on next update lol
  DETECTTYPING: config["SETTING"]["DETECTTYPING"],
  AUTOCOMMENT: config["SETTING"]["AUTOCOMMENT"],
  TAG: config["TAG"],
});

global.memory = {
  fbcover: new Map(),
  cover: new Map(),
  soundc: new Map(),
  x: new Map(),
  pending: new Map(),
};

global.handle = {
  replies: new Map(),
  cooldown: new Map(),
  handleReaction: new Map(),
};

global.utils = {
  dlStream,
  dl,
  dlBuffer,
  dlFile,
  format: formatter,
};
async function dlFile(url, path) {
  const response = await axios({
    method: "GET",
    responseType: "stream",
    url,
  });
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
async function dlStream(url) {
  const res = (
    await axios.get(url, {
      responseType: "stream",
    })
  ).data;
  return res;
}

async function dl(url) {
  const res = (
    await axios.get(url, {
      responseType: "arraybuffer",
    })
  ).data;
  return res;
}

async function dlBuffer(url, path) {
  const p = path;
  const rest = (
    await axios.get(url, {
      responseType: "arraybuffer",
    })
  ).data;
  fs.writeFileSync(p, Buffer.from(rest, "utf-8"));
  return p;
}

endpoint = global.deku.ENDPOINT;
/* INSTALLING COMMANDS */
let commandPath = join(__dirname, "scr", "cmd");

for (let files of fs.readdirSync(commandPath)) {
  if (files.endsWith(".js")) {
    let script;
    try {
      if (!files.endsWith(".js"))
        return warn("Command Error: File Extension Error");
      script = require(join(commandPath, files));
      logger("Successfully installed command: " + script.config?.name);
    } catch (e) {
      warn("Can't install command: " + files + "\nReason: " + e.message);
    }
  }
}
/* END */
process.on("unhandledRejection", (error) => console.error(error));

process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;
X(
  {
    appState,
  },
  async function (err, api) {
    logs("╰┈➤ THIS BOT WAS MADE BY CHILLI");
    logs("╰┈➤ CONTACT: https://www.facebook.com/Churchill.Dev4100");
    logs("╰┈➤ ADMIN: CHURCHILL AG");
    function getGUID() {
      var sectionLength = Date.now();
      var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = Math.floor((sectionLength + Math.random() * 16) % 16);
          sectionLength = Math.floor(sectionLength / 16);
          var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
          return _guid;
        },
      );
      return id;
    }
    if (err) return warn(err);
    api.setOptions(config.option);

    /* =========[ AUTO POST AND AUTO COMMENT ]======= */
    if (global.deku.AUTOPOST == true) {
      cron.schedule(
        "0 */5 * * *",
        async function () {
          console.log("cron");
          const getfact = (await axios.get("https://catfact.ninja/fact")).data;
          const fact = getfact.fact;
          let uuid = getGUID();
          const formData = {
            input: {
              composer_entry_point: "inline_composer",
              composer_source_surface: "timeline",
              idempotence_token: uuid + "_FEED",
              source: "WWW",
              attachments: [],
              audience: {
                privacy: {
                  allow: [],
                  base_state: "EVERYONE", // SELF EVERYONE FRIENDS
                  deny: [],
                  tag_expansion_state: "UNSPECIFIED",
                },
              },
              message: {
                ranges: [],
                text: "𝚁𝙰𝙽𝙳𝙾𝙼 𝙲𝙰𝚃 𝙵𝙰𝙲𝚃: “" + fact + "”",
              },
              with_tags_ids: global.deku.TAG || globa.deku.ADMINBOT[0],
              inline_activities: [],
              explicit_place_id: "0",
              text_format_preset_id: "0",
              logging: {
                composer_session_id: uuid,
              },
              tracking: [null],
              actor_id: api.getCurrentUserID(),
              client_mutation_id: Math.floor(Math.random() * 17),
            },
            displayCommentsFeedbackContext: null,
            displayCommentsContextEnableComment: null,
            displayCommentsContextIsAdPreview: null,
            displayCommentsContextIsAggregatedShare: null,
            displayCommentsContextIsStorySet: null,
            feedLocation: "TIMELINE",
            feedbackSource: 0,
            focusCommentID: null,
            gridMediaWidth: 230,
            groupID: null,
            scale: 3,
            privacySelectorRenderLocation: "COMET_STREAM",
            renderLocation: "timeline",
            useDefaultActor: false,
            inviteShortLinkKey: null,
            isFeed: false,
            isFundraiser: false,
            isFunFactPost: false,
            isGroup: false,
            isTimeline: true,
            isSocialLearning: false,
            isPageNewsFeed: false,
            isProfileReviews: false,
            isWorkSharedDraft: false,
            UFI2CommentsProvider_commentsKey: "ProfileCometTimelineRoute",
            hashtag: null,
            canUserManageOffers: false,
          };
          const form = {
            av: api.getCurrentUserID(),
            fb_api_req_friendly_name: "ComposerStoryCreateMutation",
            fb_api_caller_class: "RelayModern",
            doc_id: "7711610262190099",
            variables: JSON.stringify(formData),
          };
          api.httpPost(
            "https://www.facebook.com/api/graphql/",
            form,
            (e, info) => {
              try {
                if (e) throw e;
                if (info.error) throw info.error;
                if (typeof info == "string")
                  info = JSON.parse(info.replace("for (;;);", ""));
                const postID =
                  info.data.story_create.story.legacy_story_hideable_id;
                if (!postID) throw info.errors;
                api.sendMessage(
                  "[AUTO POST]\nLink: https://www.facebook.com/" +
                    api.getCurrentUserID() +
                    "/posts/" +
                    postID,
                  global.deku.ADMINBOT[0],
                );
                return console.log(
                  "[AUTO POST]\nLink: https://www.facebook.com/" +
                    api.getCurrentUserID() +
                    "/posts/" +
                    postID,
                );
              } catch (e) {
                return;
              }
            },
          );
        },
        {
          scheduled: true,
          timezone: "Asia/Manila",
        },
      );
    }

    if (global.deku.AUTOCOMMENT == true) {
      cron.schedule(
        "0 */1 * * *",
        async function () {
          const pID = "122103743660463809"; // post ID
          const rands = [
            "Hi",
            "Hello",
            "Hey",
            "Hey there",
            "Hi there",
            "You can view all avalable command by typing " +
              global.deku.PREFIX +
              "help",
            "How are you?",
            "What's up?",
            "How's it going?",
            "How's life?",
            "How's your day going?",
            "Are you bored? Talk to me using ai command.",
          ];
          const rands1 = rands[Math.floor(Math.random() * rands.length)];
          console.log("commenting...");
          const dat = new Date();
          const timeNow = dat.toLocaleTimeString("en-US", {
            timeZone: "Asia/Manila",
          });
          const dateNow = dat.toLocaleDateString("en-US", {
            timeZone: "Asia/Manila",
          });
          api.sendComment(
            "Date: " +
              dateNow +
              "\nTime: " +
              timeNow +
              "\n\n" +
              rands1 +
              "\n\n[ THIS IS AUTO COMMENT ]",
            pID,
          );
          console.log("commented.");
        },
        {
          scheduled: true,
          timezone: "Asia/Manila",
        },
      );
    }
    /* =========[ END ]======= */

    api.listenMqtt(async function (err, event) {
      if (err) warn(err);
      // console.log(event);
      require(__dirname + "/handle/handleUnsend")(api, event);
      require(__dirname + "/handle/unsendReact")(api, event);
      if (global.deku.DETECTTYPING == true) {
        require(__dirname + "/handle/detectTyping")(api, event);
      }
      const resPath = __dirname + "/handle/restart.json";
      const resta = JSON.parse(fs.readFileSync(resPath));
      if (resta.id) {
        return api.sendMessage(
          "Successfully restarted",
          resta.id,
          () => {
            api.setMessageReaction("✔️", resta.mid, (_) => {}, true);
            delete resta.id;
            fs.writeFileSync(resPath, JSON.stringify(resta, null, 2), "utf-8");
          },
          resta.mid,
        );
      }
      // start
      if (event.body != null) {
        if (event.type == "message") {
          logs(
            `╭ ─┉─¡! [ LOGS ] !¡─┉─ ╮\n\n👤: ${event.senderID}\n🗨️: ${event.body}\n\n╰ ─┉─¡! [ LOGS ] !¡─┉─ ╯\n\n`,
          );
        }
        let input = event.body;
        let args = input.split(" ");
        args.shift();
        let arg = event.body.split(" ");
        let t = arg.shift().toLowerCase();
        for (let files of fs.readdirSync(commandPath)) {
          if (files.endsWith(".js")) {
            const pa = join(commandPath, files);
            const script = require(pa);
            let s = script.config;
            const dateNow = Date.now();
            function reply(text) {
              api.sendMessage(text, event.threadID, event.messageID);
            }
            function react(emoji) {
              api.setMessageReaction(emoji, event.messageID, (_) => {}, true);
            }
            function noP(nam) {
              react("⚠️");
              return reply(
                "You don't have permission to use command " + nam + "!",
              );
            }
            function noPref(nam) {
              react("⚠️");
              reply("Command " + nam + " doesn't need a prefix.");
            }
            function yesPref(nam) {
              react("⚠️");
              reply("Command " + nam + " need a prefix.");
            }

            let obj = {
              api,
              event,
              react,
              reply,
              text: args,
              format: formatter,
            };
            // if (event.type == "message") {
            if (script.auto) {
              script.auto(obj);
            }
            if (t == "prefix")
              // for contact
              /*return api.shareContact(
                "Prefix: " + p,
                api.getCurrentUserID(),
                event.threadID,*/

              // for message
              return reply("Prefix: " + p);
            if (t == p)
              return api.shareContact(
                "Type " + p + "help to view available commands.",
                api.getCurrentUserID(),
                event.threadID,
              );

            //no prefix
            if (t == p + s?.name && s?.prefix == false) {
              return noPref(s.name);
            }

            //yes prefix
            if (t == s?.name && s?.prefix == true) {
              return yesPref(s?.name);
            }

            //permission
            if (t == p + s?.name || t == s?.name) {
              if (s?.accessableby == 1 && !ADMINBOT.includes(event.senderID)) {
                return noP(s?.name);
              }
            }

            // cd
            const _0xe5a0c0 = _0x1a8f;
            (function (_0x397cf6, _0x54bb63) {
              const _0x47868f = _0x1a8f,
                _0x48bd8a = _0x397cf6();
              while (!![]) {
                try {
                  const _0x523de8 =
                    (-parseInt(_0x47868f(0x1c3)) / 0x1) *
                      (-parseInt(_0x47868f(0x1c2)) / 0x2) +
                    (parseInt(_0x47868f(0x1c0)) / 0x3) *
                      (parseInt(_0x47868f(0x1c1)) / 0x4) +
                    (-parseInt(_0x47868f(0x1cc)) / 0x5) *
                      (-parseInt(_0x47868f(0x1c4)) / 0x6) +
                    (-parseInt(_0x47868f(0x1bd)) / 0x7) *
                      (parseInt(_0x47868f(0x1be)) / 0x8) +
                    parseInt(_0x47868f(0x1cb)) / 0x9 +
                    (parseInt(_0x47868f(0x1d1)) / 0xa) *
                      (-parseInt(_0x47868f(0x1cf)) / 0xb) +
                    -parseInt(_0x47868f(0x1c9)) / 0xc;
                  if (_0x523de8 === _0x54bb63) break;
                  else _0x48bd8a["push"](_0x48bd8a["shift"]());
                } catch (_0x1048d1) {
                  _0x48bd8a["push"](_0x48bd8a["shift"]());
                }
              }
            })(_0x342f, 0xe7f25);
            function _0x1a8f(_0x4ed3c9, _0x10b090) {
              const _0x342f91 = _0x342f();
              return (
                (_0x1a8f = function (_0x1a8fd8, _0x180b63) {
                  _0x1a8fd8 = _0x1a8fd8 - 0x1bd;
                  let _0x1ef6c6 = _0x342f91[_0x1a8fd8];
                  return _0x1ef6c6;
                }),
                _0x1a8f(_0x4ed3c9, _0x10b090)
              );
            }
            if (t == p + s?.[_0xe5a0c0(0x1c7)] || t == s?.["name"]) {
              !global[_0xe5a0c0(0x1c8)]["cooldown"][_0xe5a0c0(0x1bf)](
                s?.[_0xe5a0c0(0x1c7)],
              ) &&
                global[_0xe5a0c0(0x1c8)][_0xe5a0c0(0x1c5)][_0xe5a0c0(0x1ca)](
                  s["name"],
                  new Map(),
                );
              const timeStamps = global["handle"][_0xe5a0c0(0x1c5)][
                  _0xe5a0c0(0x1ce)
                ](s?.[_0xe5a0c0(0x1c7)]),
                expiration = s[_0xe5a0c0(0x1c5)] * 0x3e8;
              if (
                timeStamps["has"](event[_0xe5a0c0(0x1c6)]) &&
                dateNow <
                  timeStamps[_0xe5a0c0(0x1ce)](event[_0xe5a0c0(0x1c6)]) +
                    expiration
              )
                return reply(
                  _0xe5a0c0(0x1cd) +
                    (timeStamps["get"](event["senderID"]) +
                      expiration -
                      dateNow) /
                      0x3e8 +
                    "\x20second(s),\x20please\x20try\x20again\x20later.",
                );
              timeStamps["set"](event["senderID"], dateNow),
                setTimeout(
                  () => timeStamps[_0xe5a0c0(0x1d0)](event["senderID"]),
                  expiration,
                );
            }
            function _0x342f() {
              const _0x3e0fb4 = [
                "19555188ifarUs",
                "set",
                "5993136qRHHav",
                "5OEpQyq",
                "Command\x20is\x20still\x20on\x20cooldown\x20for\x20",
                "get",
                "88kaOPsu",
                "delete",
                "2037910OScyWv",
                "35RNkCVl",
                "2176544CajLQG",
                "has",
                "51ZDLtZn",
                "415484WsPfKA",
                "1502RqyvXw",
                "1696HbYrTG",
                "11189478qlsOBG",
                "cooldown",
                "senderID",
                "name",
                "handle",
              ];
              _0x342f = function () {
                return _0x3e0fb4;
              };
              return _0x342f();
            }

            //start
            if (t == p + s?.name || t == s?.name) {
              if (script.start) {
                script.start(obj);
              }
            } // end

            function _0x2efc(_0x59d270, _0x127ee2) {
              const _0x3465e5 = _0x3465();
              return (
                (_0x2efc = function (_0x2efccc, _0x4318fd) {
                  _0x2efccc = _0x2efccc - 0x18f;
                  let _0x358f7d = _0x3465e5[_0x2efccc];
                  return _0x358f7d;
                }),
                _0x2efc(_0x59d270, _0x127ee2)
              );
            }
            const _0x58d9a2 = _0x2efc;
            (function (_0x2865c2, _0x37e691) {
              const _0x5486bd = _0x2efc,
                _0x455052 = _0x2865c2();
              while (!![]) {
                try {
                  const _0x33a69b =
                    parseInt(_0x5486bd(0x195)) / 0x1 +
                    (parseInt(_0x5486bd(0x193)) / 0x2) *
                      (parseInt(_0x5486bd(0x194)) / 0x3) +
                    (-parseInt(_0x5486bd(0x18f)) / 0x4) *
                      (parseInt(_0x5486bd(0x192)) / 0x5) +
                    (-parseInt(_0x5486bd(0x19f)) / 0x6) *
                      (parseInt(_0x5486bd(0x19c)) / 0x7) +
                    -parseInt(_0x5486bd(0x198)) / 0x8 +
                    (parseInt(_0x5486bd(0x19d)) / 0x9) *
                      (parseInt(_0x5486bd(0x190)) / 0xa) +
                    -parseInt(_0x5486bd(0x19b)) / 0xb;
                  if (_0x33a69b === _0x37e691) break;
                  else _0x455052["push"](_0x455052["shift"]());
                } catch (_0x5d0240) {
                  _0x455052["push"](_0x455052["shift"]());
                }
              }
            })(_0x3465, 0x5f175);
            function _0x3465() {
              const _0x59e589 = [
                "type",
                "10YbntjM",
                "142rOhRZj",
                "22035oWMmNm",
                "270115YHflHc",
                "senderID",
                "handle",
                "391744OdZdiI",
                "getCurrentUserID",
                "messageReply",
                "6269065DVThRo",
                "1568NfvHpu",
                "18hPSlRo",
                "./scr/cmd/",
                "2754luGtQA",
                "message_reply",
                "138784sSUeeH",
                "1944870eLWMBj",
              ];
              _0x3465 = function () {
                return _0x59e589;
              };
              return _0x3465();
            }
            if (event[_0x58d9a2(0x191)] == _0x58d9a2(0x1a0)) {
              if (
                event[_0x58d9a2(0x19a)][_0x58d9a2(0x196)] ===
                api[_0x58d9a2(0x199)]()
              ) {
                const cmd =
                  global[_0x58d9a2(0x197)]["replies"][
                    event[_0x58d9a2(0x19a)]["messageID"]
                  ];
                if (cmd) {
                  const { threadID, senderID, messageID, body } = event,
                    replier = {
                      event: event,
                      data: {
                        msg: body,
                        tid: threadID,
                        mid: messageID,
                        uid: senderID,
                      },
                      received: cmd,
                    };
                  require(_0x58d9a2(0x19e) + cmd["cmdname"])["startReply"]({
                    api: api,
                    replier: replier,
                    event: event,
                  });
                  return;
                } else return;
              }
            } // end of message reply
          } // end of file ends with .js
        } // end of loop file
      } // end of event body null
      const { threadID, logMessageType, logMessageData } = event;
      if (logMessageType == "log:thread-admins") {
        if (logMessageData.ADMIN_EVENT == "add_admin") {
          let uid = logMessageData.TARGET_ID;
          let msg = "This user added as a group admin.";
          return api.shareContact(msg, uid, threadID);
        } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
          let uid = logMessageData.TARGET_ID;
          let msg = "This user removed as a group admin.";
          return api.shareContact(msg, uid, threadID);
        }
      } // end of add and remove as admin
      if (logMessageType == "log:user-nickname") {
        let uid = logMessageData.participant_id;
        if (uid == api.getCurrentUserID()) return;
        let msg = `User change nickname to: ${logMessageData.nickname.length == 0 ? "original name" : logMessageData.nickname}`;
        api.shareContact(msg, uid, threadID);
      } // end of change nickname
      if (logMessageType == "log:thread-name") {
        let msg =
          "Group name changed to " + logMessageData.name ||
          "Clear the group name";
        let uid = logMessageData.author;
        return api.shareContact(msg, uid, threadID);
      } // end of change group name
      if (logMessageType == "log:thread-icon") {
        let em = logMessageData.thread_icon || "👍";
        let msg = `Group emoji changed to ${em}`;
        let uid = logMessageData.author;
        return api.shareContact(msg, uid, threadID);
      } // end of change group emoji
      if (logMessageType == "log:subscribe") {
        const { threadID } = event;
        let { threadName, participantIDs } = await api.getThreadInfo(threadID);
        if (
          event.logMessageData.addedParticipants.some(
            (i) => i.userFbId == api.getCurrentUserID(),
          )
        ) {
          // const authorName = (await api.getUserInfo(event.author)).name;
          const authorName = "https://facebook.com/" + event.author;
          api.changeNickname(
            `${global.deku.BOTNAME} • [ ${global.deku.PREFIX} ]`,
            event.threadID,
            api.getCurrentUserID(),
          );
          const first = `██████╗ 
██╔══██╗
██████╔╝
██╔══██╗
██████╔╝
╚═════╝ \n`;
          const second = `██████╗ 
██╔═══██╗
██║        ██║
██║        ██║
╚██████╔╝
 ╚═════╝ \n`;
          const third = `████████╗
╚══██╔══╝
        ██║   
        ██║   
        ██║   
        ╚═╝\n`;
          const fourth = `██████╗ 
██╔══██╗
██████╔╝
██╔══██╗
██████╔╝
╚═════╝ 
        
 ██████╗ 
██╔═══██╗
██║         ██║
██║         ██║
╚██████╔╝
 ╚═════╝ 
         
████████╗
╚══██╔══╝
         ██║   
         ██║   
         ██║   
        ╚═╝\n𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚜𝚞𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢!\n\n𝚃𝚢𝚙𝚎 "${global.deku.PREFIX}help" 𝚝𝚘 𝚟𝚒𝚎𝚠 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.\n𝚈𝚘𝚞 𝚌𝚊𝚗 𝚞𝚗𝚜𝚎𝚗𝚝 𝚝𝚑𝚎 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚘𝚏 𝚋𝚘𝚝 𝚋𝚢 𝚛𝚎𝚊𝚌𝚝𝚒𝚗𝚐 𝚕𝚒𝚔𝚎 (👍) 𝚘𝚗 𝚒𝚝𝚜 𝚖𝚎𝚜𝚜𝚊𝚐𝚎`;
          const firstMessage = await api.sendMessage(first, threadID);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await api.editMessage(second, firstMessage.messageID, threadID);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await api.editMessage(third, firstMessage.messageID, threadID);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await api.editMessage(fourth, firstMessage.messageID, threadID);
          /*---LOGS---*/
          return api.sendMessage(
            `——[BOT LOGS]——\n\nBot has been added to a group.\n\nName: ${threadName || "Unnamed Group"}\n\nGroup ID: ${event.threadID}\n\nTotal of members: ${participantIDs.length}\n\nAdded by: https://facebook.com/${event.author}\n\n——[BOT LOGS]——`,
            global.deku.ADMINBOT[0],
          );
        } else {
          try {
            let addedParticipants1 = event.logMessageData.addedParticipants;
            for (let newParticipant of addedParticipants1) {
              let userID = newParticipant.userFbId;
              //const name = (await api.getUserInfo(parseInt(userID))).name;
              if (userID !== api.getCurrentUserID()) {
                api.shareContact(
                  `👋 Hello! Welcome to ${threadName || "this group"} 🤗, you're the ${participantIDs.length}th member on this group. Enjoy!🤗`,
                  userID,
                  threadID,
                );
              } // end of if (userID !== api.getCurrentUserID())
            } // end of for (let newParticipant of addedParticipants1)
          } catch (e) {
            return reply(e.message);
          } // end of catch
        } // end of else
      } // end of subscribe
      if (logMessageType == "log:unsubscribe") {
        let { threadName, participantIDs } = await api.getThreadInfo(
          event.threadID,
        );
        let tn = threadName || "Unnamed Group";
        if (
          event.logMessageData.leftParticipantFbId == api.getCurrentUserID()
        ) {
          const authorName = (await api.getUserInfo(event.author)).name;
          return api.sendMessage(
            `——[BOT LOGS]——\n\nBot has been kick to a group.\n\nName: ${tn}\n\nID: ${event.threadID}\n\nKicked by: ${authorName}\n\n[ f ]: https://facebook.com/${event.author}\n\n——[BOT LOGS]——`,
            global.deku.ADMINBOT[0],
          );
        } else {
          const type =
            event.author == event.logMessageData.leftParticipantFbId
              ? "left the group."
              : "kicked by the Admin of group.";
          /*const namee = (await Users(event.logMessageData.leftParticipantFbId))
            .name; // api.getUserInfo(event.logMessageData.leftParticipantFbId)*/
          return api.shareContact(
            "Member" +
              " has been " +
              type +
              "\n" +
              tn +
              " now has have " +
              participantIDs.length +
              " members left.",
            event.logMessageData.leftParticipantFbId,
            event.threadID,
          );
        } // end of else
      } // end of unsubscribe
    }); // end of listenMqtt
  }, // async function (err, api)
); // end of X

/* 
THIS BOT WAS MADE BY DEKU
CONTACT ME ON FACEBOOK: https://facebook.com/joshg101
*/
