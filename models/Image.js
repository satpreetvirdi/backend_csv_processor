const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  productName: { type: String, required: true },
  inputUrls: { type: [String], required: true },
  outputUrls: { type: [String], default: [] },
});

module.exports = mongoose.model("Image", imageSchema);
