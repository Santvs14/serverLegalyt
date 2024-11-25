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
        const { code, expiresAt } = sendVerificationEmail(email);

        // Guarda el código de verificación en la base de datos
        const verificationRecord = await Verification.create({ email, verificationCode: code, expiresAt });
        console.log('Código de verificación guardado en la base de datos:', verificationRecord);

        res.status(200).json({ message: 'Código de verificación enviado a tu correo.' });
    } catch (error) {
        console.error('Error al enviar el código:', error);
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
        console.log('Datos recibidos en verifyUser:', req.body);

        // Buscar el registro en la base de datos
        const verificationRecord = await Verification.findOne({
            email: email.trim().toLowerCase(),
            verificationCode: verificationCode.trim(),
        });

        if (!verificationRecord) {
            console.error('Código de verificación no encontrado:', { email, verificationCode });
            return res.status(400).json({ message: 'Código incorrecto o no encontrado' });
        }

        console.log('Código encontrado:', verificationRecord);

        if (new Date(verificationRecord.expiresAt) < new Date()) {
            console.error('Código expirado:', verificationRecord.expiresAt);
            return res.status(400).json({ message: 'El código ha expirado' });
        }

        res.status(200).json({ message: 'Usuario verificado con éxito' });
    } catch (error) {
        console.error('Error al verificar el usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};



module.exports = { sendCode, verifyUser };
