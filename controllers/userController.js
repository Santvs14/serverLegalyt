const express = require('express');
const Verification = require('../models/Verification');
const sendVerificationEmail = require('../utils/sendVerifyEmail');

// Enviar código de verificación
const sendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Correo electrónico es obligatorio.' });
    }

    try {
        const { code, expiresAt } = await sendVerificationEmail(email);

        // Guardar el código en la base de datos
        const verificationRecord = new Verification({
            email: email.trim().toLowerCase(),
            verificationCode: code,
            expiresAt
        });

        await verificationRecord.save();
        console.log('Código guardado:', verificationRecord);
        res.status(200).json({ message: 'Código enviado con éxito.' });
    } catch (error) {
        console.error('Error al enviar el código:', error);
        res.status(500).json({ message: 'Error al enviar el código.', error: error.message });
    }
};

// Verificar código de usuario
const verifyUser = async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Correo electrónico y código son obligatorios.' });
    }

    try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedCode = verificationCode.trim();

        // Buscar el código en la base de datos
        const verificationRecord = await Verification.findOne({
            email: trimmedEmail,
            verificationCode: trimmedCode
        });

        if (!verificationRecord) {
            console.error('Registro no encontrado:', { email: trimmedEmail, code: trimmedCode });
            return res.status(400).json({ message: 'Código incorrecto o no encontrado.' });
        }

        // Verificar expiración
        if (Date.now() > new Date(verificationRecord.expiresAt).getTime()) {
            console.error('El código ha expirado:', verificationRecord);
            return res.status(400).json({ message: 'El código ha expirado.' });
        }

        console.log('Usuario verificado:', { email: trimmedEmail });
        res.status(200).json({ message: 'Usuario verificado con éxito.' });
    } catch (error) {
        console.error('Error al verificar el código:', error);
        res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
    }
};

module.exports = { sendCode, verifyUser };
