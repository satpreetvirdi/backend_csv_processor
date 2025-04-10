const axios = require("axios");

async function notifyWebhook(requestId) {
  await axios.post("https://your-webhook-endpoint.com", { requestId });
}

module.exports = { notifyWebhook };
