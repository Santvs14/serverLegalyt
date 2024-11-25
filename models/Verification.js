const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  verificationCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Verification = mongoose.model('Verification', verificationSchema);

module.exports = Verification;
