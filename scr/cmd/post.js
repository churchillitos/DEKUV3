module.exports = {
  config: {
    name: "post",
    description: "Create a new post in acc bot.",
    usage: "1 [audience] | [message content]",
    cooldown: 5,
    accessableby: 1, // 0 = everyone, 1 = admins, 2 = bot owner/admin
    category: "Tiện ích",
    prefix: true
  },
  start: async function ({ api, text, react, event, reply }) {
    const { threadID, messageID } = event;
    const uuid = getGUID();

    const formData = {
      "input": {
        "composer_entry_point": "inline_composer",
        "composer_source_surface": "timeline",
        "idempotence_token": uuid + "_FEED",
        "source": "WWW",
        "attachments": [],
        "audience": {
          "privacy": {
            "allow": [],
            "base_state": "FRIENDS",
            "deny": [],
            "tag_expansion_state": "UNSPECIFIED"
          }
        },
        "message": {
          "ranges": [],
          "text": ""
        },
        "with_tags_ids": [],
        "inline_activities": [],
        "explicit_place_id": "0",
        "text_format_preset_id": "0",
        "logging": {
          "composer_session_id": uuid
        },
        "tracking": [null],
        "actor_id": api.getCurrentUserID(),
        "client_mutation_id": Math.floor(Math.random() * 17)
      },
      "displayCommentsFeedbackContext": null,
      "displayCommentsContextEnableComment": null,
      "displayCommentsContextIsAdPreview": null,
      "displayCommentsContextIsAggregatedShare": null,
      "displayCommentsContextIsStorySet": null,
      "feedLocation": "TIMELINE",
      "feedbackSource": 0,
      "focusCommentID": null,
      "gridMediaWidth": 230,
      "groupID": null,
      "scale": 3,
      "privacySelectorRenderLocation": "COMET_STREAM",
      "renderLocation": "timeline",
      "useDefaultActor": false,
      "inviteShortLinkKey": null,
      "isFeed": false,
      "isFundraiser": false,
      "isFunFactPost": false,
      "isGroup": false,
      "isTimeline": true,
      "isSocialLearning": false,
      "isPageNewsFeed": false,
      "isProfileReviews": false,
      "isWorkSharedDraft": false,
      "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
      "hashtag": null,
      "canUserManageOffers": false
    };

    const audienceOptions = {
      "1": "EVERYONE",
      "2": "FRIENDS",
      "3": "SELF"
    };

    const [audienceChoice, ...contentArray] = text;
    const content = contentArray.join(" ");

    if (!audienceOptions[audienceChoice]) {
      return reply("Invalid audience choice. Please choose 1, 2, or 3.");
    }

    formData.input.audience.privacy.base_state = audienceOptions[audienceChoice];
    formData.input.message.text = content;

    try {
      const postResult = await createPost(api, formData);
      reply(`Post created successfully:\nPost ID: ${postResult.postID}\nPost URL: ${postResult.postURL}`);
    } catch (error) {
      console.error("Error creating post:", error);
      reply("Failed to create post. Please try again later.");
    }
  },
  auto: async function ({ event, reply }) {
    // No auto functionality is provided in the original code.
  }
};

async function createPost(api, formData) {
  return new Promise((resolve, reject) => {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "7711610262190099",
      variables: JSON.stringify(formData)
    };

    api.httpPost('https://www.facebook.com/api/graphql/', form, (error, result) => {
      if (error) {
        reject(error);
      } else {
        try {
          const responseData = JSON.parse(result.replace("for (;;);", ""));
          const postID = responseData.data.story_create.story.legacy_story_hideable_id;
          const postURL = responseData.data.story_create.story.url;
          resolve({ postID, postURL });
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

function getGUID() {
  var sectionLength = Date.now();
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
    return _guid;
  });
  return id;
}
