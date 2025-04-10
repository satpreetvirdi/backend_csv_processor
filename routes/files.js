const express = require("express");
const { getGridFSBucket } = require("../db");

const router = express.Router();

router.get("/:filename", async (req, res) => {
  const gfsBucket = getGridFSBucket();
  const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);

  downloadStream.on("error", (err) => {
    console.error("GridFS Download Error:", err);
    res.status(404).json({ error: "File not found" });
  });

  res.setHeader("Content-Type", "image/jpeg");
  downloadStream.pipe(res);
});

module.exports = router;
