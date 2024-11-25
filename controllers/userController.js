const express = require('express');
const User = require('../models/User');  // Modelo de usuario
const Verification = require('../models/Verification');  // Modelo para almacenar códigos de verificación
const sendVerificationEmail = require('../utils/sendVerifyEmail');  // Ruta del archivo de verificación (actualízalo si es necesario)

// Función para enviar el código de verificación al correo electrónico
const sendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Correo electrónico es obligatorio' });
    }

    try {
        // Generar el código de verificación
        const { code, expiresAt } = sendVerificationEmail(email);  // Aquí generas el código y lo envías

        // Guarda el código de verificación en la base de datos
        await Verification.create({ email, verificationCode: code, expiresAt });

        res.status(200).json({ message: 'Código de verificación enviado a tu correo.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el código', error });
    }
};

// Función para verificar el código de verificación del usuario
const verifyUser = async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Correo electrónico y código requeridos' });
    }

    try {
        // Buscar el código de verificación en la base de datos
        const verificationRecord = await Verification.findOne({ email, verificationCode });

        if (!verificationRecord) {
            return res.status(400).json({ message: 'Código de verificación incorrecto' });
        }

        // Verificar si el código ha expirado
        if (verificationRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: 'El código ha expirado' });
        }

        // Marcar al usuario como verificado (si existe)
        const user = await User.findOne({ email });
        if (user) {
            user.isVerified = true;  // Suponiendo que tienes un campo 'isVerified' en tu modelo de usuario
            await user.save();
        }

        // Eliminar el código de verificación de la base de datos
        await Verification.deleteOne({ _id: verificationRecord._id });

        res.status(200).json({ message: 'Código de verificación exitoso. Usuario verificado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el código', error });
    }
};

module.exports = { sendCode, verifyUser };
