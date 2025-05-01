const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  company: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String
  },
  stipend: {
    type: Number
  },
  status: {
    type: String,
    enum: ["Applied", "Ongoing", "Completed", "Terminated"],
    default: "Applied"
  }
}, { timestamps: true });

module.exports = mongoose.model("Internship", InternshipSchema);