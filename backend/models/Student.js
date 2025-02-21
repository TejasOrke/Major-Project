const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: String,
    rollNo: { type: String, unique: true, required: true },
    email: String,
    department: String,
    admitCard: String,  // File path for admit card
    internships: [
        {
            company: String,
            duration: String,
            status: String  // Pending, Completed, Ongoing
        }
    ],
    placement: {
        company: String,
        package: String,
        offerLetter: String  // File path for offer letter
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
