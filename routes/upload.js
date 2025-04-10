const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const axios = require("axios");
const Image = require("../models/Image");
const Request = require("../models/Request");
const streamifier = require("streamifier");
const supabase = require("../supaBaseclient");

const router = express.Router();



const compressImageAndUploadToSupabase = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = response.data;

    const compressedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();

    const uniqueFileName = `compressed/${uuidv4()}.jpg`;
    const { data, error } = await supabase.storage
      .from("csvstorage")
      .upload(uniqueFileName, compressedBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw new Error(error.message);
    return supabase.storage.from("csvstorage").getPublicUrl(data.path).data.publicUrl;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
};


const processCsv = async (buffer, requestId) => {
  try {
    const results = [];
    const bufferStream = streamifier.createReadStream(buffer);

    bufferStream.pipe(csv()).on("data", (data) => results.push(data)).on("end", async () => {
      try {
        let completedCount = 0;

        const processingPromises = results.map(async (row) => {
          if (!row["Input Image Urls"] || !row["Product Name"]) return;

          const inputUrls = row["Input Image Urls"].split(",");
          const compressedImageUrls = await Promise.all(
            inputUrls.map((url) => compressImageAndUploadToSupabase(url))
          );

          const imageRecord = new Image({
            requestId,
            productName: row["Product Name"],
            inputUrls,
            outputUrls: compressedImageUrls,
          });

          await imageRecord.save();
          completedCount++;
        });

        await Promise.all(processingPromises);


        await Request.findOneAndUpdate({ requestId }, { status: "completed" });
      } catch (err) {
        console.error("CSV Processing Error:", err);
        await Request.findOneAndUpdate({ requestId }, { status: "failed" });
      }
    });
  } catch (err) {
    console.error("Error processing CSV:", err);
    await Request.findOneAndUpdate({ requestId }, { status: "failed" });
  }
};


router.post("/", async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CSV file is required" });

  const requestId = uuidv4();

  try {

    await new Request({ requestId }).save();


    processCsv(req.file.buffer, requestId);


    res.json({ requestId, message: "File is being processed in the background" });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Failed to start processing" });
  }
});

module.exports = router;
