// models/LORRequest.js - update existing model
const mongoose = require("mongoose");

const LORRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending"
  },
  remarks: {
    type: String
  },
  generatedContent: {
    type: String
  },
  templateUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LORTemplate"
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  finalPDF: {
    type: String // Path to generated PDF file
  }
}, { timestamps: true });

module.exports = mongoose.model("LORRequest", LORRequestSchema);