const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    semester: { type: Number },
    program: { type: String },
    cgpa: { type: Number, min: 0, max: 10 },
    skills: { type: [String], default: [] },
    admitCard: { type: String }, // File path for admit card (stored under uploads)
    internships: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
        stipend: Number,
        status: {
          type: String,
          enum: ["Applied", "Ongoing", "Completed", "Terminated"],
        },
      },
    ],
    placement: {
      company: String,
      package: String,
      offerLetter: String, // File path for offer letter
    },
    lorRecommendations: [
      {
        faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        purpose: String,
        university: String,
        program: String,
        status: {
          type: String,
          enum: ["draft", "approved", "rejected"],
          default: "draft",
        },
        remarks: String,
        issuedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
