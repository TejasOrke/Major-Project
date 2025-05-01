const mongoose = require("mongoose");

const PlacementSchema = new mongoose.Schema({
  student: {
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
  package: {
    type: String,
    required: true
  },
  placementDate: {
    type: Date,
    required: true
  },
  offerLetter: {
    type: String // Path to uploaded offer letter
  }
}, { timestamps: true });

module.exports = mongoose.model("Placement", PlacementSchema);