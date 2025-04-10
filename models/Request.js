const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  outputCsvUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", RequestSchema);
