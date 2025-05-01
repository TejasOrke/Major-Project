require("dotenv").config({ path: "./.env" }); // Explicitly load .env file

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const lorRoutes = require("./routes/lorRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const placementRoutes = require("./routes/placementRoutes");

const app = express();

app.use(express.json());

// Allow only specific frontend origins (optional security improvement)
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",  // Use .env for frontend origin
  credentials: true
}));

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/lors", lorRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/placements", placementRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make sure the uploads directory exists
const dir = './uploads/offerLetters';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// MongoDB Connection with Better Error Handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit process if DB connection fails
  });

// Handle MongoDB disconnection errors
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Disconnected! Error:", err);
});

// Handle process termination (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("🔴 Closing MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));