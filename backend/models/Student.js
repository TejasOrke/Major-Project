const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    admitCard: { type: String }, // File path for admit card
    internships: [
        {
            company: String,
            duration: String,
            status: String // Pending, Completed, Ongoing
        }
    ],
    placement: {
        company: String,
        package: String,
        offerLetter: String // File path for offer letter
    },
    lorRecommendations: [
        {
            faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            purpose: String,
            university: String,
            program: String,
            status: { type: String, enum: ["draft", "approved", "rejected"], default: "draft" },
            remarks: String,
            issuedAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
