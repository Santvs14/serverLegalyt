const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Verification', verificationSchema);
