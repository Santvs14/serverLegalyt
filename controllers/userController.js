// userController.js

const { generateVerificationCode } = require('../utils/verificationCode');
const verificationCache = new Map(); // Para almacenar temporalmente los códigos
const { sendVerifyCode } = require('../utils/twilioServic');

// Enviar código de verificación
exports.sendVerificationCode = async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;

    const result = await sendVerifyCode(phoneNumber, verificationCode);

    if (result.success) {

        return res.status(400).json({ message: "Número de teléfono es requerido" });
    }

    try {
        const { code, expiresAt } = generateVerificationCode();

        // Almacenar el código asociado al número en un almacenamiento temporal (como Redis o una base de datos)
        verificationCache.set(phoneNumber, { code, expiresAt });

        // Aquí llamas al servicio de Twilio o similar para enviar el código
        // await twilioService.sendCode(phoneNumber, code);

        res.status(200).json({ message: "Código enviado", expiresAt });
    } catch (error) {
        console.error("Error enviando código:", error);
        res.status(500).json({ message: "Error al enviar el código de verificación" });
    }
};

// Verificar el código de verificación
exports.verifyCode = async (req, res) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ message: "Teléfono y código son requeridos" });
    }

    try {
        const verificationData = verificationCache.get(phoneNumber);

        if (!verificationData) {
            return res.status(400).json({ message: "Código no encontrado o expirado" });
        }

        const { code: storedCode, expiresAt } = verificationData;

        if (Date.now() > new Date(expiresAt)) {
            verificationCache.delete(phoneNumber); // Limpia el código expirado
            return res.status(400).json({ message: "El código ha expirado" });
        }

        if (storedCode !== code) {
            return res.status(400).json({ message: "El código es incorrecto" });
        }

        // Código válido, puedes marcarlo como verificado
        verificationCache.delete(phoneNumber); // Limpia el código después de su uso

        res.status(200).json({ message: "Código verificado correctamente" });
    } catch (error) {
        console.error("Error verificando código:", error);
        res.status(500).json({ message: "Error al verificar el código" });
    }
};
