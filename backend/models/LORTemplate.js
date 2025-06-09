// models/LORTemplate.js
const mongoose = require("mongoose");

const LORTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("LORTemplate", LORTemplateSchema);