// utils/verificationCode.js

function generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000); // Genera un número entre 100000 y 999999
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutos desde ahora
    return { code, expiresAt };
}

module.exports = { generateVerificationCode };
