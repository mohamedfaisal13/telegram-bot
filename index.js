const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const botToken = "6374732921:AAFVYpYVFEb1Hpn2hv3XPJO7ZWuTLLy2H_4";
const bot = new TelegramBot(botToken, { polling: true });

const wikipediaApiUrl =
  "https://en.wikipedia.org/api/rest_v1/page/random/summary";

async function getRandomWikiArticle() {
  try {
    const response = await axios.get(wikipediaApiUrl, { timeout: 5000 });
    const data = await response.data;
    if (
      !data ||
      !data.title ||
      !data.extract ||
      !data.content_urls ||
      !data.content_urls.desktop ||
      !data.content_urls.desktop.page
    ) {
      throw new Error("Invalid data received from Wikipedia API.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching random Wikipedia article:");
    return null;
  }
}

const chatId = "6152839232";
function postToTelegramGroup(chatId, article) {
  const escapedTitle = article.title.replace(/[-.]/g, "\\$&");
  const escapedExtract = article.extract.replace(/[-.]/g, "\\$&");

  const message = `
    *${escapedTitle}*
    
    ${escapedExtract}
    
    Read more: [${escapedTitle}](${article.content_urls.desktop.page})
  `;

  bot
    .sendMessage(chatId, message, { parse_mode: "MarkdownV2" })
    .then(() => {
      console.log("Article sent to the Telegram group.");
    })
    .catch((error) => {
      console.error("Error posting article to the Telegram group:");
    });
}

bot.onText(/\/send_random_wiki/, async (msg) => {
  const article = await getRandomWikiArticle();

  if (article) {
    postToTelegramGroup(chatId, article);
  } else {
    bot.sendMessage(
      chatId,
      "Sorry, there was an error fetching the Wikipedia article."
    );
  }
});
