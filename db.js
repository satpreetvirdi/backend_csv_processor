const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gfsBucket;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected");

    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}

function getGridFSBucket() {
  if (!gfsBucket) throw new Error("GridFSBucket is not initialized.");
  return gfsBucket;
}

module.exports = { connectDB, getGridFSBucket };
