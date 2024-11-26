const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    expiresInMinutes: { type: Number, required: true }, // Cambiar de fecha a minutos

    createdAt: { type: Date, default: Date.now } // Fecha de creación

});

module.exports = mongoose.model('Verification', verificationSchema);
