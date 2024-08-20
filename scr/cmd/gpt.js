module.exports = {
  config: {
    name: "gpt", 
    description: "Generates a response from GPT-4 based on the user's input.",
    usage: "gpt [your prompt]", 
    cooldown: 5, 
    accessableby: 0, 
    category: "AI", 
    prefix: true, 
    author: "Churchill" 
  },
  start: async function ({ api, text, event, reply, axios }) {
    // Combine the user's input into a single prompt string
    const userPrompt = text.join(" ");

    // Construct the API URL with the prompt and user ID
    const apiUrl = `https://markdevs-last-api-2epw.onrender.com/gpt4?prompt=${encodeURIComponent(userPrompt)}&uid=${event.senderID}`;

    try {
      // Make the request to the GPT-4 API
      const response = await axios.get(apiUrl);

      // Extract the GPT-4 response from the API's JSON response
      const gptResponse = response.data.gpt4;

      // Send the GPT-4 response back to the user
      reply(gptResponse);

      // Listen for the user's next message to continue the conversation
      api.listen(async (responseEvent) => {
        // If the user replies to the GPT-4 response
        if (responseEvent.senderID === event.senderID && responseEvent.threadID === event.threadID) {
          // Use the previous GPT response as context for the next prompt
          const continuedPrompt = `${gptResponse}\n${responseEvent.body}`;
          const continuedApiUrl = `https://markdevs-last-api-2epw.onrender.com/gpt4?prompt=${encodeURIComponent(continuedPrompt)}&uid=${responseEvent.senderID}`;

          // Make another request to the GPT-4 API
          const continuedResponse = await axios.get(continuedApiUrl);

          // Get and send the next GPT-4 response
          const continuedGptResponse = continuedResponse.data.gpt4;
          reply(continuedGptResponse);
        }
      });
    } catch (error) {
      // Handle any errors that occur during the API request
      reply("Sorry, something went wrong while communicating with the GPT-4 API.");
      console.error(error);
    }
  }
}
