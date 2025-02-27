const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    requestedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PendingUser', PendingUserSchema);
