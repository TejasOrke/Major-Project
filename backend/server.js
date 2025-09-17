require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express(); // moved up BEFORE app.use

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  credentials: true
}));

// Routes imports
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const lorRoutes = require("./routes/lorRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const placementRoutes = require("./routes/placementRoutes");
const lorTemplateRoutes = require("./routes/lorTemplateRoutes");
const aiLorRoutes = require("./routes/aiLorRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/lors", lorRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/lor-templates", lorTemplateRoutes);
app.use("/api/lor", aiLorRoutes); // unified AI LOR endpoints
// (Remove the earlier misplaced app.use before app was defined)

// Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories
['./uploads/offerLetters', './uploads/lors', './assets'].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

mongoose.connection.on("error", err => {
  console.error("❌ MongoDB Disconnected! Error:", err);
});

process.on("SIGINT", async () => {
  console.log("🔴 Closing MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));