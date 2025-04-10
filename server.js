require("dotenv").config();
const express = require("express");
const { connectDB } = require("./db");
const uploadRoutes = require("./routes/upload");
const statusRoutes = require("./routes/status");
const fileRoutes = require("./routes/files");
const downloadCsv = require("./routes/downloadCsv");
const path = require("path");
connectDB();
const app = express();
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/download",downloadCsv);
// app.use("/api/download_csv",express.static(path.join(__dirname, "downloads")));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
