const express = require("express");
const Request = require("../models/Request");
const Image = require("../models/Image");

const router = express.Router();

router.get("/:requestId", async (req, res) => {
  const request = await Request.findOne({ requestId: req.params.requestId });

  if (!request) return res.status(404).json({ error: "Request not found" });

  if (request.status === "completed") {
    const images = await Image.find({ requestId: req.params.requestId });
    res.json({ status: request.status, images });
  } else {
    res.json({ status: request.status });
  }
});

module.exports = router;
