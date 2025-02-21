const mongoose = require("mongoose");

const lorSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lorDocument: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    remarks: {
        type: String
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("LOR", lorSchema);